import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dp from "../assets/dp.webp"
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { BiLogOutCircle } from "react-icons/bi";
import { serverUrl } from '../main';
import getImageUrl from '../utils/getImageUrl';
import axios from 'axios';
import { setOtherUsers, setSearchData, setSelectedUser, setUserData } from '../redux/userSlice';
import { clearUserUnread } from '../redux/messageSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
function SideBar() {
    let {userData,otherUsers,selectedUser,onlineUsers,searchData} = useSelector(state=>state.user)
    let { unreadUsers } = useSelector(state => state.message)
    let [search,setSearch]=useState(false)
    let [input,setInput]=useState("")
let dispatch=useDispatch()
let navigate=useNavigate()
    const handleLogOut=async ()=>{
        try {
            let result =await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
dispatch(setUserData(null))
dispatch(setOtherUsers(null))
navigate("/login")
        } catch (error) {
            console.log(error)
        }
    }

    const handlesearch=async ()=>{
        try {
            let result =await axios.get(`${serverUrl}/api/user/search?query=${input}`,{withCredentials:true})
            dispatch(setSearchData(result.data))
           
        }
        catch(error){
console.log(error)
        }
    }

    useEffect(()=>{
        if(input){
            handlesearch()
        }

    },[input])

    const listVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } }
    }
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
    }

  return (
      <div className={`relative w-[350px] shrink-0 h-screen bg-bgSidebar/80 backdrop-blur-xl border-r border-white/10 p-4 ${selectedUser ? 'hidden md:flex' : 'flex'} flex-col`}>
          {/* App Name */}
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-extrabold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6 tracking-tight"
          >
            chatly
          </motion.h1>

          {/* User greeting */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-4 text-textMain"
          >
            Hii, <span className="font-semibold">{userData.name || "user"}</span>
          </motion.p>

          {/* Search */}
          <div className="relative mb-6">
            {!search ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    role="button"
                    tabIndex={0}
                    aria-label="Search users"
                    className='w-[50px] h-[50px] rounded-md overflow-hidden flex justify-center items-center bg-bgSurface/70 border border-white/10 cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                    onClick={()=>setSearch(true)}
                    onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); setSearch(true) } }}
                >
                    <IoIosSearch className='w-[25px] h-[25px] text-textSub'/>
                </motion.div>
            ) : (
                <motion.form
                    initial={{ opacity: 0, width: '50px' }}
                    animate={{ opacity: 1, width: '100%' }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className='w-full h-[50px] bg-bgSurface/70 border border-primary/40 flex items-center gap-[10px] rounded-md overflow-hidden px-4 relative shadow-sm'
                >
                    <IoIosSearch className='w-[20px] h-[20px] text-textSub shrink-0'/>
                    <input 
                        type="text" 
                        placeholder='Search users...' 
                        aria-label="Search users"
                        className='flex-1 h-full p-[10px] text-[17px] outline-none border-0 bg-transparent text-textMain' 
                        onChange={(e)=>setInput(e.target.value)} 
                        value={input}
                        autoFocus
                    />
                    <RxCross2
                        className='w-[20px] h-[20px] cursor-pointer text-textSub shrink-0 hover:text-textMain transition-colors'
                        aria-label="Close search"
                        onClick={()=>{setSearch(false); setInput(""); dispatch(setSearchData(null))}}
                    />
                </motion.form>
            )}

            {/* Search Results Dropdown */}
            <AnimatePresence>
            {input.length>0 && searchData && searchData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className='absolute top-[60px] left-0 right-0 bg-bgSurface/90 backdrop-blur-xl border border-white/10 h-[300px] overflow-y-auto rounded-md z-[150] shadow-2xl'
                >
                    {searchData?.map((user)=>(
                        <div key={user._id} className='w-full h-[70px] rounded-md flex items-center gap-[15px] px-4 hover:bg-bgHover cursor-pointer border-b border-gray-700/60 transition-colors' onClick={()=>{ dispatch(setSelectedUser(user)); setInput(""); setSearch(false); dispatch(setSearchData(null)); dispatch(clearUserUnread(user._id)); }}>
                            <div className='relative rounded-full bg-gray-600 flex justify-center items-center ring-2 ring-white/10'>
                                <div className='w-[50px] h-[50px] rounded-full overflow-hidden flex justify-center items-center'>
                                    <img src={getImageUrl(user.image)} alt="" className='h-[100%]' onError={(e)=>{e.target.onerror=null; e.target.src=dp}}/>
                                </div>
                                {onlineUsers?.includes(user._id) && <span className='w-[10px] h-[10px] rounded-full absolute bottom-0 right-0 bg-green-500 ring-2 ring-bgSurface'></span>}
                            </div>
                            <h1 className='text-textMain font-semibold text-[18px]'>{user.name || user.userName}</h1>
                        </div>
                    ))}
                </motion.div>
            )}
            </AnimatePresence>
          </div>

          {/* Chat list */}
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2 flex-1 overflow-auto"
          >
                {otherUsers?.map((user)=>(
                <motion.div 
                    key={user._id} 
                    variants={itemVariants}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                        className={`w-full h-[60px] flex items-center gap-[15px] px-4 rounded-md cursor-pointer transition-colors duration-200 ${selectedUser?._id === user._id ? 'bg-primary shadow-md shadow-primary/30' : 'bg-bgInput/70 hover:bg-bgHover'}`}
                        onClick={()=>{ dispatch(setSelectedUser(user)); dispatch(clearUserUnread(user._id)) }}
                >
                    <div className='relative rounded-full bg-gray-600 flex justify-center items-center ring-2 ring-white/10'>
                            <div className='w-[50px] h-[50px] rounded-full overflow-hidden flex justify-center items-center'>
                                <img src={getImageUrl(user.image)} alt="" className='h-[100%]' onError={(e)=>{e.target.onerror=null; e.target.src=dp}}/>
                            </div>
                        {onlineUsers?.includes(user._id) &&
                        <span className='w-[10px] h-[10px] rounded-full absolute bottom-0 right-0 bg-green-500 ring-2 ring-bgSidebar'></span>}
                    </div>
                    <h1 className={`font-semibold text-[18px] truncate ${selectedUser?._id === user._id ? 'text-white' : 'text-textMain'}`}>{user.name || user.userName}</h1>
                                        {unreadUsers?.[user._id] && selectedUser?._id !== user._id && (
                                                                <span className='w-3 h-3 rounded-full bg-cyan-400 ml-auto animate-pulse'></span>
                                                            )}
                </motion.div>
            ))}
          </motion.div>

          {/* Profile & Logout bottom */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                role="button"
                tabIndex={0}
                aria-label="Go to profile"
                className='w-[50px] h-[50px] rounded-full overflow-hidden flex justify-center items-center bg-bgSurface cursor-pointer ring-2 ring-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                onClick={()=>navigate("/profile")}
                onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); navigate("/profile") } }}
            >
                <img src={getImageUrl(userData.image)} alt="" className='h-[100%]' onError={(e)=>{e.target.onerror=null; e.target.src=dp}}/>
            </motion.div>
            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="text-red-400 flex items-center gap-2 hover:text-red-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-md px-2 py-1"
                onClick={handleLogOut}
            >
                <BiLogOutCircle className='w-[25px] h-[25px]'/>
                <span>Logout</span>
            </motion.button>
          </div>
    </div>
  )
}

export default SideBar