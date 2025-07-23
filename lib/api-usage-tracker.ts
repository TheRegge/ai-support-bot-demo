interface UsageStats {
  requestCount: number;
  tokenCount: number;
  lastReset: number;
}

// In-memory usage tracking (use database in production)
let dailyUsage: UsageStats = {
  requestCount: 0,
  tokenCount: 0,
  lastReset: Date.now()
};

// Gemini API Free Tier Limits
const DAILY_LIMITS = {
  MAX_REQUESTS: 1500,
  MAX_TOKENS: 1000000,
  RESET_HOUR: 24 * 60 * 60 * 1000 // 24 hours
};

export function checkApiLimits(): { canProceed: boolean; reason?: string } {
  const now = Date.now();
  
  // Reset daily counters if 24 hours have passed
  if (now - dailyUsage.lastReset > DAILY_LIMITS.RESET_HOUR) {
    dailyUsage = {
      requestCount: 0,
      tokenCount: 0,
      lastReset: now
    };
  }
  
  // Check request limit (leave 10% buffer)
  if (dailyUsage.requestCount >= DAILY_LIMITS.MAX_REQUESTS * 0.9) {
    return { 
      canProceed: false, 
      reason: 'Daily request limit approaching. Try again tomorrow.' 
    };
  }
  
  // Check token limit (leave 10% buffer)
  if (dailyUsage.tokenCount >= DAILY_LIMITS.MAX_TOKENS * 0.9) {
    return { 
      canProceed: false, 
      reason: 'Daily token limit approaching. Try again tomorrow.' 
    };
  }
  
  return { canProceed: true };
}

export function trackApiUsage(tokenCount = 0) {
  dailyUsage.requestCount++;
  dailyUsage.tokenCount += tokenCount;
  
  console.log(`API Usage - Requests: ${dailyUsage.requestCount}/${DAILY_LIMITS.MAX_REQUESTS}, Tokens: ${dailyUsage.tokenCount}/${DAILY_LIMITS.MAX_TOKENS}`);
}

export function getUsageStats() {
  return {
    ...dailyUsage,
    limits: DAILY_LIMITS,
    percentages: {
      requests: (dailyUsage.requestCount / DAILY_LIMITS.MAX_REQUESTS) * 100,
      tokens: (dailyUsage.tokenCount / DAILY_LIMITS.MAX_TOKENS) * 100
    }
  };
}