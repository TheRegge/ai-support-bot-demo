# TechStore Demo with AI Support Bot

> A production-ready e-commerce demo featuring an AI-powered customer support chatbot with enterprise-grade safety features, rate limiting, and bot protection.

<p align="center">
  <img src="app/(chat)/opengraph-image.png" alt="TechStore Demo with AI Chatbot" width="600">
</p>

<p align="center">
  <a href="#-key-features"><strong>Key Features</strong></a> •
  <a href="#-safety--security"><strong>Safety & Security</strong></a> •
  <a href="#-tech-stack"><strong>Tech Stack</strong></a> •
  <a href="#-live-demo"><strong>Live Demo</strong></a> •
  <a href="#-local-setup"><strong>Local Setup</strong></a>
</p>

## 🎯 Project Overview

This project transforms a standard chatbot template into a full-featured e-commerce platform with an intelligent customer support system. It demonstrates production-level thinking with comprehensive safety measures, cost controls, and user protection systems typically found in enterprise applications.

### What Makes This Special

Unlike typical portfolio chatbots, this implementation includes:
- **Real AI Integration**: Powered by Google's Gemini AI for natural conversations
- **Cost Protection**: Automatic API usage monitoring and circuit breakers
- **Bot Defense**: Multi-layered protection against spam and abuse
- **Production Architecture**: Scalable design with proper error handling and fallbacks

## 🚀 Key Features

### E-Commerce Platform
- **Product Catalog**: Clean, responsive product grid with shadcn/ui components
- **Store Information**: Policies for returns, shipping, and warranties
- **Modern UI**: Built with Next.js 14 App Router and Tailwind CSS

### AI Customer Support Bot
- **Natural Language Understanding**: Handles queries about products, orders, returns, and shipping
- **Context Awareness**: Maintains conversation history for coherent responses
- **Fallback Intelligence**: Smart responses even when AI limits are reached
- **24/7 Availability**: Always-on support with graceful degradation

### Advanced Safety System
- **Multi-Layer Rate Limiting**:
  - IP-based: 5 requests/minute per IP
  - User-based: 20 messages/day (guests), 50/day (registered)
- **Bot Protection**:
  - Rapid message detection (<2 seconds between messages)
  - Duplicate content filtering
  - Spam pattern recognition
- **Content Validation**:
  - Message length limits (500 chars)
  - Special character filtering
  - Basic profanity detection

### Cost Control & Monitoring
- **API Usage Tracking**: Real-time monitoring of Gemini API usage
- **Circuit Breakers**: Automatic cutoff at 90% of free tier limits
- **Usage Dashboard**: Visual monitoring for authenticated users
- **Graceful Degradation**: Fallback responses when limits approached

## 🛡️ Safety & Security

<details>
<summary><strong>View Complete Safety Architecture</strong></summary>

### Request Flow
```
User Request → CORS Check → Security Headers → IP Rate Limit 
→ User Rate Limit → Content Validation → Bot Detection 
→ API Limit Check → AI Processing → Response
```

### Protection Layers
1. **Network Level**: CORS, security headers, IP tracking
2. **Application Level**: Rate limiting, validation, bot detection
3. **API Level**: Usage monitoring, circuit breakers, fallbacks
4. **Data Level**: Input sanitization, output filtering

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy enforced

[Full documentation →](docs/safety-bot-protection.md)
</details>

## 💻 Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript throughout

### Backend
- **API Routes**: Next.js API routes with middleware
- **AI Integration**: Google Gemini 2.0 Flash
- **Authentication**: NextAuth.js with guest/user roles
- **Rate Limiting**: Custom in-memory store (Redis-ready)

### Infrastructure
- **Deployment**: Vercel (recommended)
- **Database**: PostgreSQL via Neon (optional)
- **File Storage**: Vercel Blob (optional)
- **Monitoring**: Built-in usage analytics

## 🌐 Live Demo

[View Live Demo](#) • [System Status](#)

**Demo Credentials** (optional):
- Guest access: Automatic
- Registered user: Sign up for higher limits

**Try These Queries**:
- "What products do you have?"
- "Tell me about your return policy"
- "How long does shipping take?"
- "What warranty comes with the smart watch?"

## 🛠️ Local Setup

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Google AI API key (free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-support-bot.git
   cd ai-support-bot
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Required variables:
   ```env
   # Authentication
   AUTH_SECRET=your-auth-secret-here
   
   # Google Gemini AI
   GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
   
   # Optional: Database
   DATABASE_URL=your-database-url
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

### Testing the Safety Features

```bash
# Test rate limiting (should block after 5 requests)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/store-chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"test"}]}'
done

# View usage statistics (authenticated users)
open http://localhost:3000/admin
```

## 📊 Performance & Scalability

- **Response Time**: <500ms average (with AI)
- **Fallback Response**: <50ms (when limits reached)
- **Memory Usage**: Minimal with automatic cleanup
- **Concurrent Users**: Handles high traffic with rate limiting
- **Horizontal Scaling**: Redis-ready for distributed systems

## 🎓 Learning Highlights

This project demonstrates:
- **Production Thinking**: Real-world considerations for cost, security, and scale
- **System Design**: Multi-layered architecture with proper separation of concerns
- **Error Handling**: Graceful degradation and user-friendly error messages
- **Monitoring**: Built-in analytics and usage tracking
- **Documentation**: Comprehensive technical documentation

## 📝 Documentation

- [Safety & Bot Protection System](docs/safety-bot-protection.md)
- [API Documentation](docs/api.md) *(coming soon)*
- [Deployment Guide](docs/deployment.md) *(coming soon)*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of [Vercel's AI SDK](https://sdk.vercel.ai/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Google's Gemini AI](https://ai.google.dev/)

---

<p align="center">
  Made with ❤️ as a portfolio demonstration of production-ready AI integration
</p>

<p align="center">
  <a href="#techstore-demo-with-ai-support-bot">↑ Back to top</a>
</p>