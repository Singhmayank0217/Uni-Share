import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import mime from "mime-types"
import StudyGroup from "../models/StudyGroup.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Handle file uploads
export const uploadFile = (req, res, next) => {
  try {
    // File is already uploaded by multer middleware
    if (!req.file) {
      return next()
    }

    // Create directory if it doesn't exist
    const groupId = req.params.id
    const groupDir = path.join(__dirname, "..", "uploads", "study-groups", groupId)

    if (!fs.existsSync(groupDir)) {
      fs.mkdirSync(groupDir, { recursive: true })
    }

    next()
  } catch (error) {
    console.error("Upload file error:", error)
    res.status(500).json({ message: "File upload failed" })
  }
}

// Download a file
export const downloadFile = async (req, res) => {
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

    // Construct the file path
    const filePath = path.join(__dirname, "..", "uploads", "study-groups", groupId, filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" })
    }

    // Get file stats
    const stats = fs.statSync(filePath)

    // Determine content type based on file extension
    const contentType = mime.lookup(filePath) || "application/octet-stream"

    // Set appropriate headers for download
    res.setHeader("Content-Type", contentType)
    res.setHeader("Content-Length", stats.size)
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(path.basename(filename))}"`)

    // Stream the file directly to the response
    const fileStream = fs.createReadStream(filePath)

    // Handle stream errors
    fileStream.on("error", (error) => {
      console.error("Error streaming file:", error)
      if (!res.headersSent) {
        res.status(500).json({ message: "Error streaming file" })
      }
    })

    // Pipe the file to the response
    fileStream.pipe(res)
  } catch (error) {
    console.error("Download file error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

