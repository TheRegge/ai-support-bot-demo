export interface ValidationResult {
  isValid: boolean;
  error?: string;
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
  if (messages.length < 3) {
    return { isValid: true };
  }
  
  const recentMessages = messages.slice(-3);
  const timeDiffs = [];
  
  for (let i = 1; i < recentMessages.length; i++) {
    timeDiffs.push(recentMessages[i].timestamp - recentMessages[i - 1].timestamp);
  }
  
  // Check for very rapid messages (under 2 seconds between messages)
  const rapidMessages = timeDiffs.filter(diff => diff < 2000).length;
  if (rapidMessages >= 2) {
    return { isValid: false, error: 'Messages sent too rapidly' };
  }
  
  // Check for identical messages
  const contents = recentMessages.map(m => m.content);
  const uniqueContents = new Set(contents);
  if (uniqueContents.size === 1 && contents.length >= 2) {
    return { isValid: false, error: 'Identical messages detected' };
  }
  
  return { isValid: true };
}