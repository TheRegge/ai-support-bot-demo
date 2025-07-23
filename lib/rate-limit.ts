interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (use Redis in production)
const store: RateLimitStore = {};

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

export function rateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  // Clean up expired entries
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
  
  if (!store[identifier]) {
    store[identifier] = {
      count: 0,
      resetTime: now + config.windowMs
    };
  }
  
  const entry = store[identifier];
  
  // Reset if window has passed
  if (entry.resetTime < now) {
    entry.count = 0;
    entry.resetTime = now + config.windowMs;
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }
  
  // Increment counter
  entry.count++;
  
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  STORE_CHAT_IP: {
    maxRequests: 5,
    windowMs: 60 * 1000 // 1 minute
  },
  STORE_CHAT_USER_GUEST: {
    maxRequests: 20,
    windowMs: 24 * 60 * 60 * 1000 // 24 hours
  },
  STORE_CHAT_USER_REGULAR: {
    maxRequests: 50,
    windowMs: 24 * 60 * 60 * 1000 // 24 hours
  }
} as const;