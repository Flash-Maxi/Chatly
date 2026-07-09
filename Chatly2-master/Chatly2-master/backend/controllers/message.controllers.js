import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage=async (req,res)=>{
    try {
        let sender=req.userId
        let {receiver}=req.params
        let {message}=req.body

        let image;
        if(req.file){
            image=`/uploads/${req.file.filename}`
        }

        let conversation=await Conversation.findOne({
            partcipants:{$all:[sender,receiver]}
        })

        let newMessage=await Message.create({
            sender,receiver,message,image
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