import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { uploadProfile, getProfileImageUrl } from '../middleware/upload.js';

const router = express.Router();

/**
 * GET /api/users/me
 * Get current user info with stats
 * Protected route
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
        department: true,
        semester: true,
        whatsapp: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
            requests: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      ...user,
      itemsDonated: user._count.items,
      itemsRequested: user._count.requests
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/users/me
 * Update current user profile (department, semester, photo)
 * Protected route
 */
router.patch('/me', authenticate, uploadProfile, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { department, semester, whatsapp } = req.body;

    const updateData = {
      department: department || null,
      semester: semester || null,
      whatsapp: whatsapp || null
    };

    // If a file was uploaded, update the picture field
    if (req.file) {
      // Construct the URL for the uploaded file
      const fileUrl = getProfileImageUrl(req.file.filename);
      updateData.picture = fileUrl;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
        department: true,
        semester: true,
        whatsapp: true,
        role: true,
        createdAt: true
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
