const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).select('-password');
    if (user) {
      req.user = user;
    }
  } catch (error) {
    console.warn('Invalid auth token', error.message);
  }

  return next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
  }
  next();
}

module.exports = { optionalAuth, requireAuth };
