import { createSlice } from "@reduxjs/toolkit";

const userSlice=createSlice({
   name:"user",
   initialState:{
   userData:null,
   otherUsers:[],
    selectedUser:null,
    // socket:null, // REMOVE socket from Redux state
    onlineUsers:null,
    searchData:null
   },  
   reducers:{
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
      state.otherUsers=action.payload
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

export const {setUserData, setOtherUsers,setSelectedUser,setSocket,setOnlineUsers,setSearchData}=userSlice.actions
export default userSlice.reducer