const express = require('express');
const UserController = require('../controllers/user.controller');
const router = express.Router();
const UserModel = require('../models/user.model');

// Create user
router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body;
    console.log('Creating new user:', { email, name });
    
    if (!email || !name) {
      console.log('Missing required fields:', { email, name });
      return res.status(400).json({ message: 'Email and name are required' });
    }

    const user = await UserModel.createUser(email, name);
    console.log('User created successfully:', user);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user by email
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('Looking up user by email:', email);
    
    const user = await UserModel.getUserByEmail(email);
    console.log('User lookup result:', user ? 'User found' : 'User not found');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Returning user data for email:', email);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.updateUser(id, req.body);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 