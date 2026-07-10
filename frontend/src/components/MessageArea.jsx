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
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { isRomanHindi } from '../utils/isRomanHindi';

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
let menuRef=useRef()
let messageInputRef=useRef()
let emojiButtonRef=useRef()
let emojiPickerRef=useRef()
let messageListRef=useRef()
let hinglishWarningConversations=useRef(new Set())
let {messages}=useSelector(state=>state.message)
const { error: showError, warning: showWarning } = useToast()

const clearSelectedImage = () => {
  setFrontendImage(null)
  setBackendImage(null)
  if (image.current) image.current.value = ''
}

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
  if (!file) return
  if (!file.type.startsWith('image/')) {
    showError('format not supported')
    e.target.value = ''
    return
  }
  setBackendImage(file)
  setFrontendImage(URL.createObjectURL(file))
    }
const handleSendMessage=async (e)=>{
  e.preventDefault()
  if(input.length==0 && backendImage==null){
    return 
  }

  const conversationId = String(selectedUser?._id || '')
  if (
    conversationId
    && !hinglishWarningConversations.current.has(conversationId)
    && isRomanHindi(input, userData?.language)
  ) {
    showWarning(
      'For better translation accuracy, write Hindi in Devanagari script (हिन्दी). Messages written in Roman Hindi (Hinglish) may not translate correctly.',
      5000,
    )
    hinglishWarningConversations.current.add(conversationId)
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
    const message = error?.response?.data?.message || 'Failed to send message'
    showError(message)
    clearSelectedImage()
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
  if (!menuOpen) return;

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuOpen(false)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)

  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [menuOpen])

useEffect(() => {
  if (selectedUser && messageInputRef.current) {
    messageInputRef.current.focus()
  }
}, [selectedUser?._id])

