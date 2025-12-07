import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import {io,userSocketMap} from "../server.js";

//Get all users except the logged in user
export const getUsersForSidebar=async(req,res)=>{
    try{
        const userId=req.user._id;
        const filterdUsers=await User.find({_id:{$ne:userId}}).select("-password")

        //count number of message not seen
        const unseenMessages={}
        const promise=filterdUsers.map(async(user)=>{
          const messages=await Message.find({senderId:user._id,receiverId:userId,seen:false})
            if(messages.length>0)  {
            unseenMessages[user._id]=messages.length;
        }
        })
        await Promise.all(promise);

        return res.status(200).json({message:"Users fetched successfully", success:true, users:filterdUsers, unseenMessages});
      
    }catch(error){
       console.log(error.message);
       return res.status(500).json({message:"Internal Server Error", success:false});
       
    }
}


//get all messages for selected user
export const getMessages=async(req,res)=>{
    try{
        const {id:selectedUserId} =req.params;
        const myId=req.user._id;

        const messages=await Message.find({
            $or:[
                {senderId:myId, receiverId:selectedUserId},
                {senderId:selectedUserId, receiverId:myId}
            ]
        });
        await Message.updateMany(
            {senderId:selectedUserId, receiverId:myId},
            {seen:true}
        );

        return res.status(200).json({message:"Messages fetched successfully", success:true, messages});

    }catch(error){

    }
}


//api to mark message as seen using message id
export const markMessageAsSeen=async(req,res)=>{
    try{
        const {id}=req.params;    
        await Message.findByIdAndUpdate(id, {seen:true});
        return res.status(200).json({message:"Message marked as seen", success:true});
    }
    catch(error){
     console.log("Error in marking message as seen", error.message);
     return res.status(500).json({message:"Internal Server Error", success:false});
    }
}

//Send message to selected user
export const sendMessage=async(req,res)=>{
    try{
       const {text,image}=req.body;
       const receiverId=req.params.id;
       const senderId=req.user._id;
       let imageUrl;
       if(image){
        const uploadResponse=await cloudinary.uploader.upload(image,{folder:"chat_images"});
        imageUrl=uploadResponse.secure_url;
       }
       const newMessage=await Message.create({
        senderId,
        receiverId,
        text,
        image:imageUrl
       });
         //emit the message to receiver if online
         const receiverSocketId=userSocketMap[receiverId];
         if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
         }

       return res.status(201).json({message:"Message sent successfully", success:true,newMessage});
    }
    catch(error){
     console.log("Error in sending message", error.message);
     return res.status(500).json({message:"Internal Server Error", success:false});
    }
}