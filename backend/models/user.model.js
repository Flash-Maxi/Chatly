import mongoose from "mongoose";

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
    otp: {
    type: String,
    },
    otpExpires: {
    type: Date,
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