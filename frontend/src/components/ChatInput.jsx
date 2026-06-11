// filepath: src/components/ChatInput.jsx
import React, { useState } from 'react';
import { RiEmojiStickerLine } from 'react-icons/ri';
import { FaPaperclip } from 'react-icons/fa6';
import { RiSendPlane2Fill } from 'react-icons/ri';
import { FaMicrophone } from 'react-icons/fa';

function ChatInput({ onSendMessage }) {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputText.trim()) {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-[#1e293b] border-t border-slate-700">
      <div className="max-w-4xl mx-auto flex items-center gap-2 bg-[#0f172a] rounded-full px-4 py-2">
        {/* Emoji Button */}
        <button className="p-2 hover:bg-slate-700 rounded-full transition-colors">
          <RiEmojiStickerLine className="w-5 h-5 text-slate-400" />
        </button>

        {/* Attach Button */}
        <button className="p-2 hover:bg-slate-700 rounded-full transition-colors">
          <FaPaperclip className="w-4 h-4 text-slate-400" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-[#e2e8f0] placeholder-slate-500 outline-none text-sm"
        />

        {/* Send or Mic Button */}
        {inputText.trim() ? (
          <button 
            onClick={handleSend}
            className="p-2 bg-[#3b82f6] hover:bg-blue-600 rounded-full transition-colors"
          >
            <RiSendPlane2Fill className="w-5 h-5 text-white" />
          </button>
        ) : (
          <button className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <FaMicrophone className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatInput;