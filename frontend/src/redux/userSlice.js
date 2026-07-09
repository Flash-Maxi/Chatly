import { createSlice } from "@reduxjs/toolkit"

const getStorageKey=(userId)=>`chatily_chat_order_${userId}`

const saveOrder=(userId, users)=>{
   if (!userId || !users) return
   try {
      const key = getStorageKey(userId)
      const order = users.map((user)=>String(user?._id)).filter(Boolean)
      localStorage.setItem(key, JSON.stringify(order))
   } catch (error) {
      console.log(error)
   }
}

const loadOrder=(userId)=>{
   if (!userId) return null
   try {
      const key = getStorageKey(userId)
      const stored = localStorage.getItem(key)
      if (!stored) return null
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : null
   } catch (error) {
      return null
   }
}

const applyStoredOrder=(users, storedOrder)=>{
   if (!storedOrder || storedOrder.length === 0) return users

   const orderedUsers = []
   const remainingUsers = []
   const storedSet = new Set(storedOrder)
   const userMap = new Map()

   users.forEach((user) => {
      const userId = String(user?._id)
      userMap.set(userId, user)
   })

   storedOrder.forEach((userId) => {
      const user = userMap.get(String(userId))
      if (user) orderedUsers.push(user)
   })

   users.forEach((user) => {
      const userId = String(user?._id)
      if (!storedSet.has(userId)) remainingUsers.push(user)
   })

   return [...orderedUsers, ...remainingUsers]
}

const userSlice=createSlice({
   name:"user",
   initialState:{
   userData:null,
   otherUsers:[],
    selectedUser:null,
    // socket:null, // REMOVE socket from Redux state
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
      const storedOrder = loadOrder(state.userData?._id)
      const orderedUsers = applyStoredOrder(action.payload, storedOrder)
      state.otherUsers = orderedUsers
      saveOrder(state.userData?._id, orderedUsers)
       },
       moveUserToTop:(state,action)=>{
         const userId = String(action.payload);

         const index = state.otherUsers.findIndex(
           user => String(user._id) === userId
         );

         if (index <= 0) return;

         const [user] = state.otherUsers.splice(index, 1);
         state.otherUsers.unshift(user);
         saveOrder(state.userData?._id, state.otherUsers)
       },
       setSelectedUser:(state,action)=>{
         state.selectedUser=action.payload
          }
          ,
          // setSocket removed
             setOnlineUsers:(state,action)=>{
              state.onlineUsers=action.payload
               },
               setSearchData:(state,action)=>{
                state.searchData=action.payload
                 }
   }
})

export const {setUserData, setOtherUsers,setSelectedUser,setOnlineUsers,setSearchData,setUnreadUsers,markUnreadUser,clearUnreadUser,moveUserToTop}=userSlice.actions
export default userSlice.reducer