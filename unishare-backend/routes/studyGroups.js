import express from 'express';
import { auth } from '../middleware/auth.js';
import StudyGroup from '../models/StudyGroup.js';
import Subject from '../models/Subject.js';

const router = express.Router();

// Get all study groups
router.get('/', async (req, res) => {
  try {
    const studyGroups = await StudyGroup.find()
      .populate('subject', 'name')
      .populate('creator', 'name uid')
      .sort({ createdAt: -1 });
    
    res.json(studyGroups);
  } catch (error) {
    console.error('Get study groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's study groups
router.get('/my-groups', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const studyGroups = await StudyGroup.find({
      members: userId
    })
      .populate('subject', 'name')
      .populate('creator', 'name uid')
      .sort({ createdAt: -1 });
    
    res.json(studyGroups);
  } catch (error) {
    console.error('Get my study groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new study group
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, subject, semester } = req.body;
    const userId = req.user._id;
    
    // Validate subject
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(400).json({ message: 'Invalid subject' });
    }
    
    // Create study group
    const studyGroup = new StudyGroup({
      name,
      description,
      subject,
      semester,
      creator: userId,
      members: [userId] // Creator is automatically a member
    });
    
    await studyGroup.save();
    
    // Populate fields for response
    await studyGroup.populate('subject', 'name');
    await studyGroup.populate('creator', 'name uid');
    
    res.status(201).json(studyGroup);
  } catch (error) {
    console.error('Create study group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a study group
router.post('/:id/join', auth, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    
    // Find study group
    const studyGroup = await StudyGroup.findById(groupId);
    if (!studyGroup) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Check if user is already a member
    if (studyGroup.members.includes(userId)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }
    
    // Add user to members
    studyGroup.members.push(userId);
    await studyGroup.save();
    
    res.json({ message: 'Joined study group successfully' });
  } catch (error) {
    console.error('Join study group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave a study group
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    
    // Find study group
    const studyGroup = await StudyGroup.findById(groupId);
    if (!studyGroup) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Check if user is a member
    if (!studyGroup.members.includes(userId)) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }
    
    // Check if user is the creator
    if (studyGroup.creator.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Group creator cannot leave the group' });
    }
    
    // Remove user from members
    studyGroup.members = studyGroup.members.filter(
      member => member.toString() !== userId.toString()
    );
    
    await studyGroup.save();
    
    res.json({ message: 'Left study group successfully' });
  } catch (error) {
    console.error('Leave study group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add discussion message to study group
router.post('/:id/discussions', auth, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }
    
    // Find study group
    const studyGroup = await StudyGroup.findById(groupId);
    if (!studyGroup) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Check if user is a member
    if (!studyGroup.members.includes(userId)) {
      return res.status(403).json({ message: 'You must be a member to post in this group' });
    }
    
    // Add message to discussions
    studyGroup.discussions.push({
      user: userId,
      message
    });
    
    await studyGroup.save();
    
    res.json({ message: 'Message posted successfully' });
  } catch (error) {
    console.error('Add discussion message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get study group discussions
router.get('/:id/discussions', auth, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    
    // Find study group
    const studyGroup = await StudyGroup.findById(groupId)
      .populate('discussions.user', 'name uid');
    
    if (!studyGroup) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Check if user is a member
    if (!studyGroup.members.includes(userId)) {
      return res.status(403).json({ message: 'You must be a member to view discussions' });
    }
    
    res.json(studyGroup.discussions);
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;