useEffect(() => {
  if (!showPicker) return

  const handleClickOutside = (e) => {
    if (emojiButtonRef.current && !emojiButtonRef.current.contains(e.target) && emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
      setShowPicker(false)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)

  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [showPicker])

useEffect(() => {
  const messageList = messageListRef.current
  if (!messageList) return

  messageList.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' })
}, [messages.length, selectedUser?._id])
 
  return (
    <div className={`flex-1 min-w-0 min-h-0 h-full relative ${selectedUser ? 'flex' : 'hidden md:flex'} bg-bgMain border-l border-white/10 overflow-hidden`}>
      
{selectedUser && 
<div className='w-full h-full min-h-0 flex flex-col overflow-hidden'>
  {/* ChatHeader */}
  <div className="shrink-0 h-[75px] flex items-center justify-between px-4 sm:px-6 border-b border-white/10 bg-bgMain/80 backdrop-blur-xl z-20">
    {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
      <motion.button
        whileHover={{ scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Back"
        className="text-textMain text-3xl cursor-pointer hover:text-primary shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
        onClick={()=>dispatch(setSelectedUser(null))}
      >
        <IoIosArrowRoundBack />
      </motion.button>

      <div className='relative shrink-0'>
        <img src={getImageUrl(selectedUser?.image)} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30" onError={(e)=>{e.target.onerror=null; e.target.src=dp}} />
        {onlineUsers?.includes(selectedUser._id) && (
          <span className='absolute bottom-0 right-0 w-[10px] h-[10px] rounded-full bg-green-500 ring-2 ring-bgMain'></span>
        )}
      </div>

      <div className='min-w-0'>
        <p className="font-semibold text-textMain truncate">{selectedUser?.name || selectedUser?.userName || "user"}</p>
        {onlineUsers?.includes(selectedUser._id) && <p className="text-sm text-green-400">online</p>}
      </div>
    </div>

    {/* Right */}
    <div className="relative shrink-0" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Chat options"
        onClick={() => setMenuOpen(!menuOpen)}
        className="text-textMain text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-bgSurface/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        ⋮
      </motion.button>

      <AnimatePresence>
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="absolute right-0 mt-2 w-40 bg-bgSurface/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          <button
            onClick={handleClearChat}
            className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-400 transition-colors"
          >
            Clear Chat
          </button>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  </div>

  {/* MessageList */}
  <div ref={messageListRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
    <div className="min-h-full p-4 sm:p-6 flex flex-col gap-4 justify-end">
    <AnimatePresence>
    {showPicker && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className='absolute bottom-[90px] left-4 z-50'
        ref={emojiPickerRef}
      >
        <EmojiPicker width={250} height={350} className='shadow-2xl rounded-xl overflow-hidden' onEmojiClick={onEmojiClick}/>
      </motion.div>
    )}
    </AnimatePresence>

    {messages && messages.map((mess) => (
      mess.sender === userData._id
        ? <SenderMessage key={mess._id} image={mess.image} message={mess.message} onImageClick={(img)=>setSelectedImage(img)} />
        : <ReceiverMessage
            key={mess._id}
            messageId={mess._id}
            image={mess.image}
            message={mess.message}
            senderLanguage={mess.senderLanguage}
            translatedText={mess.translatedText}
            isTranslated={mess.isTranslated}
            onImageClick={(img)=>setSelectedImage(img)}
          />
    ))}
    </div>
  </div>

  {/* ChatInput */}
  <div className='shrink-0 w-full bg-bgSurface/80 backdrop-blur-xl px-4 sm:px-5 py-4 border-t border-white/10'>
    <AnimatePresence>
    {frontendImage && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className='absolute bottom-[100px] right-4 sm:right-6'
      >
        <img src={frontendImage} alt="" className='w-[80px] rounded-lg shadow-xl ring-2 ring-primary/40'/>
      </motion.div>
    )}
    </AnimatePresence>
    <form className='w-full h-[58px] bg-bgChat/80 backdrop-blur-md flex items-center gap-3 px-4 rounded-full border border-white/10 shadow-sm focus-within:border-primary/60 transition-colors' onSubmit={handleSendMessage}>
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={()=>setShowPicker(prev=>!prev)} className='cursor-pointer' role="button" aria-label="Toggle emoji picker" tabIndex={0} ref={emojiButtonRef}>
        <RiEmojiStickerLine className='w-[22px] h-[22px] text-textSub hover:text-textMain transition-colors'/>
      </motion.div>
      <input type="file" accept="image/*" ref={image} hidden onChange={handleImage}/>
      <input 
        type="text" 
        aria-label="Message"
        className='flex-1 h-full outline-none border-0 text-base text-textMain bg-transparent placeholder-textSub w-full' 
        placeholder='Message' 
        onChange={(e)=>setInput(e.target.value)} 
        value={input}
        ref={messageInputRef}
      />
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={()=>image.current.click()} className='cursor-pointer' role="button" aria-label="Attach image" tabIndex={0}>
        <FaImages className='w-[22px] h-[22px] text-textSub hover:text-textMain transition-colors'/>
      </motion.div>
      <AnimatePresence>
      {(input.length>0 || backendImage!=null) && (
        <motion.button
          type="submit"
          aria-label="Send message"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className='cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full'
        >
          <RiSendPlane2Fill className='w-[22px] h-[22px] text-primary hover:opacity-80'/>
        </motion.button>
      )}
      </AnimatePresence>
    </form>
  </div>
</div> 
}
{!selectedUser && 
<div className='relative w-full h-full flex flex-col justify-center items-center overflow-hidden'>
  <div className='pointer-events-none absolute inset-0 overflow-hidden' aria-hidden="true">
    <div className='absolute top-1/4 -left-20 w-[300px] h-[300px] rounded-full bg-primary/20 blur-[110px]' />
    <div className='absolute bottom-1/4 -right-20 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[110px]' />
  </div>
  <motion.h1
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className='relative z-10 bg-gradient-to-r from-textMain to-textMain/60 bg-clip-text text-transparent font-bold text-3xl sm:text-4xl text-center px-4'
  >
    Welcome to Chatly
  </motion.h1>
  <motion.span
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
    className='relative z-10 text-textSub font-semibold text-xl mt-2'
  >
    Chat Friendly !
  </motion.span>
</div>}

<AnimatePresence>
{selectedImage && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setSelectedImage(null)}
      >
        <div className="absolute top-4 left-6 flex gap-4 text-white text-2xl">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="hover:text-gray-300 cursor-pointer"
            title="Download image"
          >
            <FaDownload />
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-6 text-white text-3xl hover:text-gray-300"
          onClick={() => setSelectedImage(null)}
          title="Close"
        >
          ×
        </motion.button>

        <motion.img
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.2 }}
          src={selectedImage}
          alt="preview"
          className="max-w-full max-h-full rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    )}
</AnimatePresence>

    </div>
  )
}

export default MessageArea
