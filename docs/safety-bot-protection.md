# Safety & Bot Protection System

## Overview

This document describes the comprehensive safety and bot protection system implemented for the TechStore chatbot. The system protects against API abuse, prevents bot attacks, ensures cost control, and maintains service availability while providing an excellent user experience.

## Architecture

The protection system is implemented as a multi-layered defense strategy with the following components:

```
User Request
     ↓
[CORS & Security Headers]
     ↓
[IP-based Rate Limiting]
     ↓
[User-based Rate Limiting] 
     ↓
[Input Validation & Content Filtering]
     ↓
[Bot Behavior Detection]
     ↓
[API Usage Circuit Breaker]
     ↓
[Gemini AI API] ← → [Fallback Responses]
     ↓
[Usage Tracking & Monitoring]
```

## Components

### 1. Rate Limiting (`/lib/rate-limit.ts`)

**Purpose**: Prevent API abuse and ensure fair usage across all users.

**Implementation**:
- **IP-based Rate Limiting**: 5 requests per minute per IP address
- **User-based Rate Limiting**: 
  - Guests: 20 messages per day
  - Registered users: 50 messages per day
- In-memory storage (easily replaceable with Redis for production)
- Automatic cleanup of expired entries

**Configuration**:
```typescript
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
}
```

### 2. Request Validation (`/lib/request-validation.ts`)

**Purpose**: Filter malicious or spam content before processing.

**Features**:
- **Message Length Validation**: Maximum 500 characters
- **Spam Detection**: Detects repeated character patterns (e.g., "aaaaaaaaaa")
- **Special Character Filtering**: Blocks messages with >50% special characters
- **Basic Profanity Filter**: Extensible word-based filtering
- **Empty Message Prevention**: Ensures non-empty content

**Bot Behavior Detection**:
- **Rapid Message Detection**: Flags users sending messages <2 seconds apart
- **Duplicate Message Detection**: Identifies repeated identical messages
- **Pattern Analysis**: Analyzes message timing and content patterns

### 3. API Usage Tracking (`/lib/api-usage-tracker.ts`)

**Purpose**: Monitor and control Gemini API usage to stay within free tier limits.

**Gemini Free Tier Limits**:
- 1,500 requests per day
- 1,000,000 tokens per day
- 15 requests per minute (handled by Gemini directly)

**Protection Strategy**:
- Tracks both request count and token usage
- Stops API calls at 90% of daily limits (10% safety buffer)
- Automatic daily reset counter
- Switches to fallback responses when limits approached

**Circuit Breaker Logic**:
```typescript
if (dailyUsage.requestCount >= DAILY_LIMITS.MAX_REQUESTS * 0.9) {
  return { canProceed: false, reason: 'Daily request limit approaching' };
}
```

### 4. Security Headers & CORS

**Security Headers Applied**:
```typescript
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY', 
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'"
}
```

**CORS Configuration**:
- Whitelist of allowed origins (localhost, Vercel domains)
- Proper preflight handling
- Secure cross-origin request management

### 5. Fallback Response System

**Purpose**: Maintain functionality when AI API is unavailable or limits exceeded.

**Fallback Categories**:
- **Products**: Lists available products with prices and stock
- **Returns**: Return policy information
- **Shipping**: Shipping policy and timeframes  
- **Warranty**: Warranty information
- **Default**: General help message

**Smart Pattern Matching**:
```typescript
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('product')) return FALLBACK_RESPONSES.products;
  if (lowerMessage.includes('return')) return FALLBACK_RESPONSES.returns;
  // ... etc
}
```

### 6. Usage Monitoring Dashboard

**Features**:
- Real-time API usage statistics
- Visual progress bars for requests and tokens
- Percentage utilization displays
- Next reset time information
- Auto-refresh every 30 seconds

**Access Control**: Only available to authenticated users

**Endpoint**: `GET /api/store-usage`

## Error Handling & User Experience

### HTTP Status Codes

| Code | Scenario | User Message |
|------|----------|--------------|
| 400 | Invalid input | Specific validation error |
| 429 | Rate limited | "Too many requests. Please wait X seconds." |
| 500 | System error | Fallback response with helpful information |

### Graceful Degradation

1. **API Limits Reached**: Switches to pattern-based fallback responses
2. **API Errors**: Returns relevant store information instead of generic errors
3. **Rate Limiting**: Clear messaging with retry timeframes
4. **Validation Failures**: Specific, actionable error messages

## Performance Considerations

### Memory Usage
- In-memory rate limiting stores are cleaned up automatically
- Expired entries removed on each request
- Minimal memory footprint

### Response Times
- Validation occurs before API calls (fast rejection of invalid requests)
- Circuit breaker prevents unnecessary API calls
- Fallback responses are instant

