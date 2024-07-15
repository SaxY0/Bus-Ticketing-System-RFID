const pool = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to validate date format (assuming assignedDate is in YYYY-MM-DD format)
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

// Controller method to get wallet balance for a traveler
exports.getWalletBalance = (req, res) => {
  const userId = req.params.userId;

  pool.query(
    'SELECT balance FROM wallet WHERE user_id = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching wallet balance:', err);
        return res.status(500).json({ error: 'Failed to fetch wallet balance' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Wallet balance not found for the user' });
      }

      const balance = results[0].balance;
      res.status(200).json({ balance });
    }
  );
};

// Controller method to update wallet balance for a traveler
exports.updateWalletBalance = (req, res) => {
  const userId = req.params.userId;
  const { newBalance } = req.body;

  // Validate input
  if (isNaN(parseFloat(newBalance))) {
    return res.status(400).json({ error: 'Invalid balance value' });
  }

  pool.query(
    'UPDATE wallet SET balance = ? WHERE user_id = ?',
    [newBalance, userId],
    (err, results) => {
      if (err) {
        console.error('Error updating wallet balance:', err);
        return res.status(500).json({ error: 'Failed to update wallet balance' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Wallet balance not found for the user' });
      }

      res.status(200).json({ message: 'Wallet balance updated successfully' });
    }
  );
};

// Controller method to assign an RFID card to a traveler
exports.assignRFIDCard = (req, res) => {
  const { userId } = req.params;
  const { cardNumber, assignedDate } = req.body;

  // Validate input
  if (!userId || isNaN(parseInt(userId))) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  if (!cardNumber || typeof cardNumber !== 'string') {
    return res.status(400).json({ error: 'Invalid card number' });
  }
  if (!assignedDate || !isValidDate(assignedDate)) {
    return res.status(400).json({ error: 'Invalid assigned date' });
  }

  // Insert the RFID card into the database, setting isActive to true by default
  pool.query(
    'INSERT INTO RFID_Cards (card_number, user_id, assigned_date, is_active) VALUES (?, ?, ?, ?)',
    [cardNumber, userId, assignedDate, true],
    (err, results) => {
      if (err) {
        console.error('Error assigning RFID card:', err);
        return res.status(500).json({ error: 'Failed to assign RFID card' });
      }
      res.status(201).json({ message: 'RFID card assigned successfully', rfidId: results.insertId });
    }
  );
};

// Controller method to delete a traveler
exports.deleteTraveler = (req, res) => {
  const { userId } = req.params;

  // Use transaction to ensure atomicity
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error('Error beginning transaction:', err);
        connection.release();
        return res.status(500).json({ error: 'Database error' });
      }

      // First, get all RFID card IDs associated with the user
      connection.query('SELECT rfid_id FROM RFID_Cards WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
          console.error('Error fetching RFID card IDs:', err);
          connection.rollback(() => {
            connection.release();
            return res.status(500).json({ error: 'Database error' });
          });
          return;
        }

        const rfidIds = results.map(row => row.rfid_id);
        if (rfidIds.length > 0) {
          // Delete associated trips
          connection.query('DELETE FROM Trips WHERE rfid_id IN (?)', [rfidIds], (err, results) => {
            if (err) {
              console.error('Error deleting trips:', err);
              connection.rollback(() => {
                connection.release();
                return res.status(500).json({ error: 'Database error' });
              });
              return;
            }

            // Delete associated RFID cards
            connection.query('DELETE FROM RFID_Cards WHERE user_id = ?', [userId], (err, results) => {
              if (err) {
                console.error('Error deleting RFID cards:', err);
                connection.rollback(() => {
                  connection.release();
                  return res.status(500).json({ error: 'Database error' });
                });
                return;
              }

              // Delete associated wallet records
              connection.query('DELETE FROM wallet WHERE user_id = ?', [userId], (err, results) => {
                if (err) {
                  console.error('Error deleting wallet records:', err);
                  connection.rollback(() => {
                    connection.release();
                    return res.status(500).json({ error: 'Database error' });
                  });
                  return;
                }

                // Now delete the traveler from Users table
                connection.query('DELETE FROM Users WHERE user_id = ?', [userId], (err, results) => {
                  if (err) {
                    console.error('Error deleting traveler:', err);
                    connection.rollback(() => {
                      connection.release();
                      return res.status(500).json({ error: 'Database error' });
                    });
                    return;
                  }

                  // Commit the transaction
                  connection.commit((err) => {
                    if (err) {
                      console.error('Error committing transaction:', err);
                      connection.rollback(() => {
                        connection.release();
                        return res.status(500).json({ error: 'Database error' });
                      });
                      return;
                    }

                    connection.release();
                    res.status(200).json({ message: 'Traveler deleted successfully' });
                  });
                });
              });
            });
          });
        } else {
          // If no RFID cards found, proceed to delete the traveler and wallet records
          connection.query('DELETE FROM wallet WHERE user_id = ?', [userId], (err, results) => {
            if (err) {
              console.error('Error deleting wallet records:', err);
              connection.rollback(() => {
                connection.release();
                return res.status(500).json({ error: 'Database error' });
              });
              return;
            }

            connection.query('DELETE FROM Users WHERE user_id = ?', [userId], (err, results) => {
              if (err) {
                console.error('Error deleting traveler:', err);
                connection.rollback(() => {
                  connection.release();
                  return res.status(500).json({ error: 'Database error' });
                });
                return;
              }

              // Commit the transaction
              connection.commit((err) => {
                if (err) {
                  console.error('Error committing transaction:', err);
                  connection.rollback(() => {
                    connection.release();
                    return res.status(500).json({ error: 'Database error' });
                  });
                  return;
                }

                connection.release();
                res.status(200).json({ message: 'Traveler deleted successfully' });
              });
            });
          });
        }
      });
    });
  });
};


