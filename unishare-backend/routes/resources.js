import express from "express"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { auth } from "../middleware/auth.js"
import upload from "../middleware/upload.js"
import Resource from "../models/Resource.js"
import User from "../models/User.js"
import Subject from "../models/Subject.js"
import Branch from "../models/Branch.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Get all resources with filters
router.get("/", async (req, res) => {
  try {
    const { branch, semester, subject, category, sortBy, search } = req.query

    // Build query
    const query = {}

    if (branch) {
      query.branch = branch
    }

    if (semester) {
      query.semester = semester
    }

    if (subject) {
      query.subject = subject
    }

    // Fix: Make category search case-insensitive and handle hyphenated categories
    if (category) {
      // Convert hyphenated categories to regular form and handle multiple formats
      const normalizedCategory = category.replace(/-/g, " ").toLowerCase()

      // Create a more flexible regex pattern
      query.$or = [
        { tags: { $regex: new RegExp(normalizedCategory, "i") } },
        { tags: { $regex: new RegExp(category, "i") } },
        { tags: { $regex: new RegExp(category.replace(/-/g, ""), "i") } },
      ]

      console.log(`Searching for category with patterns:`, query.$or)
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ]
    }

    // Build sort options
    let sortOptions = {}

    switch (sortBy) {
      case "oldest":
        sortOptions = { createdAt: 1 }
        break
      case "rating":
        sortOptions = { averageRating: -1 }
        break
      case "downloads":
        sortOptions = { downloads: -1 }
        break
      case "views":
        sortOptions = { views: -1 }
        break
      default:
        sortOptions = { createdAt: -1 } // newest first
    }

    // Get resources
    const resources = await Resource.find(query)
      .populate("branch", "name code")
      .populate("subject", "name code")
      .populate("uploader", "name uid")
      .sort(sortOptions)
      .limit(50)

    console.log(`Found ${resources.length} resources matching query:`, query)

    // Format resources for response
    const formattedResources = resources.map((resource) => {
      // Check if resource is bookmarked by user (if authenticated)
      let isBookmarked = false
      if (req.user) {
        isBookmarked = req.user.bookmarks.includes(resource._id)
      }

      return {
        _id: resource._id,
        title: resource.title,
        description: resource.description,
        branch: resource.branch,
        semester: resource.semester,
        subject: resource.subject,
        fileType: resource.fileType,
        tags: resource.tags,
        views: resource.views,
        downloads: resource.downloads,
        averageRating: resource.averageRating,
        createdAt: resource.createdAt,
        uploader: {
          name: resource.uploader.name,
          uid: resource.uploader.uid,
        },
        isBookmarked,
      }
    })

    res.json(formattedResources)
  } catch (error) {
    console.error("Get resources error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get resource by ID
router.get("/:id", async (req, res) => {
  try {
    const resourceId = req.params.id

    // Find resource and increment view count
    const resource = await Resource.findByIdAndUpdate(resourceId, { $inc: { views: 1 } }, { new: true })
      .populate("branch", "name code")
      .populate("subject", "name code")
      .populate("uploader", "name uid")
      .populate("reviews.user", "name uid")

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    // Check if resource is bookmarked by user (if authenticated)
    let isBookmarked = false
    if (req.user) {
      isBookmarked = req.user.bookmarks.includes(resource._id)
    }

    // Format resource for response
    const formattedResource = {
      _id: resource._id,
      title: resource.title,
      description: resource.description,
      branch: resource.branch,
      semester: resource.semester,
      subject: resource.subject,
      fileType: resource.fileType,
      tags: resource.tags,
      views: resource.views,
      downloads: resource.downloads,
      averageRating: resource.averageRating,
      createdAt: resource.createdAt,
      uploader: {
        name: resource.uploader.name,
        uid: resource.uploader.uid,
      },
      reviews: resource.reviews,
      isBookmarked,
    }

    res.json(formattedResource)
  } catch (error) {
    console.error("Get resource error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new resource
router.post("/", auth, upload.array("files", 5), async (req, res) => {
  try {
    const { title, description, branch, semester, subject, tags } = req.body

    // Validate branch
    const branchExists = await Branch.findById(branch)
    if (!branchExists) {
      return res.status(400).json({ message: "Invalid branch" })
    }

    // Validate subject
    const subjectExists = await Subject.findById(subject)
    if (!subjectExists) {
      return res.status(400).json({ message: "Invalid subject" })
    }

    // Validate subject belongs to branch and semester
    if (subjectExists.branch.toString() !== branch || subjectExists.semester.toString() !== semester) {
      return res.status(400).json({
        message: "Subject does not belong to the selected branch and semester",
      })
    }

    // Process files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" })
    }

    const files = req.files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
    }))

    // Determine file type from first file
    const fileExtension = path.extname(req.files[0].originalname).toLowerCase().substring(1)
    const fileType = fileExtension

    // Create resource - Ensure tags are properly normalized
    const parsedTags = tags ? (Array.isArray(tags) ? tags : [tags]) : []

    // Convert tags to lowercase for better searching/filtering
    const normalizedTags = parsedTags.map((tag) => tag.toLowerCase())

    const resource = new Resource({
      title,
      description,
      branch,
      semester,
      subject,
      uploader: req.user._id,
      files,
      fileType,
      tags: normalizedTags,
    })

    await resource.save()

    // Increment user's upload count
    await User.findByIdAndUpdate(req.user._id, { $inc: { uploadCount: 1 } })

    res.status(201).json(resource)
  } catch (error) {
    console.error("Create resource error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Download resource
router.get("/:id/download", async (req, res) => {
  try {
    const resourceId = req.params.id

    // Find resource and increment download count
    const resource = await Resource.findByIdAndUpdate(resourceId, { $inc: { downloads: 1 } }, { new: true })

    if (!resource || !resource.files || resource.files.length === 0) {
      return res.status(404).json({ message: "Resource not found" })
    }

    // Get first file (main file)
    const file = resource.files[0]
    const filePath = path.join(__dirname, "..", file.path)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" })
    }

    // Set headers
    res.setHeader("Content-Disposition", `attachment; filename="${file.originalname}"`)
    res.setHeader("Content-Type", file.mimetype)

    // Stream file
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
  } catch (error) {
    console.error("Download resource error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Bookmark/unbookmark resource
router.post("/:id/bookmark", auth, async (req, res) => {
  try {
    const resourceId = req.params.id
    const userId = req.user._id

    // Check if resource exists
    const resource = await Resource.findById(resourceId)
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    // Find user
    const user = await User.findById(userId)

    // Check if already bookmarked
    const isBookmarked = user.bookmarks.includes(resourceId)

    if (isBookmarked) {
      // Remove bookmark
      await User.findByIdAndUpdate(userId, {
        $pull: { bookmarks: resourceId },
        $inc: { bookmarkCount: -1 },
      })

      res.json({ message: "Bookmark removed" })
    } else {
      // Add bookmark
      await User.findByIdAndUpdate(userId, {
        $addToSet: { bookmarks: resourceId },
        $inc: { bookmarkCount: 1 },
      })

      res.json({ message: "Resource bookmarked" })
    }
  } catch (error) {
    console.error("Bookmark resource error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add review to resource
router.post("/:id/reviews", auth, async (req, res) => {
  try {
    const resourceId = req.params.id
    const { rating, comment } = req.body

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" })
    }

    // Find resource
    const resource = await Resource.findById(resourceId)
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    // Check if user already reviewed this resource
    const existingReviewIndex = resource.reviews.findIndex(
      (review) => review.user && review.user.toString() === req.user._id.toString(),
    )

    // Use direct MongoDB update to avoid validation issues
    const updateOperation =
      existingReviewIndex !== -1
        ? {
            $set: {
              [`reviews.${existingReviewIndex}.rating`]: rating,
              [`reviews.${existingReviewIndex}.comment`]: comment || "",
            },
          }
        : {
            $push: {
              reviews: {
                user: req.user._id,
                rating,
                comment: comment || "",
                createdAt: new Date(),
              },
            },
          }

    // If it's a new review, increment the user's review count
    if (existingReviewIndex === -1) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { reviewCount: 1 } })
    }

    // Update the resource
    await Resource.findByIdAndUpdate(resourceId, updateOperation)

    // Recalculate average rating
    const updatedResource = await Resource.findById(resourceId)
    const totalRating = updatedResource.reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / updatedResource.reviews.length

    // Update average rating and total ratings
    await Resource.findByIdAndUpdate(resourceId, {
      $set: {
        averageRating,
        totalRatings: updatedResource.reviews.length,
      },
    })

    res.json({ message: "Review added successfully" })
  } catch (error) {
    console.error("Add review error:", error)
    res.status(500).json({ message: error.message || "Failed to submit review" })
  }
})

export default router

