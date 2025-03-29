import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs" // Import the 'fs' module
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import resourceRoutes from "./routes/resources.js"
import subjectRoutes from "./routes/subjects.js"
import branchRoutes from "./routes/branches.js"
import studyGroupRoutes from "./routes/studyGroups.js"
import leaderboardRoutes from "./routes/leaderboard.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Create study group uploads directory
const studyGroupUploadsDir = path.join(uploadsDir, "study-groups")
if (!fs.existsSync(studyGroupUploadsDir)) {
  fs.mkdirSync(studyGroupUploadsDir, { recursive: true })
}

// Static files - make sure this is properly configured
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/resources", resourceRoutes)
app.use("/api/subjects", subjectRoutes)
app.use("/api/branches", branchRoutes)
app.use("/api/study-groups", studyGroupRoutes)
app.use("/api/leaderboard", leaderboardRoutes)

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
  })

