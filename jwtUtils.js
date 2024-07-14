// jwtUtils.js

const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY; // Fetch JWT secret key from environment variables

function generateAuthToken(user) {
  return jwt.sign(
    { userId: user.user_id, username: user.username, role: user.role },
    JWT_SECRET_KEY,
    { expiresIn: '1h' } // Token expires in 1 hour
  );
}

module.exports = {
  generateAuthToken
};
