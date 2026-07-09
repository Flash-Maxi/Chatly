// filepath: src/components/ChatHeader.jsx
import React from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { BsThreeDotsVertical } from 'react-icons/bs';

function ChatHeader({ username = "Adi", avatar, isOnline = true, onBack }) {
  return (
    <div className="shrink-0 h-[75px] z-10 flex items-center justify-between px-4 bg-[#1e293b] border-b border-slate-700">
      <div className="flex items-center gap-3">
        {/* Back Button - always visible */}
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-700 rounded-full transition-colors"
        >
          <IoArrowBack className="w-5 h-5 text-slate-300" />
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-slate-600 overflow-hidden flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt={username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-300 font-medium">
              {username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="flex flex-col">
          <span className="text-[#e2e8f0] font-medium">{username}</span>
          <span className="text-xs text-green-400">{isOnline ? 'online' : 'offline'}</span>
        </div>
      </div>

      {/* Optional Menu Icon */}
      <button className="p-2 hover:bg-slate-700 rounded-full transition-colors">
        <BsThreeDotsVertical className="w-5 h-5 text-slate-400" />
      </button>
    </div>
  );
}

export default ChatHeader;