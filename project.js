const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// PostgreSQL configuration
const pool = new Pool({
  user: '""',
  host: 'localhost',
  database: 'your_database_name',
  password: '3005',
  port: 5432, // Default PostgreSQL port
});

// Sample route to query PostgreSQL
app.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error querying PostgreSQL:', error);
    res.status(500).send('Error querying PostgreSQL');
  }
});

// Sample error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
