import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { auth } from "../middleware/auth.js"
import axios from "axios"
import crypto from "crypto"

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

// GitHub OAuth login
router.post("/github", async (req, res) => {
  try {
    const { code } = req.body

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      },
    )

    const { access_token } = tokenResponse.data

    // Get user data from GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${access_token}`,
      },
    })

    const userData = userResponse.data

    // Get user email (might be private)
    let email = userData.email
    if (!email) {
      const emailsResponse = await axios.get("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })

      // Get primary email
      const primaryEmail = emailsResponse.data.find((email) => email.primary)
      email = primaryEmail ? primaryEmail.email : emailsResponse.data[0].email
    }

    // Check if user exists
    let user = await User.findOne({ githubId: userData.id })

    if (!user) {
      // Check if email is already in use
      const existingUser = await User.findOne({ email })

      if (existingUser) {
        // Link GitHub account to existing user
        existingUser.githubId = userData.id
        existingUser.avatar = userData.avatar_url
        user = await existingUser.save()
      } else {
        // Create new user
        const uid = `GH${userData.id}`
        user = new User({
          name: userData.name || userData.login,
          email,
          password: crypto.randomBytes(16).toString("hex"), // Random password
          uid,
          githubId: userData.id,
          avatar: userData.avatar_url,
        })

        await user.save()
      }
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
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error("GitHub login error:", error)
    res.status(500).json({ message: "GitHub authentication failed" })
  }
})

// Google OAuth login
router.post("/google", async (req, res) => {
  try {
    const { token: idToken } = req.body

    // Verify Google token
    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`)

    if (!response.data) {
      return res.status(400).json({ message: "Invalid Google token" })
    }

    const { sub: googleId, email, name, picture } = response.data

    // Check if user exists
    let user = await User.findOne({ googleId })

    if (!user) {
      // Check if email is already in use
      const existingUser = await User.findOne({ email })

      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = googleId
        existingUser.avatar = picture
        user = await existingUser.save()
      } else {
        // Create new user
        const uid = `G${googleId.slice(-8)}`
        user = new User({
          name,
          email,
          password: crypto.randomBytes(16).toString("hex"), // Random password
          uid,
          googleId,
          avatar: picture,
        })

        await user.save()
      }
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
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error("Google login error:", error)
    res.status(500).json({ message: "Google authentication failed" })
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

