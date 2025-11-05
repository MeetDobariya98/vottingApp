const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const jwtAuthMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ error: 'token not found' });

  // Extract token from header
  const token = authorization.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'unauthorized' });

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user data to request
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'invalid token' });
  }
};

// Function to generate JWT
const generateToken = (userData) => {
  // userData must be a plain object
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30m' });
};

// ✅ Correct export
module.exports = {
  jwtAuthMiddleware,
  generateToken
};
