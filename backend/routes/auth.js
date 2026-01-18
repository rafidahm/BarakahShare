import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyGoogleToken } from '../utils/googleAuth.js';
import { generateToken } from '../utils/jwt.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/auth/google
 * Exchange Google ID token for JWT
 * Body: { token: "<google-id-token>" }
 */
router.post('/google', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        message: 'Google ID token is required.' 
      });
    }

    // Verify Google token and extract user info
    let userInfo;
    try {
      userInfo = await verifyGoogleToken(token);
    } catch (error) {
      if (error.message === 'DOMAIN_RESTRICTION') {
        return res.status(403).json({ 
          message: 'Only IIUC undergraduate students can access IIUCShare. Please use an @ugrad.iiuc.ac.bd email address.' 
        });
      }
      return res.status(401).json({ 
        message: 'Invalid Google token. Please try again.' 
      });
    }

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          role: 'user'
        }
      });
    } else {
      // Update user info (name might have changed)
      // Preserve uploaded picture if exists (don't overwrite with Google picture)
      const updateData = {
        name: userInfo.name
      };
      
      // Only update picture if user doesn't have a custom uploaded one
      // If picture contains /uploads/profiles/, it's an uploaded file, preserve it
      // Google pictures start with https://lh3.googleusercontent.com
      // Otherwise, it might be null or old Google picture, update it
      const hasUploadedPicture = user.picture && user.picture.includes('/uploads/profiles/');
      
      if (!hasUploadedPicture) {
        updateData.picture = userInfo.picture;
      }
      
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });
    }

    // Generate JWT token
    const jwtToken = generateToken(user);

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
