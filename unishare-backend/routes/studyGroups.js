import express from "express"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { auth } from "../middleware/auth.js"
import upload from "../middleware/upload.js"
import StudyGroup from "../models/StudyGroup.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Get all study groups
router.get("/", async (req, res) => {
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
})

// Get user's study groups
router.get("/my-groups", auth, async (req, res) => {
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
})

// Create a new study group
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, subject, semester } = req.body

    const studyGroup = new StudyGroup({
      name,
      description,
      subject,
      semester,
      creator: req.user._id,
      members: [req.user._id],
      messages: [],
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
})

// Join a study group
router.post("/:id/join", auth, async (req, res) => {
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
})

// Leave a study group
router.post("/:id/leave", auth, async (req, res) => {
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
})

// Add a message to a study group
router.post("/:id/messages", auth, upload.single("file"), async (req, res) => {
  try {
    const { content } = req.body
    const groupId = req.params.id

    // Either content or file must be provided
    if ((!content || content.trim() === "") && !req.file) {
      return res.status(400).json({ message: "Message content or file is required" })
    }

    const studyGroup = await StudyGroup.findById(groupId)

    if (!studyGroup) {
      // If file was uploaded, delete it
      if (req.file) {
        fs.unlinkSync(req.file.path)
      }
      return res.status(404).json({ message: "Study group not found" })
    }

    // Check if user is a member
    if (!studyGroup.members.some((memberId) => memberId.toString() === req.user._id.toString())) {
      // If file was uploaded, delete it
      if (req.file) {
        fs.unlinkSync(req.file.path)
      }
      return res.status(403).json({ message: "You must be a member to post messages" })
    }

    // Prepare message object
    const newMessage = {
      sender: req.user._id,
      content: content || "",
      createdAt: new Date(),
    }

    // Add file info if a file was uploaded
    if (req.file) {
      newMessage.fileUrl = `/uploads/study-groups/${groupId}/${req.file.filename}`
      newMessage.fileName = req.file.originalname
      newMessage.fileType = req.file.mimetype
    }

    // Add message
    studyGroup.messages.push(newMessage)
    await studyGroup.save()

    // Populate the sender info for the new message
    await studyGroup.populate("messages.sender", "name uid")

    // Return only the new message
    const addedMessage = studyGroup.messages[studyGroup.messages.length - 1]

    res.status(201).json(addedMessage)
  } catch (error) {
    console.error("Add message error:", error)
    // If file was uploaded, delete it on error
    if (req.file) {
      fs.unlinkSync(req.file.path)
    }
    res.status(400).json({ message: error.message || "Failed to add message" })
  }
})

// Get messages for a study group
router.get("/:id/messages", auth, async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id).populate("messages.sender", "name uid")

    if (!studyGroup) {
      return res.status(404).json({ message: "Study group not found" })
    }

    // Check if user is a member
    if (!studyGroup.members.some((memberId) => memberId.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "You must be a member to view messages" })
    }

    res.json(studyGroup.messages)
  } catch (error) {
    console.error("Get messages error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Serve study group files
router.get("/files/:groupId/:filename", auth, async (req, res) => {
  try {
    const { groupId, filename } = req.params

    // Check if user is a member of the group
    const studyGroup = await StudyGroup.findById(groupId)

    if (!studyGroup) {
      return res.status(404).json({ message: "Study group not found" })
    }

    if (!studyGroup.members.some((memberId) => memberId.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "You must be a member to access files" })
    }

    const filePath = path.join(__dirname, "..", "uploads", "study-groups", groupId, filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" })
    }

    // Find the message with this file to get the original filename
    const message = studyGroup.messages.find((msg) => msg.fileUrl && msg.fileUrl.includes(filename))

    if (message && message.fileName) {
      res.setHeader("Content-Disposition", `attachment; filename="${message.fileName}"`)
    }

    if (message && message.fileType) {
      res.setHeader("Content-Type", message.fileType)
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
  } catch (error) {
    console.error("Get file error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router

