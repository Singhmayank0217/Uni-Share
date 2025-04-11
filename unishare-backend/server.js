import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import resourceRoutes from "./routes/resources.js"
import branchRoutes from "./routes/branches.js"
import subjectRoutes from "./routes/subjects.js"
import leaderboardRoutes from "./routes/leaderboard.js"
import studyGroupRoutes from "./routes/studyGroups.js"
import { auth } from "./middleware/auth.js"
import { scheduleMessageCleanup } from "./utils/messageCleanup.js"

// Initialize environment variables
dotenv.config()

// Create Express app
const app = express()
const PORT = process.env.PORT || 5000

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
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

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files - make uploads directory accessible
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/resources", resourceRoutes)
app.use("/api/branches", branchRoutes)
app.use("/api/subjects", subjectRoutes)
app.use("/api/leaderboard", leaderboardRoutes)
app.use("/api/study-groups", studyGroupRoutes)

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" })
})

// Protected test route
app.get("/api/protected", auth, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")

    // Schedule message cleanup
    scheduleMessageCleanup()

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
  })

export default app
