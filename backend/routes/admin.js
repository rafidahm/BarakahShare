import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Get overall site statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, totalItems, totalRequests, pendingRequests] = await Promise.all([
      prisma.user.count(),
      prisma.item.count(),
      prisma.request.count(),
      prisma.request.count({ where: { status: 'Pending' } })
    ]);

    const itemsByCategory = await prisma.item.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    const itemsByType = await prisma.item.groupBy({
      by: ['type'],
      _count: { type: true }
    });

    const requestsByStatus = await prisma.request.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    res.json({
      totalUsers,
      totalItems,
      totalRequests,
      pendingRequests,
      itemsByCategory: itemsByCategory.map(item => ({
        category: item.category,
        count: item._count.category
      })),
      itemsByType: itemsByType.map(item => ({
        type: item.type,
        count: item._count.type
      })),
      requestsByStatus: requestsByStatus.map(req => ({
        status: req.status,
        count: req._count.status
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get('/users', async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
          department: true,
          semester: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              items: true,
              requests: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({ users, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/users/:id/role
 * Update user role
 */
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "admin" or "user".' });
    }

    // Prevent admin from removing their own admin status
    if (id === req.user.id && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin status.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/items
 * Get all items with pagination
 */
router.get('/items', async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, search, category, status } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category) {
      where.category = category;
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              requests: true
            }
          }
        }
      }),
      prisma.item.count({ where })
    ]);

    res.json({ items, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/items/:id
 * Delete an item (admin only)
 */
router.delete('/items/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.item.delete({
      where: { id }
    });

    res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Item not found.' });
    }
    next(error);
  }
});

/**
 * GET /api/admin/requests
 * Get all requests with pagination
 */
router.get('/requests', async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              picture: true
            }
          },
          item: {
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.request.count({ where })
    ]);

    res.json({ requests, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/requests/:id/approve
 * Approve a request (admin override)
 */
router.patch('/requests/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await prisma.request.update({
      where: { id },
      data: { status: 'Approved' },
      include: {
        item: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Request not found.' });
    }
    next(error);
  }
});

/**
 * PATCH /api/admin/requests/:id/reject
 * Reject a request (admin override)
 */
router.patch('/requests/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await prisma.request.update({
      where: { id },
      data: { status: 'Rejected' },
      include: {
        item: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Request not found.' });
    }
    next(error);
  }
});

/**
 * DELETE /api/admin/requests/:id
 * Delete a request (admin only)
 */
router.delete('/requests/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.request.delete({
      where: { id }
    });

    res.json({ message: 'Request deleted successfully.' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Request not found.' });
    }
    next(error);
  }
});

export default router;
