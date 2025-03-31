import express from "express"
import { auth } from "../middleware/auth.js"
import upload from "../middleware/upload.js"
import * as studyGroupController from "../controllers/studyGroupController.js"
import * as messageController from "../controllers/messageController.js"
import * as fileController from "../controllers/fileController.js"

const router = express.Router()

// Study Group routes
router.get("/", studyGroupController.getAllGroups)
router.get("/my-groups", auth, studyGroupController.getUserGroups)
router.post("/", auth, studyGroupController.createGroup)
router.get("/:id", auth, studyGroupController.getGroupById)
router.post("/:id/join", auth, studyGroupController.joinGroup)
router.post("/:id/leave", auth, studyGroupController.leaveGroup)

// Message routes
router.get("/:id/messages", auth, messageController.getMessages)
router.post("/:id/messages", auth, upload.single("file"), fileController.uploadFile, messageController.addMessage)

// File routes
router.get("/files/:groupId/:filename", auth, fileController.downloadFile)

export default router

