import { auth } from '@/app/(auth)/auth';
import { testGoogleCloudConnection } from '@/lib/api-usage-tracker';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    // Only allow authenticated users to test connection
    if (!session?.user) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const connectionTest = await testGoogleCloudConnection();
    
    return new Response(JSON.stringify({
      ...connectionTest,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('Google Cloud connection test error:', error);
    return new Response(JSON.stringify({ 
      isConfigured: false,
      isConnected: false,
      error: 'Failed to test Google Cloud connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}