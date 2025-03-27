import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, uid, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { uid }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or UID already exists' 
      });
    }
    
    // Create new user
    const user = new User({
      name,
      uid,
      email,
      password
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data without password
    const userToReturn = {
      _id: user._id,
      name: user.name,
      uid: user.uid,
      email: user.email,
      uploadCount: user.uploadCount,
      bookmarkCount: user.bookmarkCount,
      reviewCount: user.reviewCount
    };
    
    res.status(201).json({ user: userToReturn, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data without password
    const userToReturn = {
      _id: user._id,
      name: user.name,
      uid: user.uid,
      email: user.email,
      uploadCount: user.uploadCount,
      bookmarkCount: user.bookmarkCount,
      reviewCount: user.reviewCount
    };
    
    res.json({ user: userToReturn, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;