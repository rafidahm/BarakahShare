/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({ 
      message: 'Duplicate entry. This record already exists.' 
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ 
      message: 'Record not found.' 
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: err.message || 'Validation error.' 
    });
  }

  // Default error
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error.';

  res.status(status).json({ message });
};
