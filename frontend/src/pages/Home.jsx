import React from 'react'
import SideBar from '../components/SideBar'
import MessageArea from '../components/MessageArea'
import { useSelector } from 'react-redux'
import getMessage from '../customHooks/getMessages'


function Home() {
  let {selectedUser}=useSelector(state=>state.user)
 getMessage()
  return (
    <div className="w-screen h-screen flex overflow-hidden bg-bgMain text-textMain">
      <SideBar />
      <div className="flex-1 min-w-0 min-h-0 h-full flex flex-col bg-bgMain">
        <MessageArea />
      </div>
    </div>
  )
}

export default Home
