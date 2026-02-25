import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { auth } from "../middleware/auth.js"

const router = express.Router()

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" })
    }

    // Check for existing user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Create token
    const payload = {
      user: {
        _id: user._id,
      },
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "7d" })

    // Send response
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        uid: user.uid,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, uid } = req.body

    // Validate
    if (!name || !email || !password || !uid) {
      return res.status(400).json({ message: "Please enter all fields" })
    }

    // Check for existing user
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create user
    const user = new User({
      name,
      email,
      password, // Will be hashed in the pre-save middleware
      uid,
    })

    await user.save()

    // Create token
    const payload = {
      user: {
        _id: user._id,
      },
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "7d" })

    // Send response
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        uid: user.uid,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get current user
router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Verify password
router.post("/verify-password", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" })
    }

    // Check for existing user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Password is valid
    res.json({ message: "Password verified" })
  } catch (error) {
    console.error("Verify password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
