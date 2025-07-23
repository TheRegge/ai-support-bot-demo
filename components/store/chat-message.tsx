import { User, Bot } from 'lucide-react';
import type { ChatMessage } from '@/lib/store/types';

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  return (
    <div
      className={`flex items-start space-x-2 ${
        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
      }`}
    >
      <div className={`p-2 rounded-full ${
        message.role === 'user' 
          ? 'bg-blue-100 text-blue-600' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div
        className={`max-w-xs p-3 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-600 text-white ml-auto'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        <p className="text-sm whitespace-pre-line">{message.content}</p>
      </div>
    </div>
  );
}