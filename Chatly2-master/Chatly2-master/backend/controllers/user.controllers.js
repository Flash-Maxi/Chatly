import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../models/user.model.js"

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

        if(name){
            user.name = name
        }

        await user.save()

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`profile error ${error}`})
    }
}

export const getOtherUsers=async (req,res)=>{
    try {
        let users=await User.find({
            _id:{$ne:req.userId}
        }).select("-password")
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({message:`get other users error ${error}`})
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