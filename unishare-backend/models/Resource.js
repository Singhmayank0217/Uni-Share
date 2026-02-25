import mongoose from "mongoose"

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    files: [
      {
        // For local files
        filename: String,
        originalname: String,
        path: String,
        size: Number,
        mimetype: String,

        // For Google Drive files
        fileId: String,
        name: String,
        viewUrl: String,
        downloadUrl: String,
        mimeType: String,

        // Source of the file (local or drive)
        source: {
          type: String,
          enum: ["local", "drive", "cloudinary"],
          default: "local",
        },
      },
    ],
    driveFolderId: {
      type: String, // Google Drive folder ID for this resource
      default: null,
    },
    fileType: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Virtual for bookmarked status (to be populated in controller)
resourceSchema.virtual("isBookmarked").get(() => false)

// Add a pre-save hook to calculate average rating
resourceSchema.pre("save", function (next) {
  // Calculate average rating
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0)
    this.averageRating = totalRating / this.reviews.length
    this.totalRatings = this.reviews.length
  }

  next()
})

const Resource = mongoose.model("Resource", resourceSchema)

export default Resource
