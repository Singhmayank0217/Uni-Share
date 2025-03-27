import express from "express"
import { auth } from "../middleware/auth.js"
import Branch from "../models/Branch.js"

const router = express.Router()

// Get all branches
router.get("/", async (req, res) => {
  try {
    const branches = await Branch.find().sort({ name: 1 })
    res.json(branches)
  } catch (error) {
    console.error("Get branches error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new branch (admin only in a real app)
router.post("/", auth, async (req, res) => {
  try {
    const { name, code, description } = req.body

    // Check if branch already exists
    const existingBranch = await Branch.findOne({
      $or: [{ name }, { code }],
    })

    if (existingBranch) {
      return res.status(400).json({
        message: "Branch with this name or code already exists",
      })
    }

    // Create branch
    const branch = new Branch({
      name,
      code,
      description,
    })

    await branch.save()

    res.status(201).json(branch)
  } catch (error) {
    console.error("Create branch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router

