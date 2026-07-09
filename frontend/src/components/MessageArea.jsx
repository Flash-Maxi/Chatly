import React, { useEffect, useRef, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import dp from "../assets/dp.webp"
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedUser, moveUserToTop } from '../redux/userSlice';
import { RiEmojiStickerLine } from "react-icons/ri";
import { FaImages, FaDownload } from "react-icons/fa6";
import { RiSendPlane2Fill } from "react-icons/ri";
import EmojiPicker from 'emoji-picker-react';
import SenderMessage from './SenderMessage';
import ReceiverMessage from './ReceiverMessage';
import axios from 'axios';
import { serverUrl } from '../main';
import getImageUrl from '../utils/getImageUrl';
import { setMessages, addMessage, markUserUnread } from '../redux/messageSlice';

// Global socket reference - will be set from App component
let globalSocket = null;
export const setGlobalSocket = (socket) => {
  globalSocket = socket;
}

function MessageArea() {
  let {selectedUser,userData,onlineUsers}=useSelector(state=>state.user)
  let dispatch=useDispatch()
  let [showPicker,setShowPicker]=useState(false)
  let [menuOpen,setMenuOpen]=useState(false)
let [input,setInput]=useState("")
let [frontendImage,setFrontendImage]=useState(null)
let [backendImage,setBackendImage]=useState(null)
let [selectedImage,setSelectedImage]=useState(null)
let image=useRef()
let menuRef=useRef(null)
let messageInputRef=useRef(null)
let {messages}=useSelector(state=>state.message)

const handleClearChat = async () => {
  console.log("Clear Chat clicked", selectedUser?._id)
  try {
    const res = await axios.delete(`${serverUrl}/api/message/clear/${selectedUser._id}`, { withCredentials: true })
    console.log('clear conversation response', res.data)
    dispatch(setMessages([]))
    setMenuOpen(false)
  } catch (error) {
    console.log('clear conversation error', error?.response?.data || error)
  }
}
const handleImage=(e)=>{
  let file=e.target.files[0]
  setBackendImage(file)
  setFrontendImage(URL.createObjectURL(file))
    }
const handleSendMessage=async (e)=>{
  e.preventDefault()
  if(input.length==0 && backendImage==null){
    return 
  }
  try {
    let formData=new FormData()
    formData.append("message",input)
    if(backendImage){
      formData.append("image",backendImage)
    }
    let result=await axios.post(`${serverUrl}/api/message/send/${selectedUser._id}`,formData,{withCredentials:true})
    dispatch(addMessage(result.data))
    dispatch(moveUserToTop(selectedUser._id))
    setInput("")
    setFrontendImage(null)
    setBackendImage(null)
  } catch (error) {
    console.log(error)
  }
}
  const onEmojiClick =(emojiData)=>{
 setInput(prevInput=>prevInput+emojiData.emoji)
 setShowPicker(false)
  }
const handleDownload = async () => {
  try {
    const res = await fetch(selectedImage);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedImage.split("/").pop() || "chat-image.jpg";
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.log("Download error:", error);
  }
};
useEffect(() => {
  if (!globalSocket) return;

  const handleNewMessage = (mess) => {
    console.log('Socket newMessage received:', mess);
    const senderId = mess?.sender ? String(mess.sender) : null;
    const selectedUserId = selectedUser?._id ? String(selectedUser._id) : null;

    if (!senderId) return;

    if (senderId === selectedUserId) {
      dispatch(addMessage(mess));
    } else {
      dispatch(markUserUnread(senderId));
    }

    dispatch(moveUserToTop(senderId));
  };

  globalSocket.on('newMessage', handleNewMessage);

  return () => {
    globalSocket.off('newMessage', handleNewMessage);
  };
}, [selectedUser?._id, dispatch]);

useEffect(() => {
  if (selectedUser && messageInputRef.current) {
    messageInputRef.current.focus()
  }
}, [selectedUser?._id])

useEffect(() => {
  if (!menuOpen) return;

  const handleOutsideClick = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuOpen(false)
    }
  };

  document.addEventListener('mousedown', handleOutsideClick);

  return () => {
    document.removeEventListener('mousedown', handleOutsideClick);
  };
}, [menuOpen]);
 
  return (
    <div className={`flex-1 min-w-0 h-screen relative ${selectedUser ? 'flex' : 'hidden md:flex'} bg-bgMain border-l border-gray-800 overflow-hidden`}>
      
{selectedUser && 
<div className='w-full h-full flex flex-col overflow-hidden'>
  {/* ChatHeader */}
  <div className="shrink-0 h-[75px] flex items-center justify-between px-6 border-b border-gray-800">
    {/* Left */}
      <div className="flex items-center gap-3">
      <button className="text-textMain text-3xl cursor-pointer hover:text-primary shrink-0" onClick={()=>dispatch(setSelectedUser(null))}>
        <IoIosArrowRoundBack />
      </button>

      <img src={getImageUrl(selectedUser?.image)} className="w-10 h-10 rounded-full" onError={(e)=>{e.target.onerror=null; e.target.src=dp}} />

      <div>
        <p className="font-semibold text-textMain">{selectedUser?.name || "user"}</p>
        {onlineUsers?.includes(selectedUser._id) && <p className="text-sm text-green-400">online</p>}
      </div>
    </div>

    {/* Right */}
    <div className="relative" ref={menuRef}>
      <button onClick={() => setMenuOpen(!menuOpen)} className="text-textMain text-2xl">⋮</button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-bgSurface border border-gray-700 rounded-md shadow-lg z-50">
          <button
            onClick={handleClearChat}
            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400"
          >
            Clear Chat
          </button>
        </div>
      )}
    </div>
  </div>

  {/* MessageList */}
  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 justify-end">
    {showPicker && (
      <div className='absolute bottom-[90px] left-4 z-50'>
        <EmojiPicker width={250} height={350} className='shadow-lg' onEmojiClick={onEmojiClick}/>
      </div>
    )}

    {messages && messages.map((mess) => (
      mess.sender === userData._id
        ? <SenderMessage key={mess._id} image={mess.image} message={mess.message} onImageClick={(img)=>setSelectedImage(img)} />
        : <ReceiverMessage key={mess._id} image={mess.image} message={mess.message} onImageClick={(img)=>setSelectedImage(img)} />
    ))}
  </div>

  {/* ChatInput */}
  <div className='shrink-0 w-full bg-bgSurface px-5 py-4 border-t border-gray-800'>
    {frontendImage && (
      <img src={frontendImage} alt="" className='absolute bottom-[100px] right-4 w-[80px] rounded-lg shadow-lg'/>
    )}
    <form className='w-full h-[58px] bg-bgChat flex items-center gap-3 px-4 rounded-full border border-gray-700' onSubmit={handleSendMessage}>
      <div onClick={()=>setShowPicker(prev=>!prev)} className='cursor-pointer'>
        <RiEmojiStickerLine className='w-[22px] h-[22px] text-textSub hover:text-textMain'/>
      </div>
      <input type="file" accept="image/*" ref={image} hidden onChange={handleImage}/>
      <input 
        ref={messageInputRef}
        type="text" 
        className='flex-1 h-full outline-none border-0 text-base text-textMain bg-transparent placeholder-textSub w-full' 
        placeholder='Message' 
        onChange={(e)=>setInput(e.target.value)} 
        value={input}
      />
      <div onClick={()=>image.current.click()} className='cursor-pointer'>
        <FaImages className='w-[22px] h-[22px] text-textSub hover:text-textMain'/>
      </div>
      {(input.length>0 || backendImage!=null) && (
        <button type="submit" className='cursor-pointer'>
          <RiSendPlane2Fill className='w-[22px] h-[22px] text-primary hover:opacity-80'/>
        </button>
      )}
    </form>
  </div>
</div> 
}
{!selectedUser && 
<div className='w-full h-full flex flex-col justify-center items-center'>
  <h1 className='text-textMain font-bold text-4xl'>Welcome to Chatily</h1>
  <span className='text-textSub font-semibold text-xl'>Chat Friendly !</span>
</div>}

{selectedImage && (
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={() => setSelectedImage(null)}
      >
        <div className="absolute top-4 left-6 flex gap-4 text-white text-2xl">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="hover:text-gray-300 cursor-pointer"
            title="Download image"
          >
            <FaDownload />
          </button>
        </div>

        <button
          className="absolute top-4 right-6 text-white text-3xl hover:text-gray-300"
          onClick={() => setSelectedImage(null)}
          title="Close"
        >
          ×
        </button>

        <img
          src={selectedImage}
          alt="preview"
          className="max-w-full max-h-full rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )}

    </div>
  )
}

export default MessageArea