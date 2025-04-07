import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { auth } from "../middleware/auth.js"
import User from "../models/User.js"
import Resource from "../models/Resource.js"
import crypto from "crypto"

const router = express.Router()

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, uid } = req.body

    // Check if email is already in use by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } })
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" })
    }

    // Update user
    const user = await User.findByIdAndUpdate(req.user._id, { name, email, uid }, { new: true }).select("-password")

    res.json(user)
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user password
router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Get user with password
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    // Hash new password - Note: we don't use the save middleware here to avoid potential issues
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)

    // Save the updated user
    await user.save()

    // Generate a new token with updated user data
    const payload = {
      user: {
        _id: user._id,
      },
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "7d" })

    // Return success and new token
    res.json({
      message: "Password updated successfully",
      token,
    })
  } catch (error) {
    console.error("Update password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    // Find the user
    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal that the user doesn't exist for security
      return res
        .status(200)
        .json({ message: "If an account with that email exists, a password reset link has been sent." })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex")
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour

    // Update user with reset token
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = resetTokenExpiry
    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${resetToken}`

    // For development - log the reset URL to console
    console.log("Password reset URL:", resetUrl)

    // In a production environment, you would send an email here
    // We're skipping the actual email sending for now

    res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" })
    }

    // Hash new password - Note: we explicitly hash it here rather than using the middleware
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)

    // Clear reset token fields
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    res.status(200).json({ message: "Password has been reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user stats
router.get("/stats", auth, async (req, res) => {
  try {
    const uploads = await Resource.countDocuments({ uploader: req.user._id })
    const user = await User.findById(req.user._id)

    // Get resources uploaded by user
    const resources = await Resource.find({ uploader: req.user._id })

    // Calculate total views and downloads
    const totalViews = resources.reduce((sum, resource) => sum + resource.views, 0)
    const totalDownloads = resources.reduce((sum, resource) => sum + resource.downloads, 0)

    res.json({
      uploads,
      bookmarks: user.bookmarks.length,
      reviews: user.reviewCount || 0,
      totalViews,
      totalDownloads,
    })
  } catch (error) {
    console.error("Get user stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user uploads
router.get("/uploads", auth, async (req, res) => {
  try {
    const resources = await Resource.find({ uploader: req.user._id })
      .populate("branch", "name code")
      .populate("subject", "name code")
      .sort({ createdAt: -1 })

    res.json(resources)
  } catch (error) {
    console.error("Get user uploads error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user bookmarks
router.get("/bookmarks", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get bookmarked resources
    const bookmarkedResources = await Resource.find({ _id: { $in: user.bookmarks } })
      .populate("branch", "name code")
      .populate("subject", "name code")
      .populate("uploader", "name uid")
      .sort({ createdAt: -1 })

    // Add isBookmarked flag
    const resourcesWithBookmarkFlag = bookmarkedResources.map((resource) => {
      const resourceObj = resource.toObject()
      resourceObj.isBookmarked = true
      return resourceObj
    })

    res.json(resourcesWithBookmarkFlag)
  } catch (error) {
    console.error("Get user bookmarks error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router

