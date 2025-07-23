export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  severity?: 'low' | 'medium' | 'high';
}

export function validateChatMessage(content: string): ValidationResult {
  // Check message length
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (content.length > 500) {
    return { isValid: false, error: 'Message too long (max 500 characters)' };
  }
  
  // Basic spam detection - repeated characters
  const repeatedPattern = /(.)\1{10,}/;
  if (repeatedPattern.test(content)) {
    return { isValid: false, error: 'Message appears to be spam' };
  }
  
  // Check for excessive special characters
  const specialCharRatio = (content.match(/[^a-zA-Z0-9\s]/g) || []).length / content.length;
  if (specialCharRatio > 0.5) {
    return { isValid: false, error: 'Message contains too many special characters' };
  }
  
  // Basic profanity filter (can be extended)
  const profanityWords = ['spam', 'test'.repeat(10)]; // Add more as needed
  const lowerContent = content.toLowerCase();
  for (const word of profanityWords) {
    if (lowerContent.includes(word.toLowerCase())) {
      return { isValid: false, error: 'Message contains inappropriate content' };
    }
  }
  
  return { isValid: true };
}

export function detectBotBehavior(
  messages: Array<{ timestamp: number; content: string }>
): ValidationResult {
  if (messages.length < 2) {
    return { isValid: true };
  }
  
  const recentMessages = messages.slice(-5); // Look at more messages for better pattern detection
  const timeDiffs = [];
  
  for (let i = 1; i < recentMessages.length; i++) {
    timeDiffs.push(recentMessages[i].timestamp - recentMessages[i - 1].timestamp);
  }
  
  // 1. Check for extremely rapid messages (under 500ms - clearly automated)
  const extremelyRapidMessages = timeDiffs.filter(diff => diff < 500).length;
  if (extremelyRapidMessages >= 2) {
    return { isValid: false, error: 'Messages sent too rapidly' };
  }
  
  // 2. Check for suspicious pattern: many messages under 1 second
  const veryRapidMessages = timeDiffs.filter(diff => diff < 1000).length;
  if (veryRapidMessages >= 3 && recentMessages.length >= 4) {
    return { isValid: false, error: 'Suspicious messaging pattern detected' };
  }
  
  // 3. Check for identical consecutive messages
  const contents = recentMessages.map(m => m.content.trim().toLowerCase());
  for (let i = 1; i < contents.length; i++) {
    if (contents[i] === contents[i - 1] && contents[i].length > 5) {
      return { isValid: false, error: 'Identical messages detected' };
    }
  }
  
  // 4. Check for repeated similar short messages
  if (recentMessages.length >= 3) {
    const shortMessages = contents.filter(content => content.length < 20);
    const uniqueShortMessages = new Set(shortMessages);
    if (shortMessages.length >= 3 && uniqueShortMessages.size <= 2) {
      return { isValid: false, error: 'Repetitive short messages detected' };
    }
  }
  
  // 5. Progressive warnings for moderately fast messages
  const moderatelyRapidMessages = timeDiffs.filter(diff => diff >= 500 && diff < 2000).length;
  const fastMessages = timeDiffs.filter(diff => diff >= 1000 && diff < 3000).length;
  
  // High severity warning - close to being blocked
  if (moderatelyRapidMessages >= 3 && recentMessages.length >= 4) {
    return { 
      isValid: true, 
      warning: 'You\'re sending messages quite quickly. Please slow down to avoid being temporarily blocked.',
      severity: 'high'
    };
  }
  
  // Medium severity warning - getting fast
  if (moderatelyRapidMessages >= 2 || fastMessages >= 4) {
    return { 
      isValid: true, 
      warning: 'Please slow down a bit between messages.',
      severity: 'medium'
    };
  }
  
  // Low severity warning - just a heads up
  if (fastMessages >= 3) {
    return { 
      isValid: true, 
      warning: 'You\'re chatting quickly! Take your time.',
      severity: 'low'
    };
  }
  
  return { isValid: true };
}