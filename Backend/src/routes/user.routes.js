const express = require('express');
const UserController = require('../controllers/user.controller');
const router = express.Router();
const UserModel = require('../models/user.model');

router.post('/users', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    const user = await UserModel.createUser(email, name);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/users/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await UserModel.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', UserController.getUserById);

module.exports = router; 