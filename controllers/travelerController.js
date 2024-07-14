const pool = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Controller method to fetch wallet balance for the logged-in traveler
exports.getWalletBalance = (req, res) => {
  const travelerId = req.userId; // Assuming you have user ID in JWT payload

  pool.query(
    'SELECT balance FROM wallet WHERE user_id = ?',
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
exports.addWalletAmount = (req, res) => {
  const travelerId = req.userId; // Assuming you have user ID in JWT payload
  const { amount } = req.body;

  // Validate input
  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid amount value' });
  }

  const amountToAdd = parseFloat(amount);

  // Get current balance
  pool.query('SELECT balance FROM wallet WHERE user_id = ?', [travelerId], (err, results) => {
    if (err) {
      console.error('Error fetching current wallet balance:', err);
      return res.status(500).json({ error: 'Failed to fetch current wallet balance' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Wallet not found for the traveler' });
    }

    const currentBalance = parseFloat(results[0].balance);
    const newBalance = currentBalance + amountToAdd;

    // Update wallet balance
    pool.query('UPDATE wallet SET balance = ? WHERE user_id = ?', [newBalance, travelerId], (err, updateResults) => {
      if (err) {
        console.error('Error updating wallet balance:', err);
        return res.status(500).json({ error: 'Failed to update wallet balance' });
      }

      if (updateResults.affectedRows === 0) {
        return res.status(404).json({ error: 'Wallet not found for the traveler' });
      }

      res.status(200).json({ message: 'Wallet balance updated successfully', newBalance });
    });
  });
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
        const token = jwt.sign(
          { userId: user.user_id, username: user.username, role: user.role },
          process.env.JWT_SECRET, // Use your actual JWT secret stored in environment variables
          { expiresIn: '1h' } // Token expires in 1 hour
        );

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
