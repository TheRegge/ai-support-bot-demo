import { STORE_INFO } from '@/lib/store/constants';
import type { ChatMessage } from '@/lib/store/types';
import { getClientIP } from '@/lib/get-client-ip';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { validateChatMessage, detectBotBehavior } from '@/lib/request-validation';
import { checkApiLimits, trackApiUsage } from '@/lib/api-usage-tracker';
import { auth } from '@/app/(auth)/auth';

const STORE_SYSTEM_PROMPT = `You are a helpful customer support assistant for TechStore Demo, an online electronics store.

Our Current Products:
${STORE_INFO.products.map(p => `- ${p.name}: ${p.price} (${p.stock} in stock) - ${p.description}`).join('\n')}

Store Policies:
- Return Policy: ${STORE_INFO.policies.return}
- Shipping: ${STORE_INFO.policies.shipping}  
- Warranty: ${STORE_INFO.policies.warranty}

Guidelines:
- Be friendly, helpful, and professional
- Focus on helping customers with product information, orders, returns, shipping, and warranties
- If asked about products not in our catalog, politely explain we don't carry them but suggest similar items we do have
- Keep responses concise and relevant to our store
- If you don't know something specific, offer to connect them with a human agent`;

// Fallback responses when AI is unavailable
const FALLBACK_RESPONSES = {
  products: `Here are our current products:\n${STORE_INFO.products.map(p => `• ${p.name} - ${p.price} (${p.stock} in stock)`).join('\n')}\n\nFor more details, please contact our support team.`,
  returns: `Our return policy: ${STORE_INFO.policies.return}. For specific return requests, please contact our support team.`,
  shipping: `${STORE_INFO.policies.shipping}. Standard delivery takes 3-5 business days. For order tracking, please contact support.`,
  warranty: `All products come with ${STORE_INFO.policies.warranty}. For warranty claims, please contact our support team.`,
  default: "Hello! I'm here to help with product information, orders, returns, and shipping. Due to high demand, I'm operating in simplified mode. Please contact our support team for detailed assistance."
};

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('product') || lowerMessage.includes('item')) {
    return FALLBACK_RESPONSES.products;
  }
  if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
    return FALLBACK_RESPONSES.returns;
  }
  if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
    return FALLBACK_RESPONSES.shipping;
  }
  if (lowerMessage.includes('warranty')) {
    return FALLBACK_RESPONSES.warranty;
  }
  return FALLBACK_RESPONSES.default;
}

// Security headers for all responses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
};

// CORS configuration
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://localhost:3000',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.NEXT_PUBLIC_SITE_URL,
].filter(Boolean);

function corsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = !origin || ALLOWED_ORIGINS.some(allowed => origin.includes(allowed || ''));
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 200,
    headers: {
      ...corsHeaders(origin),
      ...SECURITY_HEADERS,
    }
  });
}

