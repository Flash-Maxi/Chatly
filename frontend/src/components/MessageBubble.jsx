// filepath: src/components/MessageBubble.jsx
import React from 'react';
import { motion } from 'framer-motion';

function MessageBubble({ message, isSender, timestamp }) {
  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3`}>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.015 }}
        className={`max-w-[85%] sm:max-w-[70%] px-4 py-2 rounded-2xl shadow-lg backdrop-blur-sm border ${
          isSender
            ? 'bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-[#e2e8f0] rounded-br-sm border-white/10 shadow-blue-500/20'
            : 'bg-[#334155]/90 text-[#e2e8f0] rounded-bl-sm border-white/5 shadow-black/20'
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{message}</p>
        <span className={`text-[10px] block mt-1 text-right ${isSender ? 'text-blue-200' : 'text-slate-400'}`}>
          {timestamp}
        </span>
      </motion.div>
    </div>
  );
}

export default MessageBubble;