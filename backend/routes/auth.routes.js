import express from "express"
import { forgotPassword, login, logOut, resetPassword, signUp, verifyOtp, resendOtp } from "../controllers/auth.controllers.js"
import { authLimiter } from "../middlewares/rateLimiter.js"

const authRouter=express.Router()

// authLimiter: 5 requests / 15 minutes per IP on every sensitive auth action.
// GET /logout is intentionally excluded — it only clears a cookie and is harmless.
authRouter.post("/signup",        authLimiter, signUp)
authRouter.post("/login",         authLimiter, login)
authRouter.post("/verify-otp",    authLimiter, verifyOtp)
authRouter.post("/resend-otp",    authLimiter, resendOtp)
authRouter.post("/forgot-password", authLimiter, forgotPassword)
authRouter.post("/reset-password",  authLimiter, resetPassword)
authRouter.get("/logout", logOut)

export default authRouter
