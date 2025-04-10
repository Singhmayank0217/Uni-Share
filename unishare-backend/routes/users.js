import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { auth } from "../middleware/auth.js"
import User from "../models/User.js"
import Resource from "../models/Resource.js"
import crypto from "crypto"
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router()

// ✅ Correctly scoped transporter function
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

// ---------------------- AUTH ROUTES -----------------------------

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })
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
    const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } })
    if (existingUser) return res.status(400).json({ message: "Email is already in use" })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, uid },
      { new: true }
    ).select("-password")

    res.json(user)
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Change password
router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: "User not found" })

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" })

    user.password = newPassword
    user.markModified("password")
    await user.save()

    const token = jwt.sign({ user: { _id: user._id } }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" })

    res.json({ message: "Password updated successfully", token })
  } catch (error) {
    console.error("Update password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// ---------------------- PASSWORD RESET -----------------------------

// Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(200).json({
        message: "If an account with that email exists, a password reset link has been sent.",
      })
    }

    const resetToken = crypto.randomBytes(20).toString("hex")
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour

    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = resetTokenExpiry
    await user.save()

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${resetToken}`

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset Request",
      text: `You are receiving this because you (or someone else) requested a password reset for your account.

Please click on the following link, or paste it into your browser to complete the process:

${resetUrl}

If you did not request this, please ignore this email and your password will remain unchanged.`,
    }

    const transporter = createTransporter()
    await transporter.sendMail(mailOptions)

    console.log("✅ Email sent to:", user.email)
    console.log("🔗 Reset URL:", resetUrl)

    res.status(200).json({
      message: "If an account with that email exists, a password reset link has been sent.",
    })
  } catch (error) {
    console.error("❌ Forgot password error:", error)
    res.status(500).json({ message: "Server error while sending reset email" })
  }
})

// Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" })
    }

    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.status(200).json({ message: "Password has been reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// ---------------------- USER STATS & RESOURCES -----------------------------

router.get("/stats", auth, async (req, res) => {
  try {
    const uploads = await Resource.countDocuments({ uploader: req.user._id })
    const user = await User.findById(req.user._id)
    const resources = await Resource.find({ uploader: req.user._id })

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

router.get("/bookmarks", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: "User not found" })

    const bookmarkedResources = await Resource.find({ _id: { $in: user.bookmarks } })
      .populate("branch", "name code")
      .populate("subject", "name code")
      .populate("uploader", "name uid")
      .sort({ createdAt: -1 })

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
