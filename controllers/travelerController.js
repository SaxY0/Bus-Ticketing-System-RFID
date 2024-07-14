const pool = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.getWalletBalance = (req, res) => {
  const travelerId = req.userId; // Assuming you have authenticated traveler's ID stored in req.userId

  pool.query(
    'SELECT balance FROM wallet WHERE traveler_id = ?',
    [travelerId],
    (err, results) => {
      if (err) {
        console.error('Error fetching wallet balance:', err);
        return res.status(500).json({ error: 'Failed to fetch wallet balance' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Wallet balance not found for the traveler' });
      }

      const balance = results[0].balance;
      res.status(200).json({ balance });
    }
  );
};

// Controller method to update wallet balance for the traveler
exports.updateWalletBalance = (req, res) => {
  const travelerId = req.userId; // Assuming you have authenticated traveler's ID stored in req.userId
  const { newBalance } = req.body;

  // Validate input
  if (isNaN(parseFloat(newBalance))) {
    return res.status(400).json({ error: 'Invalid balance value' });
  }

  pool.query(
    'UPDATE wallet SET balance = ? WHERE traveler_id = ?',
    [newBalance, travelerId],
    (err, results) => {
      if (err) {
        console.error('Error updating wallet balance:', err);
        return res.status(500).json({ error: 'Failed to update wallet balance' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Wallet balance not found for the traveler' });
      }

      res.status(200).json({ message: 'Wallet balance updated successfully' });
    }
  );
};
// Login function
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Query to find user by username
  pool.query('SELECT * FROM Users WHERE username = ?',
    [username],
    (err, results) => {
      if (err) {
        console.error('Error querying database:', err.stack);
        res.status(500).json({ error: 'Database error' });
        return;
      }

      if (results.length === 0) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      const user = results[0];

      // Check if user.password exists and is a string
      if (typeof user.password !== 'string') {
        res.status(500).json({ error: 'Invalid password stored in database' });
        return;
      }

      // Compare the password with the hashed password in the database
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err.stack);
          res.status(500).json({ error: 'Server error' });
          return;
        }

        if (!isMatch) {
          res.status(401).json({ error: 'Invalid username or password' });
          return;
        }

        // Passwords match, generate JWT token for authentication
        const token = generateAuthToken(user);

        // Return success response with token and user details
        res.status(200).json({
          message: 'Login successful',
          token: token,
          userId: user.user_id,
          username: user.username,
          name: user.name,
          email: user.email
        });
      });
    });
};

// Function to generate JWT token
function generateAuthToken(user) {
  return jwt.sign(
    { userId: user.user_id, username: user.username, role: user.role },
    'your_secret_key', // Replace with your actual secret key for JWT
    { expiresIn: '1h' } // Token expires in 1 hour
  );
}

// Get bus timings
exports.getBusTimings = (req, res) => {
  pool.query('SELECT * FROM Bus_Timings',
    (err, results) => {
      if (err) {
        console.error('Error fetching bus timings:', err.stack);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      res.status(200).json(results);
    });
};

// Check wallet balance
exports.checkWalletBalance = (req, res) => {
  const { userId } = req.params;

  pool.query('SELECT * FROM Wallet WHERE user_id = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching wallet balance:', err.stack);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: 'Wallet not found' });
        return;
      }
      const wallet = results[0];
      res.status(200).json({
        balance: wallet.balance
      });
    });
};

// Top up wallet balance
exports.topUpBalance = (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  pool.query('UPDATE Wallet SET balance = balance + ? WHERE user_id = ?',
    [amount, userId],
    (err, results) => {
      if (err) {
        console.error('Error topping up wallet balance:', err.stack);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      res.status(200).json({ message: 'Wallet balance topped up successfully' });
    });
};
