import React, { useCallback, useEffect, useRef, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io"
import { IoSearch, IoClose } from "react-icons/io5"
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md"
import dp from "../assets/dp.webp"
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedUser, updateUserLastMessage } from '../redux/userSlice'
import { RiEmojiStickerLine } from "react-icons/ri"
import { FaImages, FaDownload } from "react-icons/fa6"
import { RiSendPlane2Fill } from "react-icons/ri"
import EmojiPicker from 'emoji-picker-react'
import SenderMessage from './SenderMessage'
import ReceiverMessage from './ReceiverMessage'
import axios from 'axios'
import { serverUrl } from '../main'
import getImageUrl from '../utils/getImageUrl'
import { setMessages, addMessage, markUserUnread } from '../redux/messageSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../context/ToastContext'
import { isRomanHindi } from '../utils/isRomanHindi'
import ConfirmModal from './ConfirmModal'
import useMessageSearch from '../customHooks/useMessageSearch'

// Global socket reference - will be set from App component
let globalSocket = null
export const setGlobalSocket = (socket) => {
  globalSocket = socket
}

function MessageArea() {
  const { selectedUser, userData, onlineUsers } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const [showPicker, setShowPicker] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [input, setInput] = useState("")
  const [frontendImage, setFrontendImage] = useState(null)
  const [backendImage, setBackendImage] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const imageRef = useRef()
  const menuRef = useRef()
  const messageInputRef = useRef()
  const emojiButtonRef = useRef()
  const emojiPickerRef = useRef()
  const messageListRef = useRef()
  const hinglishWarningConversations = useRef(new Set())
  const { messages } = useSelector(state => state.message)
  const { error: showError, warning: showWarning } = useToast()

  // ─── Search state ─────────────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMatchIdx, setActiveMatchIdx] = useState(0)
  const searchInputRef = useRef()
  const searchBarRef = useRef()

  // Compute all matches across all messages (memoized, O(N×L))
  const { matchesPerMessage, totalCount } = useMessageSearch(messages, searchQuery)

  // ─────────────────────────────────────────────────────────────────

  // ─── Send-lock: prevents duplicate sends on rapid Enter/click ───
  // useRef is the source of truth so the guard works synchronously
  // inside the async function (no stale-closure issues with useState).
  // isSending state is only used to re-render the disabled button UI.
  const isSendingRef = useRef(false)
  const [isSending, setIsSending] = useState(false)

  // ─── Clear-chat confirmation modal ───────────────────────────────
  // showConfirmClear  → controls modal visibility
  // isClearingChat    → true while the DELETE request is in-flight;
  //                     keeps the modal open and buttons disabled so the
  //                     user cannot close it or retry until the API responds.
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [isClearingChat,   setIsClearingChat]   = useState(false)

  const clearSelectedImage = () => {
    setFrontendImage(null)
    setBackendImage(null)
    if (imageRef.current) imageRef.current.value = ''
  }

  // ─── Search handlers ───────────────────────────────────────────────
  const handleSearchOpen = () => {
    setSearchOpen(true)
    setMenuOpen(false) // close the ⋮ menu if open
    // Focus is applied by the useEffect that watches searchOpen
  }

  const handleSearchClose = () => {
    setSearchOpen(false)
    setSearchQuery('')
    setActiveMatchIdx(0)
  }

  const handleNext = () => {
    if (totalCount === 0) return
    setActiveMatchIdx(prev => (prev + 1) % totalCount)
  }

  const handlePrev = () => {
    if (totalCount === 0) return
    setActiveMatchIdx(prev => (prev - 1 + totalCount) % totalCount)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleSearchClose()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) handlePrev()
      else handleNext()
    }
  }
  // ──────────────────────────────────────────────────────────────────

  // Auto-grow textarea
  const handleInputChange = (e) => {
    const el = e.target
    setInput(el.value)
    // Reset height then grow to scrollHeight, capped at 120px
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const handleClearChat = async () => {
    // Guard: don't allow a second call while the first is in-flight.
    if (isClearingChat) return
    setIsClearingChat(true)
    try {
      const res = await axios.delete(`${serverUrl}/api/message/clear/${selectedUser._id}`, { withCredentials: true })
      console.log('clear conversation response', res.data)
      dispatch(setMessages([]))
      // Success: close both the modal and the options menu.
      setShowConfirmClear(false)
      setMenuOpen(false)
    } catch (error) {
      console.log('clear conversation error', error?.response?.data || error)
      // Failure: show error toast but keep the modal open so the user can retry.
      const msg = error?.response?.data?.message || 'Failed to clear chat. Please try again.'
      showError(msg)
    } finally {
      setIsClearingChat(false)
    }
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showError('format not supported')
      e.target.value = ''
      return
    }
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault()

    // ── Lock guard ──────────────────────────────────────────────────
    // isSendingRef.current is the synchronous gate that stops a second
    // call from entering while the first await is still in-flight.
    // This covers both rapid Enter presses and rapid button clicks.
    if (isSendingRef.current) return
    if (input.length === 0 && backendImage === null) return

    // Acquire the lock immediately — before the first await — so no
    // concurrent call can slip through between ticks.
    isSendingRef.current = true
    setIsSending(true) // triggers re-render → button becomes disabled

    // Guarantee the lock is released after 1.5 s even if something
    // unexpected happens (e.g. network hangs without throwing).
    // The explicit unlock in the catch block fires sooner on errors.
    const cooldownTimer = setTimeout(() => {
      isSendingRef.current = false
      setIsSending(false)
    }, 1500)
    // ────────────────────────────────────────────────────────────────

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
      const formData = new FormData()
      formData.append("message", input)
      if (backendImage) {
        formData.append("image", backendImage)
      }
      const result = await axios.post(`${serverUrl}/api/message/send/${selectedUser._id}`, formData, { withCredentials: true })
      dispatch(addMessage(result.data))
      dispatch(updateUserLastMessage({
        userId: selectedUser._id,
        lastMessageAt: result.data.createdAt,
        lastMessageText: input || '📷 Photo'
      }))
      // ── Clear input only after a confirmed successful send ──
      setInput("")
      setFrontendImage(null)
      setBackendImage(null)
      // Reset textarea height
      if (messageInputRef.current) {
        messageInputRef.current.style.height = 'auto'
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to send message'
      showError(message)
      clearSelectedImage()
      // ── On failure: unlock immediately so the user can retry ──
      clearTimeout(cooldownTimer)
      isSendingRef.current = false
      setIsSending(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, backendImage, selectedUser, userData, dispatch, showError, showWarning])

  const onEmojiClick = (emojiData) => {
    setInput(prev => prev + emojiData.emoji)
    setShowPicker(false)
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto'
      messageInputRef.current.style.height = Math.min(messageInputRef.current.scrollHeight, 120) + 'px'
    }
  }

  const handleDownload = async () => {
    try {
      const res = await fetch(selectedImage)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = selectedImage.split("/").pop() || "chat-image.jpg"
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.log("Download error:", error)
    }
  }

  // Socket: handle incoming messages
  useEffect(() => {
    if (!globalSocket) return

    const handleNewMessage = (mess) => {
      const senderId = mess?.sender ? String(mess.sender) : null
      const selectedUserId = selectedUser?._id ? String(selectedUser._id) : null
      if (!senderId) return

      if (senderId === selectedUserId) {
        dispatch(addMessage(mess))
      } else {
        dispatch(markUserUnread(senderId))
      }
      dispatch(updateUserLastMessage({
        userId: senderId,
        lastMessageAt: mess.createdAt,
        lastMessageText: mess.message || '📷 Photo'
      }))
    }

    globalSocket.on('newMessage', handleNewMessage)
    return () => { globalSocket.off('newMessage', handleNewMessage) }
  }, [selectedUser?._id, dispatch])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  // Focus input when user is selected
  useEffect(() => {
    if (selectedUser && messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }, [selectedUser?._id])

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showPicker) return
    const handleClickOutside = (e) => {
      if (
        emojiButtonRef.current && !emojiButtonRef.current.contains(e.target) &&
        emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)
      ) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPicker])

  // Auto-scroll to bottom when messages change (but not when search is active — 
  // the search navigation controls scroll in that case)
  useEffect(() => {
    if (searchOpen) return  // let search nav handle scrolling when search is active
    const messageList = messageListRef.current
    if (!messageList) return
    messageList.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' })
  }, [messages.length, selectedUser?._id, searchOpen])

  // ─── Search: auto-focus input when search panel opens ────────────
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // ─── Search: reset active index when query or messages change ────
  useEffect(() => {
    setActiveMatchIdx(0)
  }, [searchQuery, selectedUser?._id])

  // ─── Search: scroll active match into view ────────────────────────
  useEffect(() => {
    if (!searchOpen || totalCount === 0) return
    // Small RAF delay ensures the DOM has re-rendered highlights before we scroll
    const id = requestAnimationFrame(() => {
      const el = document.querySelector('[data-match-id="active"]')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    return () => cancelAnimationFrame(id)
  }, [activeMatchIdx, totalCount, searchOpen])

  // ─── Search: close on ESC anywhere in the document ───────────────
  useEffect(() => {
    if (!searchOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleSearchClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen])

  return (
    <div className="flex-1 min-w-0 h-full relative flex flex-col bg-bgMain overflow-hidden">

      {/* ─── CHAT OPEN ─── */}
      {selectedUser && (
        <div className="w-full h-full min-h-0 flex flex-col overflow-hidden">

          {/* ── Sticky Chat Header ── */}
          <div className="shrink-0 h-14 md:h-[75px] flex items-center justify-between px-3 md:px-6 border-b border-white/10 bg-bgMain/90 backdrop-blur-xl z-20">
            {/* Left section */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {/* Back arrow */}
              <motion.button
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Back"
                className="text-textMain text-2xl md:text-3xl cursor-pointer hover:text-primary shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
                onClick={() => dispatch(setSelectedUser(null))}
              >
                <IoIosArrowRoundBack />
              </motion.button>

              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={getImageUrl(selectedUser?.image)}
                  alt=""
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-primary/30"
                  onError={(e) => { e.target.onerror = null; e.target.src = dp }}
                />
                {onlineUsers?.includes(selectedUser._id) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-[10px] md:h-[10px] rounded-full bg-green-500 ring-2 ring-bgMain" />
                )}
              </div>

              {/* Name + status */}
              <div className="min-w-0">
                <p className="font-semibold text-sm md:text-base text-textMain truncate leading-tight">
                  {selectedUser?.name || selectedUser?.userName || "user"}
                </p>
                {onlineUsers?.includes(selectedUser._id) && (
                  <p className="text-[11px] md:text-sm text-green-400 leading-none">online</p>
                )}
              </div>
            </div>

            {/* Right — search bar (when open) OR search icon + options menu */}
            <div className="flex items-center gap-1 shrink-0">

              {/* ── Animated Search Bar ── */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    ref={searchBarRef}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-1 md:gap-1.5 bg-bgSurface/80 border border-white/10 rounded-xl px-2 py-1 overflow-hidden"
                  >
                    {/* Search input */}
                    <input
                      id="chat-search-input"
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Search messages…"
                      aria-label="Search messages"
                      className="w-32 sm:w-44 md:w-52 bg-transparent text-textMain text-sm placeholder-textSub outline-none py-0.5"
                    />

                    {/* Match counter */}
                    <span
                      aria-live="polite"
                      className="text-xs font-medium shrink-0 tabular-nums min-w-[36px] text-center"
                      style={{ color: searchQuery.trim() && totalCount === 0 ? '#f87171' : '#6366f1' }}
                    >
                      {searchQuery.trim()
                        ? totalCount === 0
                          ? '0/0'
                          : `${activeMatchIdx + 1}/${totalCount}`
                        : ''}
                    </span>

                    {/* Prev button */}
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={handlePrev}
                      disabled={totalCount === 0}
                      aria-label="Previous match"
                      tabIndex={0}
                      className="p-0.5 rounded hover:bg-white/10 text-textSub hover:text-textMain disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      <MdKeyboardArrowUp className="w-4 h-4" />
                    </motion.button>

                    {/* Next button */}
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={handleNext}
                      disabled={totalCount === 0}
                      aria-label="Next match"
                      tabIndex={0}
                      className="p-0.5 rounded hover:bg-white/10 text-textSub hover:text-textMain disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      <MdKeyboardArrowDown className="w-4 h-4" />
                    </motion.button>

                    {/* Close button */}
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={handleSearchClose}
                      aria-label="Close search"
                      tabIndex={0}
                      className="p-0.5 rounded hover:bg-white/10 text-textSub hover:text-textMain transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      <IoClose className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Search icon (hidden when search bar is open) ── */}
              {!searchOpen && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Search messages"
                  onClick={handleSearchOpen}
                  className="text-textSub hover:text-textMain text-lg md:text-xl w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full hover:bg-bgSurface/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
                >
                  <IoSearch />
                </motion.button>
              )}

              {/* ── Options menu ── */}
              <div className="relative" ref={menuRef}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Chat options"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-textMain text-xl md:text-2xl w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full hover:bg-bgSurface/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                      className="absolute right-0 mt-2 w-36 bg-bgSurface/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          // Open the confirmation modal; do NOT call handleClearChat directly.
                          // The actual delete only happens when the user confirms inside the modal.
                          setMenuOpen(false)
                          setShowConfirmClear(true)
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-500/10 text-red-400 transition-colors"
                      >
                        Clear Chat
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Message List (independently scrollable) ── */}
          <div ref={messageListRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
            <div className="min-h-full px-3 py-3 md:p-6 flex flex-col gap-3 md:gap-4 justify-end">

              {/* ── "No messages found" banner (search active, zero results) ── */}
              {searchOpen && searchQuery.trim() && totalCount === 0 && (
                <div className="flex justify-center py-2">
                  <span className="text-xs text-textSub bg-bgSurface/60 border border-white/10 rounded-full px-3 py-1">
                    No messages found
                  </span>
                </div>
              )}

              {messages && messages.map((mess, msgIndex) => {
                // Per-message search data (empty when search is closed or no query)
                const msgMatchRanges = (searchOpen && searchQuery.trim())
                  ? (matchesPerMessage.get(msgIndex) ?? null)
                  : null

                return mess.sender === userData._id
                  ? (
                    <SenderMessage
                      key={mess._id}
                      image={mess.image}
                      message={mess.message}
                      onImageClick={(img) => setSelectedImage(img)}
                      searchQuery={searchOpen ? searchQuery : ''}
                      matchRanges={msgMatchRanges}
                      activeGlobalIndex={activeMatchIdx}
                    />
                  )
                  : (
                    <ReceiverMessage
                      key={mess._id}
                      messageId={mess._id}
                      image={mess.image}
                      message={mess.message}
                      senderLanguage={mess.senderLanguage}
                      translatedText={mess.translatedText}
                      isTranslated={mess.isTranslated}
                      onImageClick={(img) => setSelectedImage(img)}
                      searchQuery={searchOpen ? searchQuery : ''}
                      matchRanges={msgMatchRanges}
                      activeGlobalIndex={activeMatchIdx}
                    />
                  )
              })}
            </div>
          </div>

          {/* ── Sticky Chat Input ── */}
          <div className="shrink-0 w-full bg-bgSurface/80 backdrop-blur-xl px-2 md:px-5 py-2 md:py-4 border-t border-white/10 relative">
            {/* Emoji picker */}
            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full mb-2 left-2 z-50"
                  ref={emojiPickerRef}
                >
                  <EmojiPicker
                    width={Math.min(window.innerWidth - 16, 300)}
                    height={320}
                    className="shadow-2xl rounded-xl overflow-hidden"
                    onEmojiClick={onEmojiClick}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected image preview */}
            <AnimatePresence>
              {frontendImage && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full mb-2 right-3 md:right-6"
                >
                  <div className="relative">
                    <img src={frontendImage} alt="" className="w-16 md:w-[80px] rounded-lg shadow-xl ring-2 ring-primary/40" />
                    <button
                      onClick={clearSelectedImage}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-bgSurface border border-white/20 text-textSub hover:text-textMain flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input form */}
            <form
              className="w-full bg-bgChat/80 backdrop-blur-md flex items-end gap-2 px-3 py-2 rounded-2xl border border-white/10 shadow-sm focus-within:border-primary/60 transition-colors"
              onSubmit={handleSendMessage}
            >
              {/* Emoji button */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPicker(prev => !prev)}
                className="cursor-pointer shrink-0 pb-0.5"
                role="button"
                aria-label="Toggle emoji picker"
                tabIndex={0}
                ref={emojiButtonRef}
              >
                <RiEmojiStickerLine className="w-5 h-5 md:w-[22px] md:h-[22px] text-textSub hover:text-textMain transition-colors" />
              </motion.div>

              {/* Hidden file inputs */}
              <input type="file" accept="image/*" ref={imageRef} hidden onChange={handleImage} />

              {/* Auto-grow textarea */}
              <textarea
                ref={messageInputRef}
                rows={1}
                aria-label="Message"
                className="flex-1 outline-none border-0 text-sm md:text-base text-textMain bg-transparent placeholder-textSub resize-none overflow-hidden leading-5 py-1 max-h-[120px]"
                placeholder="Message"
                onChange={handleInputChange}
                value={input}
                onKeyDown={(e) => {
                  // Shift+Enter → insert newline (default textarea behaviour)
                  if (e.key === 'Enter' && e.shiftKey) return
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    // isSendingRef.current is checked synchronously here
                    // *and* again inside handleSendMessage for safety.
                    if (!isSendingRef.current) {
                      handleSendMessage(e)
                    }
                  }
                }}
                style={{ height: 'auto' }}
              />

              {/* Image attach button */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => imageRef.current.click()}
                className="cursor-pointer shrink-0 pb-0.5"
                role="button"
                aria-label="Attach image"
                tabIndex={0}
              >
                <FaImages className="w-5 h-5 md:w-[22px] md:h-[22px] text-textSub hover:text-textMain transition-colors" />
              </motion.div>

              {/* Send button */}
              <AnimatePresence>
                {(input.length > 0 || backendImage !== null) && (
                  <motion.button
                    type="submit"
                    aria-label="Send message"
                    // disabled prop prevents the form's onSubmit from firing
                    // via button click while the lock is active, and lets
                    // the browser/assistive tech know it is not interactive.
                    disabled={isSending}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    // Suppress hover/tap animations while disabled
                    whileHover={isSending ? {} : { scale: 1.12 }}
                    whileTap={isSending ? {} : { scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className={
                      `focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full shrink-0 pb-0.5 transition-opacity ${
                        isSending
                          ? 'opacity-40 cursor-not-allowed'
                          : 'cursor-pointer opacity-100'
                      }`
                    }
                  >
                    <RiSendPlane2Fill className="w-5 h-5 md:w-[22px] md:h-[22px] text-primary" />
                  </motion.button>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      )}

      {/* ─── NO USER SELECTED (desktop placeholder) ─── */}
      {!selectedUser && (
        <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-1/4 -left-20 w-[300px] h-[300px] rounded-full bg-primary/20 blur-[110px]" />
            <div className="absolute bottom-1/4 -right-20 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[110px]" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 bg-gradient-to-r from-textMain to-textMain/60 bg-clip-text text-transparent font-bold text-3xl sm:text-4xl text-center px-4"
          >
            Welcome to Chatly
          </motion.h1>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-10 text-textSub font-semibold text-xl mt-2"
          >
            Chat Friendly !
          </motion.span>
        </div>
      )}

      {/* ─── Full-screen image viewer ─── */}
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
                onClick={(e) => { e.stopPropagation(); handleDownload() }}
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

      {/* ─── Clear Chat confirmation modal ─── */}
      {/* Rendered at root level so it sits above all other content.
          onConfirm calls the existing handleClearChat — no business logic changed.
          onCancel simply hides the modal; nothing is deleted. */}
      <ConfirmModal
        isOpen={showConfirmClear}
        onConfirm={handleClearChat}
        onCancel={() => { if (!isClearingChat) setShowConfirmClear(false) }}
        title="Clear Chat"
        message="Are you sure you want to clear this chat? This action cannot be undone."
        confirmLabel="Yes, Clear"
        cancelLabel="No"
        isLoading={isClearingChat}
      />
    </div>
  )
}

export default MessageArea
