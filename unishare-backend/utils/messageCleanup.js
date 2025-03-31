import StudyGroup from "../models/StudyGroup.js"
import * as messageController from "../controllers/messageController.js"

// Main cleanup function
export const cleanupMessages = async () => {
  try {
    console.log("Starting message cleanup task...")

    // Get all study groups
    const studyGroups = await StudyGroup.find()

    for (const group of studyGroups) {
      // Clean up messages for each group
      await messageController.deleteOldMessages(group._id, 5000, 5)
    }

    console.log("Message cleanup task completed")
  } catch (error) {
    console.error("Error in message cleanup task:", error)
  }
}

// Schedule the cleanup to run every hour
export const scheduleMessageCleanup = () => {
  // Run immediately on startup
  cleanupMessages()

  // Then schedule to run every hour
  setInterval(cleanupMessages, 60 * 60 * 1000)
}