export async function POST(request: Request) {
  const startTime = Date.now();
  const origin = request.headers.get('origin');
  
  try {
    const { messages }: { messages: ChatMessage[] } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid messages format' 
      }), { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
          ...SECURITY_HEADERS,
        }
      });
    }

    const clientIP = getClientIP(request);
    const session = await auth();
    const userType = session?.user?.type || 'guest';
    
    // 1. IP-based rate limiting
    const ipRateLimit = rateLimit(`ip:${clientIP}`, RATE_LIMITS.STORE_CHAT_IP);
    if (!ipRateLimit.success) {
      return new Response(JSON.stringify({
        error: 'Too many requests. Please wait a moment before trying again.',
        retryAfter: Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000)
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000).toString(),
          ...corsHeaders(origin),
          ...SECURITY_HEADERS,
        }
      });
    }

    // 2. User-based rate limiting
    const userRateLimitConfig = userType === 'guest' 
      ? RATE_LIMITS.STORE_CHAT_USER_GUEST 
      : RATE_LIMITS.STORE_CHAT_USER_REGULAR;
    
    const userIdentifier = session?.user?.id || `ip:${clientIP}`;
    const userRateLimit = rateLimit(`user:${userIdentifier}`, userRateLimitConfig);
    
    if (!userRateLimit.success) {
      return new Response(JSON.stringify({
        error: `Daily message limit reached (${userRateLimitConfig.maxRequests} messages per day). Please try again tomorrow.`,
        retryAfter: Math.ceil((userRateLimit.resetTime - Date.now()) / 1000)
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((userRateLimit.resetTime - Date.now()) / 1000).toString(),
          ...corsHeaders(origin),
          ...SECURITY_HEADERS,
        }
      });
    }

    // 3. Validate the latest message content
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== 'user') {
      return new Response(JSON.stringify({ 
        error: 'Invalid message format' 
      }), { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
          ...SECURITY_HEADERS,
        }
      });
    }

    const messageValidation = validateChatMessage(latestMessage.content);
    if (!messageValidation.isValid) {
      return new Response(JSON.stringify({
        error: messageValidation.error
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
          ...SECURITY_HEADERS,
        }
      });
    }

    // 4. Bot behavior detection
    const messagesWithTimestamp = messages.map((msg, index) => ({
      content: msg.content,
      timestamp: startTime - ((messages.length - index - 1) * 1000) // Approximate timestamps
    }));
    
    const botCheck = detectBotBehavior(messagesWithTimestamp);
    if (!botCheck.isValid) {
      return new Response(JSON.stringify({
        error: `${botCheck.error}. Please slow down and try again.`
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
          ...SECURITY_HEADERS,
        }
      });
    }

    // 5. Check API usage limits
    const apiLimitCheck = checkApiLimits();
    if (!apiLimitCheck.canProceed) {
      // Fallback to simple responses
      const fallbackResponse = getFallbackResponse(latestMessage.content);
      return new Response(JSON.stringify({
        content: fallbackResponse,
        fallback: true
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
          ...SECURITY_HEADERS,
        }
      });
    }

    // 6. Proceed with AI API call
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      const fallbackResponse = getFallbackResponse(latestMessage.content);
      return new Response(JSON.stringify({
        content: fallbackResponse,
        fallback: true
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
          ...SECURITY_HEADERS,
        }
      });
    }

    // Convert messages to Google Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const requestBody = {
      system_instruction: {
        parts: [{ text: STORE_SYSTEM_PROMPT }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300, // Reduced to save tokens
      }
    };

    console.log('Calling Google Gemini API...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API error:', response.status, errorText);
      
      // Fallback on API errors
      const fallbackResponse = getFallbackResponse(latestMessage.content);
      return new Response(JSON.stringify({
        content: fallbackResponse,
        fallback: true
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
          ...SECURITY_HEADERS,
        }
      });
    }

    const data = await response.json();
    
    // Track API usage
    const usageMetadata = data.usageMetadata;
    const tokenCount = usageMetadata ? 
      (usageMetadata.promptTokenCount || 0) + (usageMetadata.candidatesTokenCount || 0) : 0;
    
    trackApiUsage(tokenCount);

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      getFallbackResponse(latestMessage.content);

    return new Response(JSON.stringify({ 
      content: generatedText,
      usage: {
        tokensUsed: tokenCount,
        remaining: userRateLimit.remaining
      }
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': userRateLimitConfig.maxRequests.toString(),
        'X-RateLimit-Remaining': userRateLimit.remaining.toString(),
        'X-RateLimit-Reset': userRateLimit.resetTime.toString(),
        ...corsHeaders(origin),
        ...SECURITY_HEADERS,
      }
    });

  } catch (error) {
    console.error('Store chat error:', error);
    
    // Fallback response on any error
    const fallbackResponse = FALLBACK_RESPONSES.default;
    return new Response(JSON.stringify({ 
      content: fallbackResponse,
      fallback: true,
      error: 'Service temporarily unavailable'
    }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders(origin),
        ...SECURITY_HEADERS,
      }
    });
  }
}