import Message from "../models/Message.js"
import StudyGroup from "../models/StudyGroup.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get messages for a study group
export const getMessages = async (req, res) => {
  try {
    const groupId = req.params.id

    // Check if group exists
    const studyGroup = await StudyGroup.findById(groupId)
    if (!studyGroup) {
      return res.status(404).json({ message: "Study group not found" })
    }

    // Check if user is a member
    if (!studyGroup.members.some((memberId) => memberId.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "You must be a member to view messages" })
    }

    // Find messages for this group
    const messages = await Message.find({ group: groupId }).populate("sender", "name uid").sort({ createdAt: 1 })

    res.json(messages)
  } catch (error) {
    console.error("Get messages error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Add a message to a study group
export const addMessage = async (req, res) => {
  try {
    const { content } = req.body
    const groupId = req.params.id

    // Either content or file must be provided
    if (!req.file && (!content || content.trim() === "")) {
      return res.status(400).json({ message: "Message content or file is required" })
    }

    // Check if group exists
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
    const newMessage = new Message({
      group: groupId,
      sender: req.user._id,
      content: content || "",
    })

    // Add file info if a file was uploaded
    if (req.file) {
      newMessage.fileUrl = `/api/study-groups/files/${groupId}/${req.file.filename}`
      newMessage.fileName = req.file.originalname
      newMessage.fileType = req.file.mimetype
    }

    // Save the message
    await newMessage.save()

    // Populate sender info
    await newMessage.populate("sender", "name uid")

    res.status(201).json(newMessage)
  } catch (error) {
    console.error("Add message error:", error)
    // If file was uploaded, delete it on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError)
      }
    }
    res.status(400).json({ message: error.message || "Failed to add message" })
  }
}

// Delete old messages (for cleanup job)
export const deleteOldMessages = async (groupId, maxMessages = 5000, maxSizeMB = 5) => {
  try {
    const count = await Message.countDocuments({ group: groupId })

    if (count > maxMessages) {
      // Find the oldest messages that exceed the limit
      const messagesToDelete = count - maxMessages

      // Get the IDs of messages to delete
      const oldMessages = await Message.find({ group: groupId })
        .sort({ createdAt: 1 })
        .limit(messagesToDelete)
        .select("_id fileUrl")

      // Delete files associated with these messages
      for (const message of oldMessages) {
        if (message.fileUrl) {
          try {
            // Extract the path from the URL
            const urlParts = message.fileUrl.split("/files/")
            if (urlParts.length >= 2) {
              const relativePath = urlParts[1]
              const filePath = path.join(__dirname, "..", "uploads", "study-groups", relativePath)

              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
                console.log(`Deleted file: ${filePath}`)
              }
            }
          } catch (error) {
            console.error(`Error deleting file for message ${message._id}:`, error)
          }
        }
      }

      // Delete the messages
      await Message.deleteMany({ _id: { $in: oldMessages.map((m) => m._id) } })

      console.log(`Deleted ${messagesToDelete} old messages from group ${groupId}`)
    }

    // Check message size (rough estimation)
    // This is a simplified approach - in production you might want to use a more accurate method
    const messages = await Message.find({ group: groupId })
    const sizeInMB = JSON.stringify(messages).length / (1024 * 1024)

    if (sizeInMB > maxSizeMB) {
      // Calculate how many messages to remove to get below the size limit
      const avgMessageSize = sizeInMB / messages.length
      const messagesToRemoveForSize = Math.ceil((sizeInMB - maxSizeMB * 0.9) / avgMessageSize)

      // Get the oldest messages to delete
      const oldestMessages = await Message.find({ group: groupId })
        .sort({ createdAt: 1 })
        .limit(messagesToRemoveForSize)
        .select("_id fileUrl")

      // Delete files associated with these messages
      for (const message of oldestMessages) {
        if (message.fileUrl) {
          try {
            // Extract the path from the URL
            const urlParts = message.fileUrl.split("/files/")
            if (urlParts.length >= 2) {
              const relativePath = urlParts[1]
              const filePath = path.join(__dirname, "..", "uploads", "study-groups", relativePath)

              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
                console.log(`Deleted file: ${filePath}`)
              }
            }
          } catch (error) {
            console.error(`Error deleting file for message ${message._id}:`, error)
          }
        }
      }

      // Delete the messages
      await Message.deleteMany({ _id: { $in: oldestMessages.map((m) => m._id) } })

      console.log(`Deleted ${oldestMessages.length} messages to reduce size for group ${groupId}`)
    }
  } catch (error) {
    console.error(`Error deleting old messages for group ${groupId}:`, error)
  }
}

