import mongoose from "mongoose";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "../config/languages.js";

export { SUPPORTED_LANGUAGES } from "../config/languages.js";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        trim: true,
        match: [/^[A-Za-z ]+$/, "Name should contain alphabets and spaces only"]
    },
    userName:{
        type:String,
        required:true,
        unique:true,
        match: [/^[A-Za-z]+$/, "Name should contain alphabets only"]
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        default:""
    },
    language:{
        type:String,
        required:true,
        default:DEFAULT_LANGUAGE,
        enum:SUPPORTED_LANGUAGES,
    },
    otp: {
    type: String,
    },
    otpExpires: {
    type: Date,
    },
    resetOTP: {
        type: String,
    },
    resetOTPExpires: {
        type: Date,
    },
    otpVerified: {
        type: Boolean,
        default: false,
    },
        otpResendCount: {
            type: Number,
            default: 0,
        },
        otpResendLast: {
            type: Date,
        },
    isVerified: {
    type: Boolean,
    default: false,
    }
},{timestamps:true})

const User=mongoose.model("User",userSchema)

export default User
