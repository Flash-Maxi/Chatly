import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dp from "../assets/dp.webp"
import { IoIosSearch } from "react-icons/io"
import { RxCross2 } from "react-icons/rx"
import { BiLogOutCircle } from "react-icons/bi"
import { serverUrl } from '../main'
import getImageUrl from '../utils/getImageUrl'
import { formatTime } from '../utils/formatTime'
import axios from 'axios'
import { setOtherUsers, setSearchData, setSelectedUser, setUserData } from '../redux/userSlice'
import { clearUserUnread } from '../redux/messageSlice'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LanguageSelector from './LanguageSelector'

function SideBar() {
    const { userData, otherUsers, selectedUser, onlineUsers, searchData } = useSelector(state => state.user)
    const { unreadUsers } = useSelector(state => state.message)
    const [search, setSearch] = useState(false)
    const [input, setInput] = useState("")
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const displayName = userData?.name?.trim()
    const greetingName = displayName || userData?.userName

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
            dispatch(setUserData(null))
            dispatch(setOtherUsers(null))
            navigate("/login")
        } catch (error) {
            console.log(error)
        }
    }

    const handlesearch = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/search?query=${input}`, { withCredentials: true })
            dispatch(setSearchData(result.data))
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (input) {
            handlesearch()
        }
    }, [input])

    const listVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } }
    }
    const itemVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
    }

    return (
        <div className="relative w-full h-full bg-bgSidebar/80 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden">

            {/* ── Header ── */}
            <div className="shrink-0 px-3 md:px-4 pt-3 md:pt-4 pb-2">
                {/* App name + profile avatar row */}
                <div className="flex items-center justify-between mb-2 md:mb-3">
                    <motion.h1
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent tracking-tight"
                    >
                        Chatly
                    </motion.h1>

                    {/* Profile avatar (top-right on mobile) */}
                    <motion.div
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        role="button"
                        tabIndex={0}
                        aria-label="Go to profile"
                        className="w-9 h-9 md:w-[44px] md:h-[44px] rounded-full overflow-hidden flex justify-center items-center bg-bgSurface cursor-pointer ring-2 ring-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0"
                        onClick={() => navigate("/profile")}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate("/profile") } }}
                    >
                        <img src={getImageUrl(userData.image)} alt="" className="h-full w-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = dp }} />
                    </motion.div>
                </div>

                {/* Greeting */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="text-xs md:text-sm text-textSub mb-2"
                >
                    Hi, <span className="font-semibold text-textMain">{greetingName}</span>
                </motion.p>

                {/* Language selector — compact on mobile */}
                <div className="block md:hidden">
                    <LanguageSelector compact={true} />
                </div>
                <div className="hidden md:block">
                    <LanguageSelector />
                </div>

                {/* Search bar */}
                <div className="relative mb-2 md:mb-3">
                    {!search ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileTap={{ scale: 0.95 }}
                            role="button"
                            tabIndex={0}
                            aria-label="Search users"
                            className="w-full h-9 md:h-11 rounded-xl overflow-hidden flex items-center gap-2 px-3 bg-bgSurface/70 border border-white/10 cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            onClick={() => setSearch(true)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSearch(true) } }}
                        >
                            <IoIosSearch className="w-4 h-4 md:w-5 md:h-5 text-textSub" />
                            <span className="text-xs md:text-sm text-textSub">Search users…</span>
                        </motion.div>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-9 md:h-11 bg-bgSurface/70 border border-primary/40 flex items-center gap-2 rounded-xl overflow-hidden px-3 shadow-sm"
                        >
                            <IoIosSearch className="w-4 h-4 text-textSub shrink-0" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                aria-label="Search users"
                                className="flex-1 h-full text-sm outline-none border-0 bg-transparent text-textMain placeholder-textSub"
                                onChange={(e) => setInput(e.target.value)}
                                value={input}
                                autoFocus
                            />
                            <RxCross2
                                className="w-4 h-4 cursor-pointer text-textSub shrink-0 hover:text-textMain transition-colors"
                                aria-label="Close search"
                                onClick={() => { setSearch(false); setInput(""); dispatch(setSearchData(null)) }}
                            />
                        </motion.form>
                    )}

                    {/* Search results dropdown */}
                    <AnimatePresence>
                        {input.length > 0 && searchData && searchData.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-full mt-1 left-0 right-0 bg-bgSurface/95 backdrop-blur-xl border border-white/10 max-h-[260px] overflow-y-auto rounded-xl z-[150] shadow-2xl"
                            >
                                {searchData?.map((user) => (
                                    <div
                                        key={user._id}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bgHover cursor-pointer border-b border-white/5 transition-colors last:border-0"
                                        onClick={() => {
                                            dispatch(setSelectedUser(user))
                                            setInput("")
                                            setSearch(false)
                                            dispatch(setSearchData(null))
                                            dispatch(clearUserUnread(user._id))
                                        }}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/10">
                                                <img src={getImageUrl(user.image)} alt="" className="h-full w-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = dp }} />
                                            </div>
                                            {onlineUsers?.includes(user._id) && (
                                                <span className="w-2.5 h-2.5 rounded-full absolute bottom-0 right-0 bg-green-500 ring-2 ring-bgSurface" />
                                            )}
                                        </div>
                                        <span className="text-textMain font-semibold text-sm truncate">{user.name || user.userName}</span>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Chat list ── */}
            <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto overflow-x-hidden px-2 md:px-3 pb-2 flex flex-col gap-1"
            >
                {otherUsers?.map((user) => {
                    const unreadCount = unreadUsers?.[user._id] || 0
                    const isSelected = selectedUser?._id === user._id
                    const isOnline = onlineUsers?.includes(user._id)
                    const lastMsg = user.lastMessageText
                    const lastTime = user.lastMessageAt

                    return (
                        <motion.div
                            key={user._id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                                transition-colors duration-150
                                ${isSelected
                                    ? 'bg-primary shadow-md shadow-primary/30'
                                    : 'bg-bgInput/60 hover:bg-bgHover'
                                }
                            `}
                            onClick={() => {
                                dispatch(setSelectedUser(user))
                                dispatch(clearUserUnread(user._id))
                            }}
                        >
                            {/* Avatar with online indicator */}
                            <div className="relative shrink-0">
                                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden ring-2 ring-white/10">
                                    <img
                                        src={getImageUrl(user.image)}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = dp }}
                                    />
                                </div>
                                {isOnline && (
                                    <span className="w-3 h-3 rounded-full absolute bottom-0 right-0 bg-green-500 ring-2 ring-bgSidebar" />
                                )}
                            </div>

                            {/* Name + last message preview */}
                            <div className="flex-1 min-w-0">
                                <h2 className={`font-semibold text-sm md:text-[15px] truncate leading-tight ${isSelected ? 'text-white' : 'text-textMain'}`}>
                                    {user.name || user.userName}
                                </h2>
                                {lastMsg && (
                                    <p className={`text-xs truncate mt-0.5 leading-tight ${isSelected ? 'text-white/70' : 'text-textSub'}`}>
                                        {lastMsg}
                                    </p>
                                )}
                            </div>

                            {/* Time + unread badge */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                {lastTime && (
                                    <span className={`text-[10px] md:text-xs leading-none ${isSelected ? 'text-white/70' : 'text-textSub'}`}>
                                        {formatTime(lastTime)}
                                    </span>
                                )}
                                {unreadCount > 0 && !isSelected && (
                                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center leading-none">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* ── Footer — logout ── */}
            <div className="shrink-0 flex items-center justify-end px-3 md:px-4 py-2 md:py-3 border-t border-white/10">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="text-red-400 flex items-center gap-1.5 hover:text-red-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-md px-2 py-1 text-sm"
                    onClick={handleLogOut}
                >
                    <BiLogOutCircle className="w-5 h-5" />
                    <span>Logout</span>
                </motion.button>
            </div>
        </div>
    )
}

export default SideBar
