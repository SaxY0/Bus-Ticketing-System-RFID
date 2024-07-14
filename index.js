const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors'); // Import cors package
const adminRoutes = require('./routes/adminRoutes');
const travelerRoutes = require('./routes/travelerRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10
});

// Test the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as ID ' + connection.threadId);
  connection.release();
});

// Middleware to parse JSON bodies
app.use(express.json());

// CORS setup
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  credentials: true  // If you need to send cookies cross-origin
}));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/traveler', travelerRoutes);

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
