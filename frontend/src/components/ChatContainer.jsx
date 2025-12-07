import React, { useEffect } from 'react'
import assets, { messagesDummyData } from '../assets/assets'
import { useRef } from 'react';
import { formatMessageTime } from '../lib/utils';
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import { useState } from 'react';

const ChatContainer = () => {
  const { messages,selectedUser, setSelectedUser,sendMessage,getMessages } = useContext(ChatContext);
  const {authUser,onlineUsers}=useContext(AuthContext);

  const[input,setInput]=useState("")
  const scrollEnd = useRef();

  const handleSendMessage=async(e)=>{
    e.preventDefault();
    if(input.trim()==="") return null;
    await sendMessage({text:input.trim()});
    setInput("");
  
  }

  //handle sending an image
  const handleSendImage=async(e)=>{
    const file=e.target.files[0];
    if(!file || !file.type.startsWith("image/")) 
    {
      toast.error("Please select a valid image file");
      return
    }
    const reader=new FileReader();
    reader.onloadend=async()=>{
      await sendMessage({image:reader.result});
      e.target.value="";
      
    }
    reader.readAsDataURL(file);
  }

  useEffect(()=>{
  if(selectedUser){
    getMessages(selectedUser._id);
  }
  },[selectedUser]);  

  useEffect(()=>{
    if(scrollEnd.current && messages){
      scrollEnd.current.scrollIntoView({behavior: 'smooth'});
    }
  },[messages])
  return selectedUser ? (

    /* ================================
       MAIN CHAT CONTAINER (When a user is selected)
       ================================ */
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>

      {/* ================================
          HEADER SECTION
          - Shows profile picture
          - Shows username
          - Shows online dot
          - Shows back arrow (mobile)
          - Shows help icon (desktop)
         ================================ */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>

        {/* User Profile Image (static for now) */}
        <img 
          src={selectedUser.profilePic || assets.avatar_icon} 
          alt=""
          className='w-8 rounded-full'
        />

        {/* Username + Online Indicator */}
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
         {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
        </p>

        {/* Back Arrow (Only visible on mobile) */}
        <img 
          onClick={() => setSelectedUser(null)} 
          src={assets.arrow_icon} 
          className='md:hidden max-w-7'
          alt="" 
        />

        {/* Help Icon (Hidden on mobile) */}
        <img 
          src={assets.help_icon} 
          className='max-md:hidden max-w-5' 
          alt="" 
        />
      </div>

      {/* ================================
          CHAT AREA SECTION 
          - Displays all messages
          - Loops over messagesDummyData
          - Handles LEFT/RIGHT orientation
          ================================ */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6 '>
        
        {messages.map((message, index) => (

          /* ------------------------------------
             SINGLE CHAT BUBBLE CONTAINER
             Logic:
             - If senderId matches → message goes RIGHT
             - Else → message goes LEFT
             ------------------------------------ */
          <div
            key={index}
            className={
              `flex items-end gap-2 justify-end ` +
              `${message.senderId !==  authUser._id 
                && 'flex-row-reverse'  // IF not sender → reverse → message at left
              }`
            }
          >

            {/* ======================================
               MESSAGE CONTENT LOGIC 
               If message has image → show image
               Else → show text bubble
               ====================================== */}
            {message.image ? (

              /* Image Message */
              <img 
                src={message.image} 
                alt="" 
                className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8'
              />

            ) : (

              /* Text Message Bubble */
              <p
                className={
                  `p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all 
                   bg-violet-500/30 text-white `
                  +
                  // Round corner logic based on sender
                  `${message.senderId === authUser._id
                    ? 'rounded-br-none'  // Sender → remove bottom-right corner
                    : 'rounded-bl-none'  // Receiver → remove bottom-left corner
                  }`
                }
              >
                {message.text}
              </p>
            )}

            {/* ======================================
               AVATAR + TIMESTAMP SECTION
               - Shows small image based on sender
               - Shows time under message
               ====================================== */}
            <div className='text-center text-xs'>
              
              {/* Chat Avatar (different for sender/receiver) */}
              <img 
                src={
                  message.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon     // Sender photo
                    : selectedUser?.profilePic || assets.avatar_icon  // Receiver photo
                } 
                className='w-7 rounded-full'
                alt=""
              />

              {/* Timestamp */}
              <p className='text-gray-500'>{formatMessageTime(message.createdAt)}</p>
            </div>
          </div>
        ))}
         <div ref={scrollEnd}></div>
      </div>
      {/*-------bottom Area-------*/}
      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input 
          onChange={(e)=>setInput(e.target.value)}
          value={input}
          onKeyDown={(e)=>e.key==="Enter"?handleSendMessage(e):null}
                type="text" 
                 placeholder='Send a message'
                 className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'/>

          <input 
                onChange={handleSendImage}
                 type="file"
                 id='image'
                 accept='image/png,image/jpeg' hidden/>

          <label htmlFor="image">
                 <img 
                     src={assets.gallery_icon}
                     className='w-5 mr-2 cursor-pointer'/>
          </label>
        </div>
        <img 
        onClick={handleSendMessage}
        src={assets.send_button} 
             className='w-7 cursor-pointer' 
             alt=""/>
      </div>

    </div>
  ) : (
    /* ================================
       DEFAULT EMPTY CHAT UI (No user selected)
       ================================ */
    <div 
        className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
      <img 
         src={assets.logo_icon}
         className='max-w-16' 
         alt="" />
      <p 
        className='text-lg font-medium text-white'>
          Chat anytime,anywhere!
      </p>
    </div>
  )
}

export default ChatContainer
