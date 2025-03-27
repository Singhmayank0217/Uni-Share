import express from "express"
import { auth } from "../middleware/auth.js"
import Subject from "../models/Subject.js"
import Branch from "../models/Branch.js"

const router = express.Router()

// Get all subjects
router.get("/", async (req, res) => {
  try {
    const { branch, semester } = req.query

    // Build query
    const query = {}
    if (branch) query.branch = branch
    if (semester) query.semester = semester

    const subjects = await Subject.find(query).populate("branch", "name code").sort({ name: 1 })

    res.json(subjects)
  } catch (error) {
    console.error("Get subjects error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new subject (admin only in a real app)
router.post("/", auth, async (req, res) => {
  try {
    const { name, code, branch, semester, description } = req.body

    // Validate branch
    const branchExists = await Branch.findById(branch)
    if (!branchExists) {
      return res.status(400).json({ message: "Invalid branch" })
    }

    // Check if subject already exists for this branch and semester
    const existingSubject = await Subject.findOne({
      name,
      branch,
      semester,
    })

    if (existingSubject) {
      return res.status(400).json({
        message: "Subject already exists for this branch and semester",
      })
    }

    // Create subject
    const subject = new Subject({
      name,
      code,
      branch,
      semester,
      description,
    })

    await subject.save()

    res.status(201).json(subject)
  } catch (error) {
    console.error("Create subject error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router

