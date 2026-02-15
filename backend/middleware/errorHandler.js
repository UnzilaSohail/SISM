const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  let error = { ...err };
  error.message = err.message;
  if (err.name === 'CastError') error = { message: 'Resource not found', statusCode: 404 };
  if (err.code === 11000) error = { message: 'Duplicate field value entered', statusCode: 400 };
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }
  if (err.name === 'JsonWebTokenError') error = { message: 'Not authorized to access this route', statusCode: 401 };
  if (err.name === 'TokenExpiredError') error = { message: 'Not authorized to access this route', statusCode: 401 };
  res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server Error' });
};
module.exports = errorHandler;