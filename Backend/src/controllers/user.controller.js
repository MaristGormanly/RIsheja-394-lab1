const UserModel = require('../models/user.model');

class UserController {
  static async createUser(req, res, next) {
    try {
      const { email, name } = req.body;
      const user = await UserModel.createUser(email, name);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserModel.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // Add more controller methods as needed
}

module.exports = UserController; 