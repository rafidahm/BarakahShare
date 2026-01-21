import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Helper function to normalize imageUrl (convert relative paths to full URLs)
const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) return imageUrl;
  // If it's a relative path starting with /uploads, convert to full URL
  if (imageUrl.startsWith('/uploads/')) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const apiBase = baseUrl.replace(':5173', ':4000');
    return `${apiBase}${imageUrl}`;
  }
  // If it's just a filename, construct full URL
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const apiBase = baseUrl.replace(':5173', ':4000');
  return `${apiBase}/uploads/items/${imageUrl}`;
};

// Helper function to transform items' imageUrl
const transformItem = (item) => {
  if (!item) return item;
  return {
    ...item,
    imageUrl: normalizeImageUrl(item.imageUrl)
  };
};

// Helper function to transform array of items
const transformItems = (items) => {
  return items.map(transformItem);
};

/**
 * GET /api/items
 * Get paginated items with optional filters
 * Query params: category, type, q (search), limit, offset
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, type, q, limit = 20, offset = 0 } = req.query;

    const where = {};

    if (category) {
      where.category = category;
    }

    if (type && (type === 'Donate' || type === 'Lend')) {
      where.type = type;
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } }
      ];
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
              email: true,
              picture: true
            }
          },
          requests: {
            select: {
              status: true
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

    res.json({
      items: transformItems(items),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/items/:id
 * Get single item detail
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true
          }
        },
        requests: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                picture: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    res.json(transformItem(item));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/items
 * Create new item (with optional photo upload)
 * Protected route
 */
router.post('/', authenticate, uploadItem, async (req, res, next) => {
  try {
    const { name, category, condition, type, description, imageUrl, contact } = req.body;
    const ownerId = req.user.id;

    // Validation
    if (!name || !category || !condition || !type || !contact) {
      return res.status(400).json({
        message: 'Missing required fields: name, category, condition, type, contact'
      });
    }

    if (type !== 'Donate' && type !== 'Lend') {
      return res.status(400).json({
        message: 'Type must be either "Donate" or "Lend"'
      });
    }

    // Determine image URL: uploaded file takes precedence, then provided URL
    let finalImageUrl = null;
    if (req.file) {
      finalImageUrl = getItemImageUrl(req.file.filename);
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
    }

    const item = await prisma.item.create({
      data: {
        name,
        category,
        condition,
        type,
        description: description || null,
        imageUrl: finalImageUrl,
        contact,
        ownerId
      },
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
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/items/:id
 * Update item details (only if status is AVAILABLE)
 * Protected route - only owner can update
 */
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, category, condition, description, contact } = req.body;

    // Get item
    const item = await prisma.item.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Check if user is owner
    if (item.ownerId !== userId) {
      return res.status(403).json({
        message: 'Only the item owner can update this item.'
      });
    }

    // Only allow updates if status is AVAILABLE
    if (item.status !== 'AVAILABLE') {
      return res.status(400).json({
        message: `Cannot update item. Item status is ${item.status}. You can only update items with status AVAILABLE.`
      });
    }

    // Update item
    const updated = await prisma.item.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(condition && { condition }),
        ...(description !== undefined && { description }),
        ...(contact && { contact })
      },
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
    });

    res.json(transformItem(updated));
  } catch (error) {
    next(error);
  }
});


/**
 * PATCH /api/items/:id/status
 * Update item status
 * Protected route - only owner can update
 */
router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validate status
    const validStatuses = ['AVAILABLE', 'CLAIMED', 'IN_USE', 'COMPLETED', 'RETURNED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Get item
    const item = await prisma.item.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Check if user is owner
    if (item.ownerId !== userId) {
      return res.status(403).json({
        message: 'Only the item owner can update status.'
      });
    }

    // Validate status transitions based on item type
    const isDonation = item.type === 'Donate';
    const isLending = item.type === 'Lend';

    if (isDonation) {
      // Donation flow: AVAILABLE → CLAIMED → COMPLETED
      const validDonationStatuses = ['AVAILABLE', 'CLAIMED', 'COMPLETED'];
      if (!validDonationStatuses.includes(status)) {
        return res.status(400).json({
          message: `For donations, status must be one of: ${validDonationStatuses.join(', ')}`
        });
      }
    } else if (isLending) {
      // Lending flow: AVAILABLE → CLAIMED → IN_USE → RETURNED (back to AVAILABLE)
      const validLendingStatuses = ['AVAILABLE', 'CLAIMED', 'IN_USE', 'RETURNED'];
      if (!validLendingStatuses.includes(status)) {
        return res.status(400).json({
          message: `For lending, status must be one of: ${validLendingStatuses.join(', ')}`
        });
      }
    }

    // Update item status
    const updated = await prisma.item.update({
      where: { id },
      data: { status },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true
          }
        },
        requests: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                picture: true
              }
            }
          }
        }
      }
    });

    res.json(transformItem(updated));
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/items/:id
 * Delete an item (only if status is AVAILABLE)
 * Protected route - only owner can delete
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get item
    const item = await prisma.item.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Check if user is owner
    if (item.ownerId !== userId) {
      return res.status(403).json({
        message: 'Only the item owner can delete this item.'
      });
    }

    // Only allow deletion if status is AVAILABLE
    if (item.status !== 'AVAILABLE') {
      return res.status(400).json({
        message: 'You can only delete items with status AVAILABLE. Items with active requests or in other states cannot be deleted.'
      });
    }

    // Delete the item
    await prisma.item.delete({
      where: { id }
    });

    res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    next(error);
  }
});


export default router;

