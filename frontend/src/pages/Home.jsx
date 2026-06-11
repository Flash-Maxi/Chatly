import React from 'react'
import SideBar from '../components/SideBar'
import MessageArea from '../components/MessageArea'
import { useSelector } from 'react-redux'
import getMessage from '../customHooks/getMessages'


function Home() {
  let {selectedUser}=useSelector(state=>state.user)
 getMessage()
  return (
    <div className="flex h-screen bg-bgMain text-textMain">
      <SideBar />
      <div className="flex-1 flex flex-col bg-bgChat">
        <MessageArea />
      </div>
    </div>
  )
}

export default Home
