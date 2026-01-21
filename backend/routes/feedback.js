import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Submit feedback (authenticated users)
router.post('/', authenticate, async (req, res) => {
    try {
        const { type, message } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!type || !message) {
            return res.status(400).json({ message: 'Type and message are required' });
        }

        const validTypes = ['Report', 'Feedback', 'Query'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: 'Invalid feedback type' });
        }

        if (!message.trim()) {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }

        const feedback = await prisma.feedback.create({
            data: {
                type,
                message: message.trim(),
                userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Failed to submit feedback' });
    }
});

// Get all feedback (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const feedbacks = await prisma.feedback.findMany({
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
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ feedbacks });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Failed to fetch feedback' });
    }
});

export default router;
