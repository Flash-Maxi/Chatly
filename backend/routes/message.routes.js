import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { getMessages, sendMessage, clearConversation, translateMessage } from "../controllers/message.controllers.js"
import { messageLimiter, uploadLimiter } from "../middlewares/rateLimiter.js"

const messageRouter=express.Router()

// messageLimiter: 60 sends/min — real-time chat budget.
// uploadLimiter stacks on top because /send also accepts images (Cloudinary quota).
messageRouter.post("/send/:receiver",   isAuth, messageLimiter, uploadLimiter, upload.single("image"), sendMessage)
messageRouter.get("/get/:receiver",     isAuth, getMessages)
messageRouter.delete("/clear/:receiver", isAuth, clearConversation)
// translateMessage is a per-message API call — same message budget applies.
messageRouter.post("/translate",        isAuth, messageLimiter, translateMessage)

export default messageRouter
