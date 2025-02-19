const db = require('../config/database');

class UserModel {
  static async createUser(email, name) {
    try {
      const result = await db.query(
        'INSERT INTO users(email, name) VALUES($1, $2) RETURNING *',
        [email, name]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static async getUserById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  static async getUserByEmail(email) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
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