import { createSlice } from "@reduxjs/toolkit"

// ─── sortUsers ────────────────────────────────────────────────────────────────
// Classifies every user into one of three priority buckets and merges them.
//
// Priority 1 — Users with conversation history (lastMessageAt !== null)
//              Sorted by lastMessageAt descending (most recent first).
//              This preserves the existing behaviour exactly.
//
// Priority 2 — No conversation history + currently online
//              Appear immediately after all conversation users.
//
// Priority 3 — No conversation history + currently offline
//              Appear last.
//
// The online/offline split is intentionally applied ONLY to users without any
// conversation.  A user Alice who chatted with you yesterday will NEVER be
// pushed below an online-but-never-talked-to Bob.
//
// Duplicate prevention: each user appears in exactly one bucket because the
// partition condition is mutually exclusive:
//   hasConversation  → bucket A (regardless of online status)
//   !hasConversation && isOnline  → bucket B
//   !hasConversation && !isOnline → bucket C
//
// Time complexity: O(n log n) — one .filter() pass per bucket (O(n) each),
// one .sort() on bucket A (O(k log k) where k ≤ n), then Array.concat (O(n)).
// ─────────────────────────────────────────────────────────────────────────────
function sortUsers(users, onlineUsers) {
  if (!users) return []
  // Convert to a Set for O(1) membership checks
  const onlineSet = new Set(onlineUsers || [])

  // ── Bucket A: users with at least one message ──
  const withConversation = users
    .filter(u => u.lastMessageAt != null)
    .sort((a, b) => {
      // Most-recent conversation first
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    })

  // ── Bucket B: no conversation + online ──
  const noConvOnline = users.filter(
    u => u.lastMessageAt == null && onlineSet.has(String(u._id))
  )

  // ── Bucket C: no conversation + offline ──
  const noConvOffline = users.filter(
    u => u.lastMessageAt == null && !onlineSet.has(String(u._id))
  )

  // Merge in priority order — no user can appear in more than one bucket
  return [...withConversation, ...noConvOnline, ...noConvOffline]
}

const userSlice=createSlice({
   name:"user",
   initialState:{
   userData:null,
   otherUsers:[],
    selectedUser:null,
    onlineUsers:null,
      searchData:null,
      // unreadUsers: { [userId]: count } — number of unread messages per user
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
    setOtherUsers:(state, action) => {
      // Apply 3-tier sort immediately when the user list arrives from the server.
      // onlineUsers may already be populated (e.g. if socket connected first).
      state.otherUsers = sortUsers(action.payload, state.onlineUsers)
    },

       // updateUserLastMessage: called whenever a message is sent or received.
       // Updates the timestamp + preview text on the target user, then
       // re-applies the full 3-tier sort so the list stays consistent.
       updateUserLastMessage:(state, action) => {
         const { userId, lastMessageAt, lastMessageText } = action.payload
         const id = String(userId)

         const index = state.otherUsers.findIndex(
           user => String(user._id) === id
         )

         if (index === -1) return  // unknown user — nothing to do

         // Update the timestamp (and preview text when provided) in-place
         state.otherUsers[index] = {
           ...state.otherUsers[index],
           lastMessageAt,
           ...(lastMessageText !== undefined && { lastMessageText })
         }

         // Re-apply the full 3-tier sort so the newly-active conversation
         // rises to its correct position within bucket A.
         state.otherUsers = sortUsers(state.otherUsers, state.onlineUsers)
       },

       setSelectedUser:(state,action)=>{
         state.selectedUser=action.payload
       }
       ,
          setOnlineUsers:(state,action)=>{
           // Store the updated online list, then re-sort the user list so that
           // bucket B/C (no-conversation users) reorder instantly when someone
           // comes online or goes offline — without touching bucket A order.
           state.onlineUsers=action.payload
           if (state.otherUsers?.length) {
             state.otherUsers = sortUsers(state.otherUsers, state.onlineUsers)
           }
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