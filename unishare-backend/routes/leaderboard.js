import express from "express"
import User from "../models/User.js"
import Resource from "../models/Resource.js"

const router = express.Router()

// Get leaderboard data
router.get("/", async (req, res) => {
  try {
    const { type = "uploads" } = req.query

    // Get all users with resources
    const users = await User.find({}).select("name uid uploadCount")

    // Get resources for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const resources = await Resource.find({ uploader: user._id })

        if (resources.length === 0) {
          return null // Skip users with no resources
        }

        // Calculate stats
        const totalDownloads = resources.reduce((sum, resource) => sum + resource.downloads, 0)
        const totalRatings = resources.reduce((sum, resource) => sum + resource.totalRatings, 0)
        const totalRatingSum = resources.reduce(
          (sum, resource) => sum + (resource.averageRating * resource.totalRatings || 0),
          0,
        )
        const averageRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0

        return {
          _id: user._id,
          name: user.name,
          uid: user.uid,
          uploads: resources.length,
          downloads: totalDownloads,
          averageRating: averageRating,
          resourceCount: resources.length,
        }
      }),
    )

    // Filter out null values (users with no resources)
    const filteredUsers = usersWithStats.filter((user) => user !== null)

    // Sort based on type
    let sortedUsers
    switch (type) {
      case "downloads":
        sortedUsers = filteredUsers.sort((a, b) => b.downloads - a.downloads)
        break
      case "ratings":
        sortedUsers = filteredUsers.sort((a, b) => b.averageRating - a.averageRating)
        break
      default: // uploads
        sortedUsers = filteredUsers.sort((a, b) => b.uploads - a.uploads)
    }

    res.json(sortedUsers)
  } catch (error) {
    console.error("Leaderboard error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router

