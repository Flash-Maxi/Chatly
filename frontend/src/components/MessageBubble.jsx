// filepath: src/components/MessageBubble.jsx
import React from 'react';

function MessageBubble({ message, isSender, timestamp }) {
  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3`}>
      <div 
        className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md ${
          isSender 
            ? 'bg-[#3b82f6] text-[#e2e8f0] rounded-br-sm' 
            : 'bg-[#334155] text-[#e2e8f0] rounded-bl-sm'
        }`}
      >
        <p className="text-sm">{message}</p>
        <span className={`text-[10px] block mt-1 ${isSender ? 'text-blue-200' : 'text-slate-400'}`}>
          {timestamp}
        </span>
      </div>
    </div>
  );
}

export default MessageBubble;