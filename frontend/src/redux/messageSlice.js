import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
   name: "message",
   initialState: {
      messages: [],
      unreadUsers: {}
   },
   reducers: {
      setMessages: (state, action) => {
         state.messages = action.payload || [];
      },

      addMessage: (state, action) => {
         state.messages.push(action.payload);
      },

      markUserUnread: (state, action) => {
         state.unreadUsers[String(action.payload)] = true;
      },

      clearUserUnread: (state, action) => {
         state.unreadUsers[String(action.payload)] = false;
      }
   }
});

export const { setMessages, addMessage, markUserUnread, clearUserUnread } = messageSlice.actions;
export default messageSlice.reducer;