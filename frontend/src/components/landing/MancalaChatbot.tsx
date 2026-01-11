/**
 * Mancala RAG Chatbot Component
 * 
 * A self-contained chatbot that appears only on the landing page.
 * Uses RAG (Retrieval-Augmented Generation) to answer questions from PDF documents.
 * 
 * Features:
 * - Floating chat button (bottom-right)
 * - Chat window with message history
 * - Vintage-themed UI matching the application
 * - Local state only (resets on unmount)
 * - Responsive design
 * - Queries backend RAG API for answers
 * 
 * To remove: Simply delete this component and its import from LandingPage.tsx
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '../../types/chatbot';
import { queryChatbot } from '../../services/ragApi';

export default function MancalaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm here to help you learn about Mancala. Ask me about the history, rules, or strategies!",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const question = inputValue.trim();
    setInputValue('');

    // Show loading message
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      text: 'Thinking...',
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Query the RAG API
      const answer = await queryChatbot(question);
      
      // Remove loading message and add response
      setMessages((prev) => {
        const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: answer,
          sender: 'bot',
          timestamp: new Date(),
        };
        return [...withoutLoading, botResponse];
      });
    } catch (error) {
      // Remove loading message and show error
      setMessages((prev) => {
        const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I encountered an error. Please try again or check if the backend server is running.",
          sender: 'bot',
          timestamp: new Date(),
        };
        return [...withoutLoading, errorMessage];
      });
      console.error('Error querying chatbot:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full p-4 shadow-2xl hover:from-blue-700 hover:to-blue-900 transition-all duration-200 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open Mancala chatbot"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-full md:max-w-md h-[calc(100vh-80px)] md:h-[500px] bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col border-2 border-amber-200 md:border-amber-300"
              style={{
                backgroundImage: `
                  linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(194, 65, 12, 0.1) 100%),
                  repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139, 69, 19, 0.03) 10px, rgba(139, 69, 19, 0.03) 20px)
                `,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b-2 border-amber-300 bg-gradient-to-r from-amber-600 to-orange-600 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <h3 className="text-white font-bold text-lg">Mancala Assistant</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-amber-200 text-2xl leading-none transition-colors"
                  aria-label="Close chat"
                >
                  ×
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
                          : 'bg-gradient-to-r from-amber-700 to-orange-700 text-white shadow-lg'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about Mancala..."
                    className="flex-1 px-4 py-2 rounded-xl border-2 border-amber-300 focus:border-blue-600 focus:outline-none bg-white text-gray-800 placeholder-gray-400"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl hover:from-blue-700 hover:to-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg"
                  >
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Ask about Mancala history, rules, or strategies
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
