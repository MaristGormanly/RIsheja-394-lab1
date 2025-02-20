const db = require('../config/database');

class UserModel {
  static async createUser(email, name) {
    try {
      console.log('Attempting to create user in database:', { email, name });
      const result = await db.query(
        'INSERT INTO users(email, name) VALUES($1, $2) RETURNING *',
        [email, name]
      );
      console.log('User created in database:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Database error creating user:', error);
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static async getUserById(id) {
    try {
      console.log('Looking up user in database by ID:', id);
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      console.log('Database lookup result:', result.rows[0] ? 'User found' : 'User not found');
      return result.rows[0];
    } catch (error) {
      console.error('Database error fetching user by ID:', error);
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  static async getUserByEmail(email) {
    try {
      console.log('Looking up user in database by email:', email);
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      console.log('Database lookup result:', result.rows[0] ? 'User found' : 'User not found');
      return result.rows[0];
    } catch (error) {
      console.error('Database error fetching user by email:', error);
      throw new Error(`Error fetching user by email: ${error.message}`);
    }
  }

  static async updateUser(id, data) {
    const { name, email } = data;
    try {
      const result = await db.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
        [name, email, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Add more methods as needed
}

module.exports = UserModel; 