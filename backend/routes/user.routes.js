import express from "express"
import { editProfile, getCurrentUser, getOtherUsers, search, updateLanguage } from "../controllers/user.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { searchLimiter, uploadLimiter } from "../middlewares/rateLimiter.js"

const userRouter=express.Router()

userRouter.get("/current",  isAuth, getCurrentUser)
userRouter.get("/others",   isAuth, getOtherUsers)
// uploadLimiter: 20 profile updates / 10 min — protects Cloudinary quota.
userRouter.put("/profile",  isAuth, uploadLimiter, upload.single("image"), editProfile)
userRouter.put("/language", isAuth, updateLanguage)
// searchLimiter: 30 searches / min — prevents username enumeration.
userRouter.get("/search",   isAuth, searchLimiter, search)

export default userRouter