import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/requests
 * Create a new request for an item
 * Protected route
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { itemId, message } = req.body;
    const userId = req.user.id;

    if (!itemId) {
      return res.status(400).json({ message: 'itemId is required.' });
    }

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Check if user is requesting their own item
    if (item.ownerId === userId) {
      return res.status(400).json({ 
        message: 'You cannot request your own item.' 
      });
    }

    // Create request
    const request = await prisma.request.create({
      data: {
        itemId,
        userId,
        message: message || null,
        status: 'Pending'
      },
      include: {
        item: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                picture: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true
          }
        }
      }
    });

    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/requests/my
 * Get requests made by current user
 * Protected route
 */
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const requests = await prisma.request.findMany({
      where: { userId },
      include: {
        item: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                picture: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ requests });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/requests/:id/approve
 * Approve a request (owner or admin only)
 * Protected route
 */
router.patch('/:id/approve', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const request = await prisma.request.findUnique({
      where: { id },
      include: { item: true }
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Check if user is owner or admin
    if (request.item.ownerId !== userId && !isAdmin) {
      return res.status(403).json({ 
        message: 'Only the item owner or admin can approve requests.' 
      });
    }

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
                email: true,
                picture: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true
          }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/requests/:id/reject
 * Reject a request (owner or admin only)
 * Protected route
 */
router.patch('/:id/reject', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const request = await prisma.request.findUnique({
      where: { id },
      include: { item: true }
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Check if user is owner or admin
    if (request.item.ownerId !== userId && !isAdmin) {
      return res.status(403).json({ 
        message: 'Only the item owner or admin can reject requests.' 
      });
    }

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
                email: true,
                picture: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true
          }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
