import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import VerifyOtp from './pages/VerifyOtp'
import getCurrentUser from './customHooks/getCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import Profile from './pages/Profile'
import getOtherUsers from './customHooks/getOtherUsers'
import { io } from "socket.io-client"
import { serverUrl } from './main'
import { setOnlineUsers, markUnreadUser } from './redux/userSlice'
import { store } from './redux/store'
import { setGlobalSocket } from './components/MessageArea'

// Singleton socket instance
let socketio = null;

function App() {
  getCurrentUser()
  getOtherUsers()
  let {userData,onlineUsers,selectedUser}=useSelector(state=>state.user)
  let dispatch=useDispatch()

  useEffect(() => {
    if (userData && !socketio) {
      socketio = io(`${serverUrl}`, {
        query: {
          userId: userData?._id
        },
        withCredentials: true
      });
      // Make socket available to MessageArea component
      setGlobalSocket(socketio);
      socketio.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      // Mark unread users when new messages arrive and recipient is not currently selected
      socketio.on("newMessage", (newMessage) => {
        try {
          console.debug('socket newMessage', newMessage);
          const senderId = newMessage?.sender || newMessage?.senderId;
          const currentSelected = store.getState().user.selectedUser;
          console.debug('senderId', senderId, 'currentSelected', currentSelected?._id);
          if (senderId && currentSelected?._id !== senderId) {
            dispatch(markUnreadUser(senderId));
          }
        } catch (err) {
          console.error('Error handling newMessage socket event', err);
        }
      });
    }
    return () => {
      if (socketio) {
        socketio.close();
        socketio = null;
      }
    };
  }, [userData]);

  return (
    <Routes>
      <Route path='/login' element={!userData?<Login/>:<Navigate to="/"/>}/>
      <Route path='/signup' element={!userData?<SignUp/>:<Navigate to="/profile"/>}/>
      <Route path='/verify-otp' element={<VerifyOtp/>} />
      <Route path='/' element={userData?<Home/>:<Navigate to="/login"/>}/>
      <Route path='/profile' element={userData?<Profile/>:<Navigate to="/signup"/>}/>
    </Routes>
  )
}

export default App
