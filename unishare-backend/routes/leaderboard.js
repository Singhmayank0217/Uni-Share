import express from 'express';
import User from '../models/User.js';
import Resource from '../models/Resource.js';

const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const { type = 'uploads' } = req.query;
    
    let users = [];
    
    if (type === 'uploads') {
      // Most uploads leaderboard
      users = await User.find()
        .sort({ uploadCount: -1 })
        .limit(20)
        .select('name uid uploadCount');
      
      // Add resource count
      for (let user of users) {
        const resourceCount = await Resource.countDocuments({ uploader: user._id });
        user = user.toObject();
        user.resourceCount = resourceCount;
        user.uploads = user.uploadCount;
      }
    } else if (type === 'downloads') {
      // Most downloads leaderboard
      const resources = await Resource.aggregate([
        {
          $group: {
            _id: '$uploader',
            downloads: { $sum: '$downloads' },
            resourceCount: { $sum: 1 }
          }
        },
        { $sort: { downloads: -1 } },
        { $limit: 20 }
      ]);
      
      // Get user details
      for (const resource of resources) {
        const user = await User.findById(resource._id).select('name uid');
        if (user) {
          users.push({
            _id: user._id,
            name: user.name,
            uid: user.uid,
            downloads: resource.downloads,
            resourceCount: resource.resourceCount
          });
        }
      }
    } else if (type === 'ratings') {
      // Highest ratings leaderboard
      const resources = await Resource.aggregate([
        {
          $match: {
            averageRating: { $gt: 0 },
            'reviews.0': { $exists: true }
          }
        },
        {
          $group: {
            _id: '$uploader',
            averageRating: { $avg: '$averageRating' },
            resourceCount: { $sum: 1 }
          }
        },
        { $sort: { averageRating: -1 } },
        { $limit: 20 }
      ]);
      
      // Get user details
      for (const resource of resources) {
        const user = await User.findById(resource._id).select('name uid');
        if (user) {
          users.push({
            _id: user._id,
            name: user.name,
            uid: user.uid,
            averageRating: resource.averageRating,
            resourceCount: resource.resourceCount
          });
        }
      }
    }
    
    res.json(users);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;