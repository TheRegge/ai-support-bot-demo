import { googleCloudMonitoring, type GoogleApiUsageStats } from './google-cloud-monitoring';

interface UsageStats {
  requestCount: number;
  tokenCount: number;
  lastReset: number;
}

interface EnhancedUsageStats extends UsageStats {
  realApiData?: GoogleApiUsageStats;
  dataSource: 'local' | 'google-cloud' | 'hybrid';
  lastGoogleCloudSync?: number;
  errorRate?: number;
  averageLatency?: number;
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

/**
 * Get enhanced usage statistics combining local tracking with Google Cloud data
 */
export async function getEnhancedUsageStats(): Promise<EnhancedUsageStats & {
  limits: typeof DAILY_LIMITS;
  percentages: {
    requests: number;
    tokens: number;
  };
}> {
  let realApiData: GoogleApiUsageStats | undefined;
  let dataSource: 'local' | 'google-cloud' | 'hybrid' = 'local';
  let errorRate: number | undefined;
  let averageLatency: number | undefined;

  // Try to fetch real Google Cloud data
  if (googleCloudMonitoring.isConfigured()) {
    try {
      realApiData = await googleCloudMonitoring.getGeminiApiUsage(24);
      dataSource = 'google-cloud';
      
      // Calculate additional metrics from real data
      errorRate = realApiData.requestCount > 0 
        ? (realApiData.errorCount / realApiData.requestCount) * 100 
        : 0;
      averageLatency = realApiData.averageLatency;
      
      // Use real data for request count if available
      if (realApiData.requestCount > dailyUsage.requestCount) {
        dailyUsage.requestCount = realApiData.requestCount;
        dataSource = 'hybrid';
      }
    } catch (error) {
      console.warn('Failed to fetch Google Cloud monitoring data:', error);
      // Fall back to local data
    }
  }

  return {
    ...dailyUsage,
    realApiData,
    dataSource,
    lastGoogleCloudSync: realApiData ? Date.now() : undefined,
    errorRate,
    averageLatency,
    limits: DAILY_LIMITS,
    percentages: {
      requests: (dailyUsage.requestCount / DAILY_LIMITS.MAX_REQUESTS) * 100,
      tokens: (dailyUsage.tokenCount / DAILY_LIMITS.MAX_TOKENS) * 100
    }
  };
}

/**
 * Legacy function for backward compatibility
 */
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

/**
 * Test Google Cloud Monitoring connection
 */
export async function testGoogleCloudConnection(): Promise<{
  isConfigured: boolean;
  isConnected: boolean;
  error?: string;
}> {
  const isConfigured = googleCloudMonitoring.isConfigured();
  
  if (!isConfigured) {
    return {
      isConfigured: false,
      isConnected: false,
      error: 'Google Cloud Project ID not configured'
    };
  }

  try {
    const isConnected = await googleCloudMonitoring.testConnection();
    return {
      isConfigured: true,
      isConnected,
      error: isConnected ? undefined : 'Failed to connect to Google Cloud Monitoring'
    };
  } catch (error) {
    return {
      isConfigured: true,
      isConnected: false,
      error: error instanceof Error ? error.message : 'Unknown connection error'
    };
  }
}