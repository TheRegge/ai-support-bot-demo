import { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '@/lib/store/chat-service';
import type { ChatMessage, Cart } from '@/lib/store/types';

export function useStoreChat(cart?: Cart) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your customer support assistant. How can I help you today?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(updatedMessages, cart);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or contact support directly.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSubmit
  };
}