// Controller method to get all travelers
exports.getAllTravelers = (req, res) => {
  pool.query('SELECT user_id, username FROM Users WHERE role = "traveler"', (err, results) => {
    if (err) {
      console.error('Error fetching travelers:', err);
      res.status(500).json({ error: 'Failed to fetch travelers' });
      return;
    }
    res.status(200).json({ travelers: results });
  });
};

// Controller method to get wallet balance for a specific traveler by admin
exports.getTravelerWalletBalance = (req, res) => {
  const { travelerId } = req.params;

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

// Controller method to update wallet balance for any traveler by admin
exports.addTravelerWalletAmount = (req, res) => {
  const { travelerId } = req.params;
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

// Controller method to register a traveler
exports.registerTraveler = (req, res) => {
  const { username, password, name, email } = req.body;
  const role = 'traveler'; // Assuming all registered users are travelers
  const initialBalance = 500; // Initial wallet balance

  // Hash the password before saving it to the database
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password: ' + err.stack);
      res.status(500).json({ error: 'Server error' });
      return;
    }

    // Begin a transaction to ensure data consistency
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting database connection: ' + err.stack);
        res.status(500).json({ error: 'Database error' });
        return;
      }

      connection.beginTransaction((err) => {
        if (err) {
          console.error('Error beginning transaction: ' + err.stack);
          connection.release();
          res.status(500).json({ error: 'Database error' });
          return;
        }

        // Insert the user into the Users table with hashed password
        connection.query(
          'INSERT INTO Users (username, password, role, name, email) VALUES (?, ?, ?, ?, ?)',
          [username, hashedPassword, role, name, email],
          (err, results) => {
            if (err) {
              console.error('Error registering traveler: ' + err.stack);
              connection.rollback(() => {
                connection.release();
                res.status(500).json({ error: 'Database error' });
              });
              return;
            }

            const userId = results.insertId;

            // Insert initial wallet balance for the traveler
            connection.query(
              'INSERT INTO wallet (user_id, balance) VALUES (?, ?)',
              [userId, initialBalance],
              (err, results) => {
                if (err) {
                  console.error('Error initializing wallet balance: ' + err.stack);
                  connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ error: 'Database error' });
                  });
                  return;
                }

                // Commit the transaction if all queries succeed
                connection.commit((err) => {
                  if (err) {
                    console.error('Error committing transaction: ' + err.stack);
                    connection.rollback(() => {
                      connection.release();
                      res.status(500).json({ error: 'Database error' });
                    });
                    return;
                  }

                  // Release the connection back to the pool
                  connection.release();

                  // Respond with success message and userId
                  res.status(201).json({ message: 'Traveler registered successfully', userId });
                });
              }
            );
          }
        );
      });
    });
  });
};

// Controller method for admin login
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Check if the username exists in the database
  pool.query('SELECT * FROM Users WHERE username = ?',
    [username],
    (err, results) => {
      if (err) {
        console.error('Error querying database: ' + err.stack);
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
          console.error('Error comparing passwords: ' + err.stack);
          res.status(500).json({ error: 'Server error' });
          return;
        }

        if (!isMatch) {
          res.status(401).json({ error: 'Invalid username or password' });
          return;
        }

        // Create a JSON Web Token (JWT) for authentication
        const token = jwt.sign(
          { userId: user.user_id, username: user.username, role: user.role },
          process.env.JWT_SECRET, // Use environment variable for JWT secret key
          { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.status(200).json({ message: 'Login successful', token: token });
      });
    });
};
