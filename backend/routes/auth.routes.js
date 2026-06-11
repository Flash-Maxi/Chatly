import express from "express"
import { login, logOut, signUp, verifyOtp, resendOtp } from "../controllers/auth.controllers.js"

const authRouter=express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/login",login)
authRouter.post("/verify-otp",verifyOtp)
authRouter.post("/resend-otp",resendOtp)
authRouter.get("/logout",logOut)

export default authRouter