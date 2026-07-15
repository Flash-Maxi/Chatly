// import genToken from "../config/token.js"
// import User from "../models/user.model.js"
// import bcrypt from "bcryptjs"

// export const signUp=async (req,res)=>{
//    try {
//     const {userName,email,password}=req.body
//     const checkUserByUserName=await User.findOne({userName})
//     if(checkUserByUserName){
//         return res.status(400).json({message:"userName already exist"})
//     }
//     const checkUserByEmail=await User.findOne({email})
//     if(checkUserByEmail){
//         return res.status(400).json({message:"email already exist"})
//     }
// if(password.length<6){
//     return res.status(400).json({message:"password must be at least 6 characters"})
// }

// const hashedPassword=await bcrypt.hash(password,10)

// const user=await User.create({
//     userName,email,password:hashedPassword
// })

// const token=await genToken(user._id)

// res.cookie("token", token, {
//     httpOnly: true,
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//     sameSite: "lax", // 'lax' for local dev, 'none' for cross-site HTTPS
//     secure: false     // false for local dev, true for HTTPS
// });

//    return res.status(201).json(user)


//    } catch (error) {
//     return res.status(500).json({message:`signup error ${error}`})
//    } 
// }
// export const login = async (req, res) => {
//     try {
//         console.log("[LOGIN ATTEMPT]", req.body); // Log incoming payload
//         const { email, password } = req.body;
//         if (!email || !password) {
//             return res.status(400).json({ message: "Email and password are required" });
//         }
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: "User not found" });
//         }
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: "Incorrect password" });
//         }
//         const token = await genToken(user._id);
//         res.cookie("token", token, {
//             httpOnly: true,
//             maxAge: 7 * 24 * 60 * 60 * 1000,
//             sameSite: "lax", // 'lax' for local dev, 'none' for cross-site HTTPS
//             secure: false     // false for local dev, true for HTTPS
//         });
//         return res.status(200).json(user);
//     } catch (error) {
//         console.log("[LOGIN ERROR]", error);
//         return res.status(500).json({ message: `login error ${error}` });
//     }
// };

//  export const logOut=async (req,res)=>{
//     try {
//         res.clearCookie("token")
//         return res.status(200).json({message:"log out successfully"})
//     } catch (error) {
//         return res.status(500).json({message:`logout error ${error}`})
//     }

//  }

import genToken from "../config/token.js";
import User, { SUPPORTED_LANGUAGES } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sendMail, { sendPasswordResetMail } from "../config/sendMail.js";
import validatePassword from "../utils/passwordValidator.js";

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const signUp = async (req, res) => {
  try {
    const { userName, email, password, language } = req.body;

    const preferredLanguage = language || "English";
    if (!SUPPORTED_LANGUAGES.includes(preferredLanguage)) {
      return res.status(400).json({ message: "Invalid language selected" });
    }

    const nameRegex = /^[A-Za-z]+$/;
    if (!userName || !nameRegex.test(userName)) {
      return res.status(400).json({ message: "Name should contain alphabets only" });
    }

    const checkUserByUserName = await User.findOne({ userName });
    if (checkUserByUserName) {
      return res.status(400).json({ message: "userName already exist" });
    }

    const checkUserByEmail = await User.findOne({ email });
    if (checkUserByEmail) {
      return res.status(400).json({ message: "email already exist" });
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return res.status(400).json({
        success: false,
        message: pwCheck.message,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();

    const user = await User.create({
      userName,
      email,
      password: hashedPassword,
      language: preferredLanguage,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    });

    const mailSent = await sendMail(email, otp);

    if (!mailSent) {
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        message: "Failed to send OTP. Please try again.",
      });
    }

    return res.status(201).json({
      message: "Signup successful. OTP sent to your email.",
      email: user.email,
      language: user.language,
    });
  } catch (error) {
    return res.status(500).json({ message: `signup error ${error}` });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // A password-reset OTP is intentionally kept separate from signup OTPs.
    // This preserves the existing account-verification flow at this URL.
    if (user.resetOTP || user.resetOTPExpires || user.otpVerified) {
      return verifyPasswordResetOtp(req, res, user);
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User already verified",
      });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({
        message: "OTP not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "OTP expired. Please signup again.",
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    const token = await genToken(user._id);

    // For local development: use `sameSite: 'lax'` and `secure: false`.
    // In production (cross-site), use `sameSite: 'none'` and `secure: true`.
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });

    return res.status(200).json({
      message: "OTP verified successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: `verify otp error ${error}`,
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log("[LOGIN ATTEMPT]", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email before login",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

    const token = await genToken(user._id);

    const isProd2 = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProd2 ? "none" : "lax",
      secure: isProd2,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.log("[LOGIN ERROR]", error);
    return res.status(500).json({
      message: `login error ${error}`,
    });
  }
};

export const logOut = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    // clear with same options used when setting the cookie
    res.clearCookie("token", { httpOnly: true, sameSite: isProd ? "none" : "lax", secure: isProd });

    return res.status(200).json({
      message: "log out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: `logout error ${error}`,
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    const now = Date.now();
    // reset count if last resend was more than 1 hour ago
    if (user.otpResendLast && now - new Date(user.otpResendLast).getTime() > 60 * 60 * 1000) {
      user.otpResendCount = 0;
    }

    // enforce minimum interval (e.g., 60s) and max attempts per hour (e.g., 3)
    if (user.otpResendLast && now - new Date(user.otpResendLast).getTime() < 60 * 1000) {
      return res.status(429).json({ message: "Please wait before requesting another OTP" });
    }
    if ((user.otpResendCount || 0) >= 3) {
      return res.status(429).json({ message: "Too many resend attempts. Try again later." });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpResendCount = (user.otpResendCount || 0) + 1;
    user.otpResendLast = Date.now();

    const mailSent = await sendMail(email, otp);
    if (!mailSent) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    await user.save();
    return res.status(200).json({ message: "OTP resent" });
  } catch (error) {
    console.log('resendOtp error', error);
    return res.status(500).json({ message: `resend otp error ${error}` });
  }
};

const verifyPasswordResetOtp = async (req, res, existingUser = null) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = existingUser || await User.findOne({ email });
    if (!user || !user.resetOTP || !user.resetOTPExpires) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (new Date(user.resetOTPExpires).getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
    }

    const isMatch = await bcrypt.compare(String(otp), user.resetOTP);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    user.otpVerified = true;
    await user.save();
    return res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to verify OTP. Please try again." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email." });

    const otp = generateOtp();
    user.resetOTP = await bcrypt.hash(otp, 10);
    user.resetOTPExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.otpVerified = false;
    await user.save();

    const mailSent = await sendPasswordResetMail(user.email, otp);
    if (!mailSent) {
      user.resetOTP = undefined;
      user.resetOTPExpires = undefined;
      user.otpVerified = false;
      await user.save();
      return res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }

    return res.status(200).json({ message: "OTP has been sent to your email." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to send OTP. Please try again." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Email, password, and confirm password are required" });
    }
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return res.status(400).json({ success: false, message: pwCheck.message });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otpVerified || !user.resetOTPExpires) {
      return res.status(400).json({ message: "Please verify your OTP before resetting your password." });
    }
    if (new Date(user.resetOTPExpires).getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    user.otpVerified = false;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to reset password. Please try again." });
  }
};
