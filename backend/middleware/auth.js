const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mouna_ragam_super_secure_jwt_secret_key_2026';

// Required Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Optional Authentication Middleware (attach req.user if token present, but don't block)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
  } catch (err) {
    req.user = null;
  }
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  JWT_SECRET
};
