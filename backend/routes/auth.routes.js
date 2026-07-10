import express from "express"
import { forgotPassword, login, logOut, resetPassword, signUp, verifyOtp, resendOtp } from "../controllers/auth.controllers.js"

const authRouter=express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/login",login)
authRouter.post("/verify-otp",verifyOtp)
authRouter.post("/resend-otp",resendOtp)
authRouter.post("/forgot-password", forgotPassword)
authRouter.post("/reset-password", resetPassword)
authRouter.get("/logout",logOut)

export default authRouter
