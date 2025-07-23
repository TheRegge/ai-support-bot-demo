import type { ChatMessage, Cart } from './types';

export async function chatWithAI(messages: ChatMessage[], cart?: Cart): Promise<string> {
  try {
    const response = await fetch('/api/store-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, cart }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle rate limiting and other errors gracefully
      if (response.status === 429) {
        const retryAfter = data.retryAfter || 60;
        throw new Error(`${data.error} Please try again in ${retryAfter} seconds.`);
      }
      
      if (response.status === 400) {
        throw new Error(data.error || 'Invalid request');
      }
      
      throw new Error(data.error || 'Service temporarily unavailable');
    }

    if (data.fallback) {
      console.log('Using fallback response due to API limits or error');
    }

    return data.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Chat API error:', error);
    throw error; // Re-throw to preserve the specific error message
  }
}