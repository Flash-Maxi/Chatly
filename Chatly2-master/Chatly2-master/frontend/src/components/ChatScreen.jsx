// filepath: src/components/ChatScreen.jsx
import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { motion } from 'framer-motion';

// Dummy message data
const dummyMessages = [
  { id: 1, text: "Hey! How are you?", sender: "receiver", timestamp: "10:30 AM" },
  { id: 2, text: "I'm good, just working on a project. You?", sender: "sender", timestamp: "10:31 AM" },
  { id: 3, text: "Same here. Btw, are we still meeting tomorrow?", sender: "receiver", timestamp: "10:32 AM" },
  { id: 4, text: "Yes! Let's meet at the library around 2pm", sender: "sender", timestamp: "10:33 AM" },
  { id: 5, text: "Perfect! See you then 👋", sender: "receiver", timestamp: "10:34 AM" },
  { id: 6, text: "Great! Talk to you later", sender: "sender", timestamp: "10:35 AM" },
];

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
};

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
    <div className="relative flex flex-col h-screen bg-[#0f172a] overflow-hidden">
      {/* Ambient gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -left-20 w-[320px] h-[320px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 -right-20 w-[300px] h-[300px] rounded-full bg-blue-400/10 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <ChatHeader
          username="Adi"
          isOnline={true}
          onBack={handleBack}
        />
      </div>

      {/* Message Area */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex-1 overflow-y-auto p-4 pb-20"
      >
        {messages.map((msg) => (
          <motion.div key={msg.id} variants={itemVariants}>
            <MessageBubble
              message={msg.text}
              isSender={msg.sender === "sender"}
              timestamp={msg.timestamp}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Input Bar */}
      <div className="relative z-10">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

export default ChatScreen;