'use client';

import { useState } from 'react';
import { MessageCircle, X, Minimize2, Bot } from 'lucide-react';
import { useStoreChat } from '@/hooks/use-store-chat';
import { ChatMessageComponent } from './chat-message';
import { ChatInput } from './chat-input';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { messages, input, setInput, isLoading, messagesEndRef, handleSubmit } = useStoreChat();

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Open customer support chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-white rounded-lg shadow-xl transition-all duration-200 ${
          isMinimized ? 'h-14' : 'h-96 w-80'
        }`}>
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot size={20} />
              <span className="font-medium">Customer Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={minimizeChat}
                className="hover:bg-blue-700 p-1 rounded"
                aria-label="Minimize chat"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={toggleChat}
                className="hover:bg-blue-700 p-1 rounded"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-64 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <ChatMessageComponent key={index} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-start space-x-2">
                    <div className="p-2 rounded-full bg-gray-100 text-gray-600">
                      <Bot size={16} />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Section */}
              <ChatInput 
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}