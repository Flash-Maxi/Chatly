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

      setMessageTranslation: (state, action) => {
         const { messageId, translatedText } = action.payload;
         const message = state.messages.find((item) => String(item._id) === String(messageId));
         if (message) {
            message.translatedText = translatedText;
            message.isTranslated = true;
         }
      },

      markUserUnread: (state, action) => {
         state.unreadUsers[String(action.payload)] = true;
      },

      clearUserUnread: (state, action) => {
         state.unreadUsers[String(action.payload)] = false;
      }
   }
});

export const { setMessages, addMessage, setMessageTranslation, markUserUnread, clearUserUnread } = messageSlice.actions;
export default messageSlice.reducer;
