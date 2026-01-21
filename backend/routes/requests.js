import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

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

    // Check if item already has an approved request (prevent multiple approvals)
    const existingApprovedRequest = await prisma.request.findFirst({
      where: {
        itemId: request.itemId,
        status: 'Approved',
        id: { not: id } // Exclude current request
      }
    });

    if (existingApprovedRequest) {
      return res.status(400).json({
        message: 'This item already has an approved request. You can only approve one request per item.'
      });
    }

    // Use transaction to update both request and item status atomically
    const [updated] = await prisma.$transaction([
      prisma.request.update({
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
      }),
      // Automatically update item status to CLAIMED
      prisma.item.update({
        where: { id: request.itemId },
        data: { status: 'CLAIMED' }
      })
    ]);

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

/**
 * DELETE /api/requests/:id
 * Cancel a request (only requester can cancel, cannot cancel if approved)
 * Protected route
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const request = await prisma.request.findUnique({
      where: { id }
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Check if user is the requester
    if (request.userId !== userId) {
      return res.status(403).json({
        message: 'You can only cancel your own requests.'
      });
    }

    // Prevent cancellation if request is approved
    if (request.status === 'Approved') {
      return res.status(400).json({
        message: 'Cannot cancel an approved request.'
      });
    }

    // Delete the request
    await prisma.request.delete({
      where: { id }
    });

    res.json({ message: 'Request cancelled successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
