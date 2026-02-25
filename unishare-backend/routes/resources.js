import express from "express"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { auth } from "../middleware/auth.js"
import Resource from "../models/Resource.js"
import User from "../models/User.js"
import Subject from "../models/Subject.js"
import Branch from "../models/Branch.js"
import upload from "../middleware/upload.js"
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinarySignedUrl,
} from "../config/cloudinary.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

const isTruthy = (value) => ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase())

const isLocalStorageAllowed = () => {
  if (process.env.ALLOW_LOCAL_STORAGE !== undefined) {
    return isTruthy(process.env.ALLOW_LOCAL_STORAGE)
  }

  return process.env.NODE_ENV !== "production"
}

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
    let isOwner = false

    if (req.user) {
      isBookmarked = req.user.bookmarks.includes(resource._id)
      isOwner = req.user._id.toString() === resource.uploader._id.toString()
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
        _id: resource.uploader._id,
      },
      reviews: resource.reviews,
      isBookmarked,
      isOwner,
      // Process files based on their source
      files:
        resource.files && resource.files.length > 0
          ? resource.files.map((file) => {
              if (file.source === "drive") {
                // Return Google Drive file info
                return {
                  filename: file.name,
                  originalname: file.name,
                  mimetype: file.mimeType,
                  size: file.size,
                  downloadUrl: file.downloadUrl,
                  viewUrl: file.viewUrl,
                  source: "drive",
                  fileId: file.fileId,
                }
              } else if (file.source === "cloudinary") {
                const cloudinaryOriginalName = file.originalname || file.name || file.filename
                const signedViewUrl = getCloudinarySignedUrl(file.fileId, cloudinaryOriginalName)
                const signedDownloadUrl = getCloudinarySignedUrl(file.fileId, cloudinaryOriginalName, {
                  asAttachment: true,
                })

                return {
                  filename: file.filename || file.name,
                  originalname: file.originalname || file.name,
                  mimetype: file.mimetype || file.mimeType,
                  size: file.size,
                  downloadUrl: signedDownloadUrl || file.downloadUrl,
                  viewUrl: signedViewUrl || file.viewUrl,
                  source: "cloudinary",
                  fileId: file.fileId,
                }
              } else {
                // Create a download URL for local files
                const baseUrl = `${req.protocol}://${req.get("host")}`
                const downloadUrl = `${baseUrl}/api/resources/download/${resource._id}/${file.filename}`
                const viewUrl = downloadUrl

                return {
                  filename: file.filename,
                  originalname: file.originalname,
                  mimetype: file.mimetype,
                  size: file.size,
                  downloadUrl: downloadUrl,
                  viewUrl: viewUrl,
                  source: "local",
                }
              }
            })
          : [],
    }

    res.json(formattedResource)
  } catch (error) {
    console.error("Get resource error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create resource with files uploaded to Google Drive
router.post("/", auth, upload.array("files", 5), async (req, res) => {
  try {
    console.log("Processing resource upload...")
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

    console.log(
      "Files received:",
      req.files.map((f) => f.originalname),
    )

    const cloudinaryEnabled = isCloudinaryConfigured()
    const allowLocalStorage = isLocalStorageAllowed()

    let fileData = []
    if (cloudinaryEnabled) {
      console.log("Using Cloudinary storage...")

      for (const file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file.path, file.originalname)

          fileData.push({
            fileId: uploadResult.publicId,
            name: file.originalname,
            originalname: file.originalname,
            size: uploadResult.bytes || file.size,
            mimeType: file.mimetype,
            viewUrl: uploadResult.secureUrl,
            downloadUrl: uploadResult.secureUrl,
            source: "cloudinary",
          })

          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
          }
        } catch (cloudinaryError) {
          console.error(`Failed to upload ${file.originalname} to Cloudinary:`, cloudinaryError)

          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
          }

          return res.status(502).json({
            message: "Cloud upload failed. Please retry in a moment.",
          })
        }
      }
    }

    // If cloud upload is not available, use local files
    if (fileData.length === 0) {
      if (!allowLocalStorage) {
        for (const file of req.files) {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
          }
        }

        return res.status(503).json({
          message: "Persistent storage is unavailable. Configure Cloudinary to upload files.",
        })
      }

      console.log("Using local file storage as fallback...")
      fileData = req.files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        source: "local",
      }))
    }

    // Determine file type from first file
    const fileExtension = req.files[0].originalname.split(".").pop().toLowerCase()
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
      files: fileData,
      fileType,
      tags: normalizedTags,
      driveFolderId: null,
    })

    await resource.save()
    console.log("Resource saved successfully:", resource._id)

    // Increment user's upload count
    await User.findByIdAndUpdate(req.user._id, { $inc: { uploadCount: 1 } })

    res.status(201).json(resource)
  } catch (error) {
    console.error("Create resource error:", error)

    // Clean up any temporary files
    if (req.files) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
          console.log(`Cleaned up temporary file: ${file.path}`)
        }
      }
    }

    res.status(500).json({ message: "Server error: " + (error.message || "Unknown error") })
  }
})

