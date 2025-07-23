import { auth } from '@/app/(auth)/auth';
import { getEnhancedUsageStats, testGoogleCloudConnection } from '@/lib/api-usage-tracker';
import { getClientIP } from '@/lib/get-client-ip';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// Define strict rate limits for the usage endpoint
const USAGE_RATE_LIMIT = {
  maxRequests: 10, // Only 10 requests
  windowMs: 60 * 60 * 1000 // per hour
};

// Security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
};

// CORS configuration - only allow your own domain
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://localhost:3000',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.NEXT_PUBLIC_SITE_URL,
].filter(Boolean);

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = !origin || ALLOWED_ORIGINS.some(allowed => origin === allowed);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : 'null',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '3600', // 1 hour
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 200,
    headers: {
      ...getCorsHeaders(origin),
      ...SECURITY_HEADERS,
    }
  });
}

export async function GET(request: Request) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  try {
    // 1. Check authentication first
    const session = await auth();
    
    // Only allow authenticated users to view usage stats
    if (!session?.user) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required' 
      }), { 
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
          ...corsHeaders,
          ...corsHeaders,
        ...SECURITY_HEADERS
        }
      });
    }
    
    // 2. IP-based rate limiting
    const clientIP = getClientIP(request);
    const ipRateLimit = rateLimit(`usage:ip:${clientIP}`, USAGE_RATE_LIMIT);
    
    if (!ipRateLimit.success) {
      return new Response(JSON.stringify({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000)
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000).toString(),
          ...corsHeaders,
          ...corsHeaders,
        ...SECURITY_HEADERS
        }
      });
    }
    
    // 3. User-based rate limiting (even stricter)
    const userRateLimit = rateLimit(`usage:user:${session.user.id}`, {
      maxRequests: 20, // 20 requests per day per user
      windowMs: 24 * 60 * 60 * 1000
    });
    
    if (!userRateLimit.success) {
      return new Response(JSON.stringify({
        error: 'Daily limit reached for usage statistics.',
        retryAfter: Math.ceil((userRateLimit.resetTime - Date.now()) / 1000)
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((userRateLimit.resetTime - Date.now()) / 1000).toString(),
          ...corsHeaders,
          ...corsHeaders,
        ...SECURITY_HEADERS
        }
      });
    }
    
    // 4. Check for suspicious patterns
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    
    // Block common bot user agents
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i, 
      /wget/i, /curl/i, /python/i, /java/i
    ];
    
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
      // Log suspicious activity
      console.warn('Bot detected attempting to access usage stats:', {
        ip: clientIP,
        userAgent,
        referer,
        timestamp: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({ 
        error: 'Access denied' 
      }), { 
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
          ...SECURITY_HEADERS
        }
      });
    }
    
    // 5. Only proceed with the expensive operation after all checks
    const stats = await getEnhancedUsageStats();
    
    return new Response(JSON.stringify({
      usage: {
        requests: {
          current: stats.requestCount,
          limit: stats.limits.MAX_REQUESTS,
          percentage: stats.percentages.requests.toFixed(1)
        },
        tokens: {
          current: stats.tokenCount,
          limit: stats.limits.MAX_TOKENS,
          percentage: stats.percentages.tokens.toFixed(1)
        },
        lastReset: new Date(stats.lastReset).toISOString(),
        nextReset: new Date(stats.lastReset + stats.limits.RESET_HOUR).toISOString(),
        
        // Enhanced data from Google Cloud
        dataSource: stats.dataSource,
        lastGoogleCloudSync: stats.lastGoogleCloudSync ? new Date(stats.lastGoogleCloudSync).toISOString() : null,
        errorRate: stats.errorRate ? stats.errorRate.toFixed(2) : null,
        averageLatency: stats.averageLatency ? `${stats.averageLatency.toFixed(0)}ms` : null,
        
        // Real API data if available
        realApiData: stats.realApiData ? {
          totalRequests: stats.realApiData.requestCount,
          errorCount: stats.realApiData.errorCount,
          responseCodeStats: stats.realApiData.responseCodeStats,
          timeWindow: {
            start: stats.realApiData.timeWindow.start.toISOString(),
            end: stats.realApiData.timeWindow.end.toISOString()
          }
        } : null
      },
      timestamp: new Date().toISOString(),
      
      // Rate limit info for the client
      rateLimits: {
        ip: {
          remaining: ipRateLimit.remaining,
          limit: ipRateLimit.limit,
          resetTime: new Date(ipRateLimit.resetTime).toISOString()
        },
        user: {
          remaining: userRateLimit.remaining,
          limit: userRateLimit.limit,
          resetTime: new Date(userRateLimit.resetTime).toISOString()
        }
      }
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-RateLimit-Limit': ipRateLimit.limit.toString(),
        'X-RateLimit-Remaining': ipRateLimit.remaining.toString(),
        'X-RateLimit-Reset': ipRateLimit.resetTime.toString(),
        ...corsHeaders,
        ...SECURITY_HEADERS
      }
    });
    
  } catch (error) {
    console.error('Usage stats error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to retrieve usage statistics' 
    }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders,
        ...SECURITY_HEADERS
      }
    });
  }
}