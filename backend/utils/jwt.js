import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for authenticated user
 * @param {Object} user - User object with id, email, name, picture, role
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
