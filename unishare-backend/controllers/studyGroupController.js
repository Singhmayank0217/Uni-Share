import StudyGroup from "../models/StudyGroup.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get all study groups
export const getAllGroups = async (req, res) => {
  try {
    const studyGroups = await StudyGroup.find()
      .populate("subject", "name code")
      .populate("creator", "name uid")
      .populate("members", "name uid")
      .sort({ createdAt: -1 })

    res.json(studyGroups)
  } catch (error) {
    console.error("Get study groups error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get user's study groups
export const getUserGroups = async (req, res) => {
  try {
    const studyGroups = await StudyGroup.find({
      members: req.user._id,
    })
      .populate("subject", "name code")
      .populate("creator", "name uid")
      .populate("members", "name uid")
      .sort({ createdAt: -1 })

    res.json(studyGroups)
  } catch (error) {
    console.error("Get my study groups error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create a new study group
export const createGroup = async (req, res) => {
  try {
    const { name, description, subject, semester } = req.body

    const studyGroup = new StudyGroup({
      name,
      description,
      subject,
      semester,
      creator: req.user._id,
      members: [req.user._id],
    })

    await studyGroup.save()

    // Populate fields for response
    await studyGroup.populate("subject", "name code")
    await studyGroup.populate("creator", "name uid")
    await studyGroup.populate("members", "name uid")

    res.status(201).json(studyGroup)
  } catch (error) {
    console.error("Create study group error:", error)
    res.status(400).json({ message: error.message || "Failed to create study group" })
  }
}

// Get a single study group by ID
export const getGroupById = async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id)
      .populate("subject", "name code")
      .populate("creator", "name uid")
      .populate("members", "name uid")

    if (!studyGroup) {
      return res.status(404).json({ message: "Study group not found" })
    }

    res.json(studyGroup)
  } catch (error) {
    console.error("Get study group error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Join a study group
export const joinGroup = async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id)

    if (!studyGroup) {
      return res.status(404).json({ message: "Study group not found" })
    }

    // Check if user is already a member
    if (studyGroup.members.includes(req.user._id)) {
      return res.status(400).json({ message: "You are already a member of this group" })
    }

    // Add user to members
    studyGroup.members.push(req.user._id)
    await studyGroup.save()

    res.json({ message: "Joined study group successfully" })
  } catch (error) {
    console.error("Join study group error:", error)
    res.status(400).json({ message: error.message || "Failed to join study group" })
  }
}

// Leave a study group
export const leaveGroup = async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id)

    if (!studyGroup) {
      return res.status(404).json({ message: "Study group not found" })
    }

    // Check if user is a member
    if (!studyGroup.members.some((memberId) => memberId.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: "You are not a member of this group" })
    }

    // Remove user from members
    studyGroup.members = studyGroup.members.filter((memberId) => memberId.toString() !== req.user._id.toString())

    // If creator leaves and there are other members, assign a new creator
    if (studyGroup.creator.toString() === req.user._id.toString() && studyGroup.members.length > 0) {
      studyGroup.creator = studyGroup.members[0]
    } else if (studyGroup.members.length === 0) {
      // If no members left, delete the group
      await StudyGroup.findByIdAndDelete(req.params.id)
      return res.json({ message: "Study group deleted as no members remain" })
    }

    await studyGroup.save()

    res.json({ message: "Left study group successfully" })
  } catch (error) {
    console.error("Leave study group error:", error)
    res.status(400).json({ message: error.message || "Failed to leave study group" })
  }
}

