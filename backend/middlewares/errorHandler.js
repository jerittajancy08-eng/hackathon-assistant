function errorHandler(err, req, res, next) {
  console.error('Server error:', err.message || err);
  return res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'Unexpected failure',
  });
}

module.exports = { errorHandler };