### Scalability
- Rate limiting can be moved to Redis for horizontal scaling
- Stateless design allows multiple server instances
- Database integration ready for persistent usage tracking

## Configuration

### Environment Variables
```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
VERCEL_URL=your_domain.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Rate Limit Customization
Edit `RATE_LIMITS` in `/lib/rate-limit.ts`:
```typescript
STORE_CHAT_IP: {
  maxRequests: 10, // Increase for higher traffic
  windowMs: 60 * 1000 // Adjust time window
}
```

### API Limits Adjustment
Modify safety buffer in `/lib/api-usage-tracker.ts`:
```typescript
// Change 0.9 to adjust safety buffer (0.8 = 80% limit)
if (dailyUsage.requestCount >= DAILY_LIMITS.MAX_REQUESTS * 0.9) {
```

## Monitoring & Alerts

### Built-in Monitoring
- Usage statistics endpoint: `/api/store-usage`
- Console logging of all API calls and usage
- Rate limit headers in responses
- Request/token counting

### Recommended External Monitoring
- Set up alerts at 75% and 90% API usage
- Monitor 429 response rates
- Track fallback response usage
- Monitor average response times

### Log Analysis
Key metrics to track:
```typescript
// API Usage
API Usage - Requests: ${current}/${limit}, Tokens: ${used}/${limit}

// Rate Limiting
IP rate limit exceeded: ${ip}
User rate limit exceeded: ${userType} ${userId}

// Bot Detection  
Bot behavior detected: ${reason}
```

## Security Best Practices

### Input Validation
- ✅ Maximum message length enforcement
- ✅ Content pattern validation  
- ✅ Special character filtering
- ✅ Empty/null message prevention

### Authentication & Authorization
- ✅ Rate limits tied to user authentication
- ✅ Higher limits for registered users
- ✅ Usage monitoring restricted to authenticated users

### API Security
- ✅ API key stored in environment variables
- ✅ Request signing/validation ready
- ✅ CORS protection enabled
- ✅ Security headers applied

### Error Handling
- ✅ No sensitive information in error responses
- ✅ Fallback responses maintain functionality
- ✅ Proper HTTP status codes
- ✅ User-friendly error messages

## Testing

### Rate Limiting Tests
```bash
# Test IP rate limiting (should get 429 after 5 requests)
for i in {1..10}; do curl -X POST http://localhost:3000/api/store-chat; done

# Test user rate limiting (create multiple messages in a day)
```

### Bot Detection Tests  
```bash
# Send rapid messages (should trigger bot detection)
curl -X POST http://localhost:3000/api/store-chat -d '{"messages":[...]}'
sleep 1
curl -X POST http://localhost:3000/api/store-chat -d '{"messages":[...]}'
```

### Validation Tests
```bash
# Test long message (>500 chars)
curl -X POST http://localhost:3000/api/store-chat -d '{"messages":[{"role":"user","content":"'$(python -c "print('a'*501)")'")}]}'

# Test spam pattern
curl -X POST http://localhost:3000/api/store-chat -d '{"messages":[{"role":"user","content":"aaaaaaaaaaaaaaaaaaaaaa"}]}'
```

## Troubleshooting

### Common Issues

**Rate Limits Too Restrictive**
- Adjust `RATE_LIMITS` configuration
- Consider user feedback on limits
- Monitor 429 response rates

**API Limits Reached Too Quickly**  
- Check for bot activity
- Review token usage per request
- Consider reducing `maxOutputTokens` in AI requests

**Fallback Responses Too Frequent**
- Increase API usage buffer (from 90% to 95%)
- Optimize token usage
- Review request patterns

**False Positive Bot Detection**
- Adjust timing thresholds in `detectBotBehavior`
- Review message pattern detection
- Consider user feedback

### Debug Information
Enable detailed logging by setting environment variable:
```bash
DEBUG_STORE_CHAT=true
```

This will log:
- All rate limiting decisions
- Bot detection analysis  
- API usage calculations
- Fallback response triggers

## Future Enhancements

### Planned Improvements
- [ ] Redis integration for distributed rate limiting
- [ ] Machine learning-based bot detection
- [ ] Dynamic rate limit adjustment based on usage patterns
- [ ] Advanced analytics dashboard
- [ ] Webhook notifications for limit approaching
- [ ] A/B testing for fallback response effectiveness

### Scalability Roadmap
1. **Phase 1**: Redis backend for rate limiting
2. **Phase 2**: Database integration for persistent usage tracking  
3. **Phase 3**: Advanced bot detection with ML
4. **Phase 4**: Horizontal scaling with load balancer support

---

*This documentation is maintained alongside the codebase. Last updated: January 2025*