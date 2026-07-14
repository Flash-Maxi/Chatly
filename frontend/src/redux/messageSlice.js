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
         // Increment unread count for the sender
         const id = String(action.payload)
         state.unreadUsers[id] = (state.unreadUsers[id] || 0) + 1
      },

      clearUserUnread: (state, action) => {
         // Reset to 0 when user opens the conversation
         state.unreadUsers[String(action.payload)] = 0
      }
   }
});

export const { setMessages, addMessage, setMessageTranslation, markUserUnread, clearUserUnread } = messageSlice.actions;
export default messageSlice.reducer;
