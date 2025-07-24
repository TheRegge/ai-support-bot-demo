export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  severity?: 'low' | 'medium' | 'high';
  sanitizedContent?: string;
}

export interface ValidationContext {
  clientIP: string;
  userAgent?: string;
  userId?: string;
}

// Prompt injection patterns to detect and block
const PROMPT_INJECTION_PATTERNS = [
  // Direct instruction overrides
  /ignore\s+(all\s+)?(previous\s+|prior\s+|above\s+)?(instructions?|prompts?|rules?|context)/i,
  /forget\s+(everything|all|previous|instructions?|context)/i,
  /disregard\s+(previous\s+|all\s+)?(instructions?|prompts?|rules?)/i,
  
  // Role manipulation attempts
  /you\s+are\s+(now\s+)?(a\s+|an\s+)?(?!customer|support|assistant|helpful)(.*?)(assistant|bot|ai|system|admin|developer)/i,
  /act\s+as\s+(a\s+|an\s+)?(?!customer|support)(.*?)(admin|developer|system|root)/i,
  /pretend\s+(to\s+be\s+|you\s+are\s+)(a\s+|an\s+)?(?!customer)(admin|developer|system|ai)/i,
  
  // System prompt extraction attempts
  /what\s+(is\s+|are\s+)?(your\s+)?(system\s+)?(prompt|instructions?|rules)/i,
  /show\s+me\s+(your\s+)?(system\s+)?(prompt|instructions?|configuration)/i,
  /tell\s+me\s+(your\s+)?(system\s+)?(prompt|instructions?|rules)/i,
  /repeat\s+(your\s+)?(system\s+)?(prompt|instructions?|rules)/i,
  
  // Common jailbreaking phrases
  /hypothetically/i,
  /imagine\s+you\s+are/i,
  /in\s+a\s+fictional\s+scenario/i,
  /roleplay\s+as/i,
  
  // Code injection attempts
  /<script[\s\S]*?<\/script>/i,
  /javascript:/i,
  /eval\s*\(/i,
  /function\s*\(/i,
  
  // Administrative command attempts
  /\/admin/i,
  /\/system/i,
  /sudo\s+/i,
  /rm\s+-rf/i,
  
  // Token/data extraction attempts
  /api[\s_-]*key/i,
  /secret[\s_-]*key/i,
  /password/i,
  /token/i,
];

// Enhanced content filtering patterns
const MALICIOUS_PATTERNS = [
  // HTML/Script injection
  /<[^>]*>/g,
  /on\w+\s*=/i,
  /javascript:/i,
  
  // SQL injection attempts
  /union\s+select/i,
  /drop\s+table/i,
  /delete\s+from/i,
  
  // XSS attempts
  /alert\s*\(/i,
  /document\.cookie/i,
  /window\.location/i,
];

function sanitizeInput(content: string): string {
  let sanitized = content;
  
  // Remove HTML tags and scripts
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove potential script injections
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Remove excessive whitespace and normalize
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

function detectPromptInjection(content: string): { detected: boolean; pattern?: string } {
  const lowerContent = content.toLowerCase();
  
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(content) || pattern.test(lowerContent)) {
      return { detected: true, pattern: pattern.toString() };
    }
  }
  
  return { detected: false };
}

function detectMaliciousContent(content: string): { detected: boolean; pattern?: string } {
  for (const pattern of MALICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      return { detected: true, pattern: pattern.toString() };
    }
  }
  
  return { detected: false };
}

export function validateChatMessage(content: string, context?: ValidationContext): ValidationResult {
  // Check message length
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (content.length > 500) {
    return { isValid: false, error: 'Message too long (max 500 characters)' };
  }
  
  // Prompt injection detection
  const injectionCheck = detectPromptInjection(content);
  if (injectionCheck.detected) {
    // Log security event if context provided
    if (context) {
      const { logPromptInjection } = require('./security-logger');
      logPromptInjection(
        context.clientIP,
        content,
        injectionCheck.pattern || 'unknown',
        context.userAgent,
        context.userId
      );
    }
    return { 
      isValid: false, 
      error: 'Message contains inappropriate content that cannot be processed' 
    };
  }
  
  // Malicious content detection
  const maliciousCheck = detectMaliciousContent(content);
  if (maliciousCheck.detected) {
    // Log security event if context provided
    if (context) {
      const { logMaliciousContent } = require('./security-logger');
      logMaliciousContent(
        context.clientIP,
        content,
        maliciousCheck.pattern || 'unknown',
        context.userAgent,
        context.userId
      );
    }
    return { 
      isValid: false, 
      error: 'Message contains potentially harmful content' 
    };
  }
  
  // Sanitize the input
  const sanitizedContent = sanitizeInput(content);
  
  // Check if sanitization removed too much content
  if (sanitizedContent.length < content.length * 0.5 && content.length > 20) {
    return { 
      isValid: false, 
      error: 'Message contains too much invalid content' 
    };
  }
  
  // Basic spam detection - repeated characters
  const repeatedPattern = /(.)\1{10,}/;
  if (repeatedPattern.test(sanitizedContent)) {
    return { isValid: false, error: 'Message appears to be spam' };
  }
  
  // Check for excessive special characters in sanitized content
  const specialCharRatio = (sanitizedContent.match(/[^a-zA-Z0-9\s]/g) || []).length / sanitizedContent.length;
  if (specialCharRatio > 0.5) {
    return { isValid: false, error: 'Message contains too many special characters' };
  }
  
  // Enhanced profanity/inappropriate content filter
  const inappropriatePatterns = [
    'spam', 
    'test'.repeat(10),
    // Add more patterns as needed
  ];
  
  const lowerContent = sanitizedContent.toLowerCase();
  for (const pattern of inappropriatePatterns) {
    if (lowerContent.includes(pattern.toLowerCase())) {
      return { isValid: false, error: 'Message contains inappropriate content' };
    }
  }
  
  return { 
    isValid: true,
    sanitizedContent: sanitizedContent
  };
}

export function detectBotBehavior(
  messages: Array<{ timestamp: number; content: string }>,
  context?: ValidationContext
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
    // Log bot behavior if context provided
    if (context) {
      const { logBotBehavior } = require('./security-logger');
      logBotBehavior(
        context.clientIP,
        'Messages sent too rapidly',
        messages.length,
        context.userAgent,
        context.userId
      );
    }
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