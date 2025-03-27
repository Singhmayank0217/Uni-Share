import express from 'express';
import bcrypt from 'bcryptjs';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Resource from '../models/Resource.js';

const router = express.Router();

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = req.user;
    
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
    
    res.json(userToReturn);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, uid } = req.body;
    const user = req.user;
    
    // Check if email or uid is already taken by another user
    if (email !== user.email || uid !== user.uid) {
      const existingUser = await User.findOne({
        $or: [
          { email, _id: { $ne: user._id } },
          { uid, _id: { $ne: user._id } }
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Email or UID is already taken' 
        });
      }
    }
    
    // Update user
    user.name = name;
    user.email = email;
    user.uid = uid;
    
    await user.save();
    
    // Return updated user data without password
    const userToReturn = {
      _id: user._id,
      name: user.name,
      uid: user.uid,
      email: user.email,
      uploadCount: user.uploadCount,
      bookmarkCount: user.bookmarkCount,
      reviewCount: user.reviewCount
    };
    
    res.json(userToReturn);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user uploads
router.get('/uploads', auth, async (req, res) => {
  try {
    const resources = await Resource.find({ uploader: req.user._id })
      .populate('subject', 'name')
      .sort({ createdAt: -1 });
    
    // Format resources for response
    const formattedResources = resources.map(resource => {
      return {
        _id: resource._id,
        title: resource.title,
        description: resource.description,
        semester: resource.semester,
        subject: resource.subject.name,
        fileType: resource.fileType,
        tags: resource.tags,
        views: resource.views,
        downloads: resource.downloads,
        averageRating: resource.averageRating,
        createdAt: resource.createdAt,
        uploader: {
          name: req.user.name,
          uid: req.user.uid
        },
        isBookmarked: req.user.bookmarks.includes(resource._id)
      };
    });
    
    res.json(formattedResources);
  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user bookmarks
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: {
        path: 'subject uploader',
        select: 'name uid'
      }
    });
    
    // Format bookmarks for response
    const formattedBookmarks = user.bookmarks.map(resource => {
      return {
        _id: resource._id,
        title: resource.title,
        description: resource.description,
        semester: resource.semester,
        subject: resource.subject.name,
        fileType: resource.fileType,
        tags: resource.tags,
        views: resource.views,
        downloads: resource.downloads,
        averageRating: resource.averageRating,
        createdAt: resource.createdAt,
        uploader: {
          name: resource.uploader.name,
          uid: resource.uploader.uid
        },
        isBookmarked: true
      };
    });
    
    res.json(formattedBookmarks);
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get upload count
    const uploads = await Resource.countDocuments({ uploader: userId });
    
    // Get bookmark count
    const user = await User.findById(userId);
    const bookmarks = user.bookmarks.length;
    
    // Get review count
    const resources = await Resource.find({});
    let reviews = 0;
    let totalViews = 0;
    let totalDownloads = 0;
    
    resources.forEach(resource => {
      // Count reviews by this user
      resource.reviews.forEach(review => {
        if (review.user.toString() === userId.toString()) {
          reviews++;
        }
      });
      
      // Count views and downloads for resources uploaded by this user
      if (resource.uploader.toString() === userId.toString()) {
        totalViews += resource.views;
        totalDownloads += resource.downloads;
      }
    });
    
    res.json({
      uploads,
      bookmarks,
      reviews,
      totalViews,
      totalDownloads
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;