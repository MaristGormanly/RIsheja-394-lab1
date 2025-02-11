const { Pool } = require('pg');
require('dotenv').config();

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString: connectionString,
});

// Test the connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
  } catch (err) {
    console.error('Database connection error:', {
      message: err.message,
      stack: err.stack,
      details: {
        connectionString: connectionString.replace(
          process.env.DB_PASSWORD,
          '****'
        ),
      }
    });
  }
};

testConnection();

module.exports = pool; 