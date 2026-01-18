import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const profileUploadsDir = path.join(uploadsDir, 'profiles');
const itemUploadsDir = path.join(uploadsDir, 'items');

[profileUploadsDir, itemUploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for profile photos
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user?.id || 'unknown'}-${uniqueSuffix}${ext}`);
  }
});

// Configure storage for item photos
const itemStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, itemUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `item-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Upload middleware configurations
export const uploadProfile = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
}).single('photo');

export const uploadItem = multer({
  storage: itemStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
}).single('photo');

// Serve static files
export const getProfileImagePath = (filename) => {
  return path.join(profileUploadsDir, filename);
};

export const getItemImagePath = (filename) => {
  return path.join(itemUploadsDir, filename);
};

export const getProfileImageUrl = (filename) => {
  if (!filename) return null;
  // If it's already a full URL (from Google), return as is
  if (filename.startsWith('http')) return filename;
  // Return absolute URL for uploaded files
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const apiBase = baseUrl.replace(':5173', ':4000');
  return `${apiBase}/uploads/profiles/${filename}`;
};

export const getItemImageUrl = (filename) => {
  if (!filename) return null;
  // If it's already a full URL (from external source), return as is
  if (filename.startsWith('http')) return filename;
  return `/uploads/items/${filename}`;
};
