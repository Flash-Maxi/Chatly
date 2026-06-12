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
  return (
      <div className={`w-[350px] shrink-0 h-screen bg-bgSidebar p-4 ${selectedUser ? 'hidden md:flex' : 'flex'} flex-col`}>
          {/* App Name */}
          <h1 className="text-xl font-bold text-primary mb-6">chatly</h1>

          {/* User greeting */}
          <p className="mb-4 text-textMain">Hii, {userData.name || "user"}</p>

          {/* Search */}
          <div className="relative mb-6">
            {!search ? (
                <div className='w-[50px] h-[50px] rounded-md overflow-hidden flex justify-center items-center bg-bgSurface cursor-pointer' onClick={()=>setSearch(true)}>
                    <IoIosSearch className='w-[25px] h-[25px] text-textSub'/>
                </div>
            ) : (
                <form className='w-full h-[50px] bg-bgSurface flex items-center gap-[10px] rounded-md overflow-hidden px-4 relative'>
                    <IoIosSearch className='w-[20px] h-[20px] text-textSub'/>
                    <input 
                        type="text" 
                        placeholder='Search users...' 
                        className='flex-1 h-full p-[10px] text-[17px] outline-none border-0 bg-transparent text-textMain' 
                        onChange={(e)=>setInput(e.target.value)} 
                        value={input}
                        autoFocus
                    />
                    <RxCross2 className='w-[20px] h-[20px] cursor-pointer text-textSub' onClick={()=>{setSearch(false); setInput(""); dispatch(setSearchData(null))}}/>
                </form>
            )}
          </div>

          {/* Search Results Dropdown */}
          {input.length>0 && searchData && searchData.length > 0 && (
            <div className='absolute top-[180px] left-4 right-4 bg-bgSurface h-[300px] overflow-y-auto rounded-md z-[150] shadow-lg'>
                {searchData?.map((user)=>(
                    <div key={user._id} className='w-full h-[70px] rounded-md flex items-center gap-[15px] px-4 hover:bg-bgHover cursor-pointer border-b border-gray-700' onClick={()=>{ dispatch(setSelectedUser(user)); setInput(""); setSearch(false); dispatch(setSearchData(null)); dispatch(clearUserUnread(user._id)); }}>
                        <div className='relative rounded-full bg-gray-600 flex justify-center items-center'>
                            <div className='w-[50px] h-[50px] rounded-full overflow-hidden flex justify-center items-center'>
                                <img src={getImageUrl(user.image)} alt="" className='h-[100%]' onError={(e)=>{e.target.onerror=null; e.target.src=dp}}/>
                            </div>
                            {onlineUsers?.includes(user._id) && <span className='w-[10px] h-[10px] rounded-full absolute bottom-0 right-0 bg-green-500'></span>}
                        </div>
                        <h1 className='text-textMain font-semibold text-[18px]'>{user.name || user.userName}</h1>
                    </div>
                ))}
            </div>
          )}

          {/* Chat list */}
          <div className="flex flex-col gap-2 flex-1 overflow-auto">
                {otherUsers?.map((user)=>(
                <div 
                    key={user._id} 
                        className={`w-full h-[60px] flex items-center gap-[15px] px-4 rounded-md cursor-pointer ${selectedUser?._id === user._id ? 'bg-primary' : 'bg-bgInput hover:bg-bgHover'}`}
                        onClick={()=>{ dispatch(setSelectedUser(user)); dispatch(clearUserUnread(user._id)) }}
                >
                    <div className='relative rounded-full bg-gray-600 flex justify-center items-center'>
                            <div className='w-[50px] h-[50px] rounded-full overflow-hidden flex justify-center items-center'>
                                <img src={getImageUrl(user.image)} alt="" className='h-[100%]' onError={(e)=>{e.target.onerror=null; e.target.src=dp}}/>
                            </div>
                        {onlineUsers?.includes(user._id) &&
                        <span className='w-[10px] h-[10px] rounded-full absolute bottom-0 right-0 bg-green-500'></span>}
                    </div>
                    <h1 className={`font-semibold text-[18px] ${selectedUser?._id === user._id ? 'text-white' : 'text-textMain'}`}>{user.name || user.userName}</h1>
                                        {unreadUsers?.[user._id] && selectedUser?._id !== user._id && (
                                                                <span className='w-3 h-3 rounded-full bg-cyan-400 ml-auto'></span>
                                                            )}
                </div>
            ))}
          </div>

          {/* Profile & Logout bottom */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
            <div className='w-[50px] h-[50px] rounded-full overflow-hidden flex justify-center items-center bg-bgSurface cursor-pointer' onClick={()=>navigate("/profile")}>
                <img src={getImageUrl(userData.image)} alt="" className='h-[100%]' onError={(e)=>{e.target.onerror=null; e.target.src=dp}}/>
            </div>
            <button className="text-red-400 flex items-center gap-2 hover:text-red-300" onClick={handleLogOut}>
                <BiLogOutCircle className='w-[25px] h-[25px]'/>
                <span>Logout</span>
            </button>
          </div>
    </div>
  )
}

export default SideBar