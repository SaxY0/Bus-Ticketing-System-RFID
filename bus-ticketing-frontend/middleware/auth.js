// middleware/auth.js

const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  jwt.verify(token, 'hellothere', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
    req.userId = decoded.userId; // Set the authenticated user ID in the request object
    next();
  });
}

module.exports = {
  authenticateToken
};
