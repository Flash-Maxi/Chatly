// filepath: src/components/ChatScreen.jsx
import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

// Dummy message data
const dummyMessages = [
  { id: 1, text: "Hey! How are you?", sender: "receiver", timestamp: "10:30 AM" },
  { id: 2, text: "I'm good, just working on a project. You?", sender: "sender", timestamp: "10:31 AM" },
  { id: 3, text: "Same here. Btw, are we still meeting tomorrow?", sender: "receiver", timestamp: "10:32 AM" },
  { id: 4, text: "Yes! Let's meet at the library around 2pm", sender: "sender", timestamp: "10:33 AM" },
  { id: 5, text: "Perfect! See you then 👋", sender: "receiver", timestamp: "10:34 AM" },
  { id: 6, text: "Great! Talk to you later", sender: "sender", timestamp: "10:35 AM" },
];

function ChatScreen() {
  const [messages, setMessages] = useState(dummyMessages);

  const handleSendMessage = (text) => {
    const newMessage = {
      id: messages.length + 1,
      text: text,
      sender: "sender",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
  };

  const handleBack = () => {
    console.log('Back button clicked');
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a]">
      {/* Header */}
      <ChatHeader 
        username="Adi" 
        isOnline={true} 
        onBack={handleBack}
      />

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg.text}
            isSender={msg.sender === "sender"}
            timestamp={msg.timestamp}
          />
        ))}
      </div>

      {/* Input Bar */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}

export default ChatScreen;