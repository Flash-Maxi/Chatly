import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { requestTranslation } from "../services/translation.service.js";

export const sendMessage=async (req,res)=>{
    try {
        let sender=req.userId
        let {receiver}=req.params
        let {message}=req.body
        const senderUser = await User.findById(sender).select("language");

        let image;
        if(req.file){
            image=`/uploads/${req.file.filename}`
        }

        let conversation=await Conversation.findOne({
            partcipants:{$all:[sender,receiver]}
        })

        let newMessage=await Message.create({
            sender,receiver,message,image,senderLanguage: senderUser?.language || "English"
        })

        if(!conversation){
            conversation=await Conversation.create({
                partcipants:[sender,receiver],
                messages:[newMessage._id]
            })
        }else{
            conversation.messages.push(newMessage._id)
            await conversation.save()
        }

        const receiverSocketId=getReceiverSocketId(receiver)
if(receiverSocketId){
    io.to(receiverSocketId).emit("newMessage",newMessage)
}

        return res.status(201).json(newMessage)
    
    } catch (error) {
        return res.status(500).json({message:`send Message error ${error}`})
    }
}

export const translateMessage = async (req, res) => {
    try {
        const { text, sourceLanguage, targetLanguage } = req.body;

        if (typeof text !== "string" || !text.trim() || !sourceLanguage || !targetLanguage) {
            return res.status(400).json({ message: "Text, source language, and target language are required" });
        }

        const translatedText = await requestTranslation({ text, sourceLanguage, targetLanguage });
        return res.status(200).json({ translatedText });
    } catch (error) {
        console.error("translate message error", error);
        return res.status(error.statusCode || 500).json({ message: error.message || "Unable to translate message" });
    }
};

export const getMessages=async (req,res)=>{
    try {
        let sender=req.userId
        let {receiver}=req.params
        let conversation=await Conversation.findOne({
            partcipants:{$all:[sender,receiver]}
        }).populate("messages")

        return res.status(200).json(conversation?.messages)
    } catch (error) {
        return res.status(500).json({message:`get Message error ${error}`})
    }
}

export const clearConversation = async (req, res) => {
    try {
        const sender = req.userId;
        const { receiver } = req.params;

        const conversation = await Conversation.findOne({
            partcipants: { $all: [sender, receiver] },
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // delete all message documents referenced by the conversation
        const messageIds = conversation.messages || [];
        if (messageIds.length > 0) {
            await Message.deleteMany({ _id: { $in: messageIds } });
        }

        // clear the messages array on conversation
        conversation.messages = [];
        await conversation.save();

        return res.status(200).json({ message: "Conversation cleared" });
    } catch (error) {
        console.log('clearConversation error', error);
        return res.status(500).json({ message: `clear conversation error ${error}` });
    }
};
