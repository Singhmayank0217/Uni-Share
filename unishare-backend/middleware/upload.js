import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "..", "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Create resources uploads directory
const resourcesUploadsDir = path.join(uploadsDir, "resources")
if (!fs.existsSync(resourcesUploadsDir)) {
  fs.mkdirSync(resourcesUploadsDir, { recursive: true })
}

// Create study group uploads directory
const studyGroupUploadsDir = path.join(uploadsDir, "study-groups")
if (!fs.existsSync(studyGroupUploadsDir)) {
  fs.mkdirSync(studyGroupUploadsDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check if this is a study group upload
    if (req.baseUrl.includes("study-groups") && req.params.id) {
      const groupDir = path.join(studyGroupUploadsDir, req.params.id)
      if (!fs.existsSync(groupDir)) {
        fs.mkdirSync(groupDir, { recursive: true })
      }
      cb(null, groupDir)
    } else {
      // For resources
      cb(null, resourcesUploadsDir)
    }
  },
  filename: (req, file, cb) => {
    // Generate a unique filename while preserving the original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, uniqueSuffix + ext)
  },
})

// File filter to accept all file types
const fileFilter = (req, file, cb) => {
  // Accept all file types for now
  cb(null, true)
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

export default upload
