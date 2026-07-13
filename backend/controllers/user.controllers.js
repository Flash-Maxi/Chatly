import uploadOnCloudinary from "../config/cloudinary.js"
import User, { SUPPORTED_LANGUAGES } from "../models/user.model.js"
import Message from "../models/message.model.js"
import mongoose from "mongoose"

export const getCurrentUser=async (req,res)=>{
try {
    let user=await User.findById(req.userId).select("-password")
    if(!user){
        return res.status(400).json({message:"user not found"})
    }

    return res.status(200).json(user)
} catch (error) {
    return res.status(500).json({message:`current user error ${error}`})
}
}

export const editProfile=async (req,res)=>{
    try {
        let {name}=req.body
        const nameRegex = /^[A-Za-z ]+$/;
        if (name && !nameRegex.test(name)) {
            return res.status(400).json({ success: false, message: "Name should contain alphabets only" });
        }
        const user = await User.findById(req.userId)
        
        if(!user){
            return res.status(400).json({message:"user not found"})
        }

        if(req.file){
            // try uploading to Cloudinary, fall back to local uploads path
            const uploadedUrl = await uploadOnCloudinary(req.file.path)
            if (uploadedUrl) {
                user.image = uploadedUrl
            } else {
                user.image = `/uploads/${req.file.filename}`
            }
        }

        if (typeof name === "string") {
            user.name = name.trim()
        }

        await user.save()

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`profile error ${error}`})
    }
}

export const getOtherUsers=async (req,res)=>{
    try {
        const currentUserId = new mongoose.Types.ObjectId(req.userId)

        const latestMessageMap = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: currentUserId },
                        { receiver: currentUserId }
                    ]
                }
            },
            {
                $addFields: {
                    conversationPartner: {
                        $cond: [
                            { $eq: ["$sender", currentUserId] },
                            "$receiver",
                            "$sender"
                        ]
                    }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: "$conversationPartner",
                    lastMessageAt: { $first: "$createdAt" }
                }
            }
        ])

        const latestMessageByUser = new Map(
            latestMessageMap.map((item) => [item._id.toString(), item.lastMessageAt])
        )

        let users=await User.find({
            _id:{$ne:req.userId}
        }).select("-password")

        const usersWithRecency = users.map((user) => {
            const userObject = user.toObject()
            userObject.lastMessageAt = latestMessageByUser.get(user._id.toString()) || null
            return userObject
        })

        // Sort by lastMessageAt descending — most recent conversation first.
        // Users with no messages (lastMessageAt = null) sink to the bottom.
        usersWithRecency.sort((a, b) => {
            const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
            const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
            return bTime - aTime
        })

        return res.status(200).json(usersWithRecency)
    } catch (error) {
        return res.status(500).json({message:`get other users error ${error}`})
    }
}

export const updateLanguage = async (req, res) => {
    try {
        const { language } = req.body

        if (!language) {
            return res.status(400).json({ message: "Language is required" })
        }

        if (!SUPPORTED_LANGUAGES.includes(language)) {
            return res.status(400).json({ message: "Invalid language selected" })
        }

        const user = await User.findById(req.userId)

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

        user.language = language
        await user.save()

        const updatedUser = await User.findById(req.userId).select("-password")
        return res.status(200).json(updatedUser)
    } catch (error) {
        return res.status(500).json({ message: `update language error ${error}` })
    }
}

export const search =async (req,res)=>{
    try {
        let {query}=req.query
        if(!query){
            return res.status(400).json({message:"query is required"})
        }
        let users=await User.find({
            $or:[
                {name:{$regex:query,$options:"i"}},
                {userName:{$regex:query,$options:"i"}},
            ]
        })
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({message:`search users error ${error}`})
    }
}
