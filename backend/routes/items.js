import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { uploadItem, getItemImageUrl } from '../middleware/upload.js';

const router = express.Router();
const prisma = new PrismaClient();

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
      items,
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

    res.json(item);
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

export default router;