// Create resource from Google Drive selected files
router.post("/drive-files", auth, async (req, res) => {
  try {
    const { title, description, branch, semester, subject, tags, driveFiles } = req.body

    if (!title || !description || !branch || !semester || !subject) {
      return res.status(400).json({ message: "Please fill in all required fields" })
    }

    if (!Array.isArray(driveFiles) || driveFiles.length === 0) {
      return res.status(400).json({ message: "No Google Drive files selected" })
    }

    const branchExists = await Branch.findById(branch)
    if (!branchExists) {
      return res.status(400).json({ message: "Invalid branch" })
    }

    const subjectExists = await Subject.findById(subject)
    if (!subjectExists) {
      return res.status(400).json({ message: "Invalid subject" })
    }

    if (subjectExists.branch.toString() !== branch || subjectExists.semester.toString() !== semester.toString()) {
      return res.status(400).json({
        message: "Subject does not belong to the selected branch and semester",
      })
    }

    const mappedDriveFiles = driveFiles
      .map((file) => {
        const fileId = file.id || file.fileId
        const fileName = file.name || file.originalname || "Google Drive File"
        const mimeType = file.mimeType || file.type || "application/octet-stream"
        const viewUrl = file.viewUrl || file.url || (fileId ? `https://drive.google.com/file/d/${fileId}/view` : null)
        const downloadUrl =
          file.downloadUrl || (fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : viewUrl)

        return {
          fileId,
          name: fileName,
          originalname: fileName,
          size: Number(file.sizeBytes || file.size || 0),
          mimeType,
          viewUrl,
          downloadUrl,
          source: "drive",
        }
      })
      .filter((file) => file.fileId || file.viewUrl)

    if (mappedDriveFiles.length === 0) {
      return res.status(400).json({ message: "Selected Google Drive files are invalid" })
    }

    const firstFileName = mappedDriveFiles[0].name || ""
    const fileExtension = firstFileName.includes(".") ? firstFileName.split(".").pop().toLowerCase() : "drive"
    const fileType = fileExtension || "drive"

    const parsedTags = tags ? (Array.isArray(tags) ? tags : [tags]) : []
    const normalizedTags = parsedTags.map((tag) => tag.toLowerCase())

    const resource = new Resource({
      title,
      description,
      branch,
      semester,
      subject,
      uploader: req.user._id,
      files: mappedDriveFiles,
      fileType,
      tags: normalizedTags,
      driveFolderId: null,
    })

    await resource.save()

    await User.findByIdAndUpdate(req.user._id, { $inc: { uploadCount: 1 } })

    res.status(201).json(resource)
  } catch (error) {
    console.error("Create resource from Google Drive error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add a new route to increment download count without downloading
router.post("/:id/increment-downloads", async (req, res) => {
  try {
    const resourceId = req.params.id

    // Find resource and increment download count
    await Resource.findByIdAndUpdate(resourceId, { $inc: { downloads: 1 } })

    res.json({ success: true })
  } catch (error) {
    console.error("Error incrementing downloads:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add this route to get file information for a resource
router.get("/:id/file-info", async (req, res) => {
  try {
    const resourceId = req.params.id

    // Find resource
    const resource = await Resource.findById(resourceId)

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    // Check if resource has files
    if (!resource.files || resource.files.length === 0) {
      return res.status(404).json({ message: "No files found for this resource" })
    }

    // Return file information
    res.json({
      files: resource.files.map((file) => {
        if (file.source === "drive") {
          return {
            filename: file.name,
            originalname: file.name,
            mimetype: file.mimeType,
            size: file.size,
            downloadUrl: file.downloadUrl,
            viewUrl: file.viewUrl,
            source: "drive",
            fileId: file.fileId,
          }
        } else if (file.source === "cloudinary") {
          const cloudinaryOriginalName = file.originalname || file.name || file.filename
          const signedViewUrl = getCloudinarySignedUrl(file.fileId, cloudinaryOriginalName)
          const signedDownloadUrl = getCloudinarySignedUrl(file.fileId, cloudinaryOriginalName, {
            asAttachment: true,
          })

          return {
            filename: file.filename || file.name,
            originalname: file.originalname || file.name,
            mimetype: file.mimetype || file.mimeType,
            size: file.size,
            downloadUrl: signedDownloadUrl || file.downloadUrl,
            viewUrl: signedViewUrl || file.viewUrl,
            source: "cloudinary",
            fileId: file.fileId,
          }
        } else {
          const baseUrl = `${req.protocol}://${req.get("host")}`
          const downloadUrl = `${baseUrl}/api/resources/download/${resource._id}/${file.filename}`

          return {
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            downloadUrl: downloadUrl,
            viewUrl: downloadUrl,
            source: "local",
          }
        }
      }),
    })
  } catch (error) {
    console.error("Get file info error:", error)
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

// Delete a resource - updated to delete from Google Drive
router.delete("/:id", auth, async (req, res) => {
  try {
    const resourceId = req.params.id

    // Find the resource
    const resource = await Resource.findById(resourceId)

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    // Check if the user is the owner of the resource
    if (resource.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own resources" })
    }

    // Delete all files from Google Drive
    if (resource.files && resource.files.length > 0) {
      for (const file of resource.files) {
        if (file.source === "drive" && file.fileId) {
          console.log(`Skipping delete for legacy Google Drive file: ${file.fileId}`)
        } else if (file.source === "cloudinary" && file.fileId) {
          try {
            await deleteFromCloudinary(file.fileId)
            console.log(`Deleted file from Cloudinary: ${file.fileId}`)
          } catch (error) {
            console.error(`Error deleting file from Cloudinary: ${file.fileId}`, error)
          }
        } else if (file.source === "local" && file.path) {
          // Delete local file if it exists
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
            console.log(`Deleted local file: ${file.path}`)
          }
        }
      }
    }

    // Delete the resource folder in Google Drive if it exists
    if (resource.driveFolderId) {
      console.log(`Skipping delete for legacy Google Drive folder: ${resource.driveFolderId}`)
    }

    // Remove resource from all users' bookmarks
    await User.updateMany({ bookmarks: resourceId }, { $pull: { bookmarks: resourceId }, $inc: { bookmarkCount: -1 } })

    // Decrement uploader's upload count
    await User.findByIdAndUpdate(resource.uploader, { $inc: { uploadCount: -1 } })

    // Delete the resource
    await Resource.findByIdAndDelete(resourceId)

    res.json({ message: "Resource deleted successfully" })
  } catch (error) {
    console.error("Delete resource error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Download a file
router.get("/download/:resourceId/:filename", async (req, res) => {
  try {
    const { resourceId, filename } = req.params

    // Find the resource
    const resource = await Resource.findById(resourceId)

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    // Find the file in the resource
    const file = resource.files.find((f) => f.filename === filename || f.name === filename)

    if (!file) {
      return res.status(404).json({ message: "File not found" })
    }

    // Increment download count
    await Resource.findByIdAndUpdate(resourceId, { $inc: { downloads: 1 } })

    if (file.source === "drive" || file.source === "cloudinary") {
      // Redirect to hosted file download URL
      if (file.source === "cloudinary") {
        const cloudinaryOriginalName = file.originalname || file.name || file.filename
        const signedDownloadUrl = getCloudinarySignedUrl(file.fileId, cloudinaryOriginalName, {
          asAttachment: true,
        })
        if (signedDownloadUrl) {
          return res.redirect(signedDownloadUrl)
        }
      }

      if (file.downloadUrl) {
        return res.redirect(file.downloadUrl)
      } else {
        return res.status(404).json({ message: "Download URL not available" })
      }
    } else {
      const resourcesDir = path.join(__dirname, "..", "uploads", "resources")
      const safeFilename = path.basename(file.filename || file.originalname || filename)
      const normalizedStoredPath = file.path ? path.normalize(file.path) : null

      const candidatePaths = [
        normalizedStoredPath,
        safeFilename ? path.join(resourcesDir, safeFilename) : null,
        file.path && safeFilename ? path.join(path.dirname(file.path), safeFilename) : null,
      ].filter(Boolean)

      const existingPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath))

      if (!existingPath) {
        return res.status(404).json({ message: "File not found on server" })
      }

      // Set headers for file download
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file.originalname)}"`)
      res.setHeader("Content-Type", file.mimetype || "application/octet-stream")

      // Stream the file to the response
      const fileStream = fs.createReadStream(existingPath)
      fileStream.pipe(res)
    }
  } catch (error) {
    console.error("Download file error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
