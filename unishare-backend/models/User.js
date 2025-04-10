import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    uid: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],
    bookmarkCount: {
      type: Number,
      default: 0,
    },
    uploadCount: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    googleId: String,
    githubId: String,
    avatar: String,
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  const password = this.password
  const isHashed = password.startsWith("$2b$") || password.startsWith("$2a$") // bcrypt format

  if (!isHashed) {
    this.password = await bcrypt.hash(password, 10)
  }
  next()
})

const User = mongoose.model("User", userSchema)

export default User
