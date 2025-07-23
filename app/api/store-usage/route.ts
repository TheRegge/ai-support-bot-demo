import { auth } from '@/app/(auth)/auth';
import { getUsageStats } from '@/lib/api-usage-tracker';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    // Only allow authenticated users to view usage stats
    if (!session?.user) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const stats = getUsageStats();
    
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
        nextReset: new Date(stats.lastReset + stats.limits.RESET_HOUR).toISOString()
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('Usage stats error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to retrieve usage statistics' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}