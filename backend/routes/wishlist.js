import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'wish-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Get all wish posts
router.get('/', async (req, res) => {
    try {
        const wishPosts = await prisma.wishPost.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        picture: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ wishPosts });
    } catch (error) {
        console.error('Error fetching wish posts:', error);
        res.status(500).json({ message: 'Failed to fetch wish posts' });
    }
});

// Create a new wish post
router.post('/', authenticate, upload.single('image'), async (req, res) => {
    try {
        const { itemName } = req.body;
        const userId = req.user.id;

        if (!itemName || !itemName.trim()) {
            return res.status(400).json({ message: 'Item name is required' });
        }

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const wishPost = await prisma.wishPost.create({
            data: {
                itemName: itemName.trim(),
                imageUrl,
                userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        picture: true
                    }
                }
            }
        });

        res.status(201).json({ wishPost });
    } catch (error) {
        console.error('Error creating wish post:', error);
        res.status(500).json({ message: 'Failed to create wish post' });
    }
});

// Delete a wish post
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if the wish post exists and belongs to the user
        const wishPost = await prisma.wishPost.findUnique({
            where: { id }
        });

        if (!wishPost) {
            return res.status(404).json({ message: 'Wish post not found' });
        }

        if (wishPost.userId !== userId) {
            return res.status(403).json({ message: 'You can only delete your own wish posts' });
        }

        await prisma.wishPost.delete({
            where: { id }
        });

        res.json({ message: 'Wish post deleted successfully' });
    } catch (error) {
        console.error('Error deleting wish post:', error);
        res.status(500).json({ message: 'Failed to delete wish post' });
    }
});

export default router;
