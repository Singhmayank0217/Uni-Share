import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudyGroup",
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  fileUrl: {
    type: String,
    default: null,
  },
  fileName: {
    type: String,
    default: null,
  },
  fileType: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create TTL index for automatic deletion after 24 hours
// This only applies to the messages, not the study groups
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

const Message = mongoose.model("Message", messageSchema)

export default Message

