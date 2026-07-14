import React from 'react'
import SideBar from '../components/SideBar'
import MessageArea from '../components/MessageArea'
import { useSelector } from 'react-redux'
import getMessage from '../customHooks/getMessages'

function Home() {
  const { selectedUser } = useSelector(state => state.user)
  getMessage()

  return (
    // Full-screen container. On mobile: one panel at a time. On md+: side-by-side.
    <div className="w-screen h-[100dvh] flex overflow-hidden bg-bgMain text-textMain">

      {/* Sidebar — full-width on mobile, fixed 350px on desktop.
          Hidden on mobile when a chat is open (selectedUser is set). */}
      <div className={`
        ${selectedUser ? 'hidden md:flex' : 'flex'}
        w-full md:w-[350px] md:shrink-0 h-full flex-col
      `}>
        <SideBar />
      </div>

      {/* Chat panel — full-width on mobile, flex-1 on desktop.
          Hidden on mobile when no chat is open. */}
      <div className={`
        ${selectedUser ? 'flex' : 'hidden md:flex'}
        flex-1 min-w-0 h-full flex-col
      `}>
        <MessageArea />
      </div>

    </div>
  )
}

export default Home
