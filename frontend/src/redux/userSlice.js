import { createSlice } from "@reduxjs/toolkit"

const userSlice=createSlice({
   name:"user",
   initialState:{
   userData:null,
   otherUsers:[],
    selectedUser:null,
    onlineUsers:null,
      searchData:null,
      unreadUsers: {}
   },  
   reducers:{
         setUnreadUsers:(state,action)=>{
            state.unreadUsers = action.payload
         },
         markUnreadUser:(state,action)=>{
                  if(!state.unreadUsers) state.unreadUsers = {}
                  const id = String(action.payload)
                  state.unreadUsers = { ...state.unreadUsers, [id]: true }
         },
         clearUnreadUser:(state,action)=>{
               if(!state.unreadUsers) return
                  const id = String(action.payload)
                  state.unreadUsers = { ...state.unreadUsers, [id]: false }
         },
      setUserData:(state,action)=>{
         state.userData=action.payload;
         if (!action.payload) {
            state.otherUsers = [];
            state.selectedUser = null;
            state.onlineUsers = null;
            state.searchData = null;
         }
      },
    setOtherUsers:(state,action)=>{
      // Server already returns users sorted by lastMessageAt descending.
      // Store directly — no localStorage reordering needed.
      state.otherUsers = action.payload || []
       },

       // updateUserLastMessage: called whenever a message is sent or received.
       // Sets lastMessageAt on the user object and re-sorts the list by
       // lastMessageAt descending so the sidebar always reflects recency.
       updateUserLastMessage:(state,action)=>{
         const { userId, lastMessageAt } = action.payload
         const id = String(userId)

         const index = state.otherUsers.findIndex(
           user => String(user._id) === id
         )

         if (index === -1) return  // unknown user — nothing to do

         // Update the timestamp on the user object in-place
         state.otherUsers[index] = {
           ...state.otherUsers[index],
           lastMessageAt
         }

         // Re-sort by lastMessageAt descending
         state.otherUsers.sort((a, b) => {
           const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
           const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
           return bTime - aTime
         })
       },

       setSelectedUser:(state,action)=>{
         state.selectedUser=action.payload
          }
          ,
             setOnlineUsers:(state,action)=>{
              state.onlineUsers=action.payload
               },
               setSearchData:(state,action)=>{
                state.searchData=action.payload
                 }
   }
})

export const {
  setUserData,
  setOtherUsers,
  setSelectedUser,
  setOnlineUsers,
  setSearchData,
  setUnreadUsers,
  markUnreadUser,
  clearUnreadUser,
  updateUserLastMessage
} = userSlice.actions

export default userSlice.reducer