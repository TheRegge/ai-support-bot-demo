import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ChatInput({ input, setInput, onSubmit, isLoading }: ChatInputProps) {
  return (
    <div className="p-4 border-t">
      <div className="flex space-x-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
          placeholder="Type your message..."
          className="flex-1 text-sm bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
          disabled={isLoading}
        />
        <Button
          onClick={onSubmit}
          disabled={!input.trim() || isLoading}
          size="sm"
          aria-label="Send message"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}