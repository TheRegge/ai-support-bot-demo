# TechStore Demo with AI Support Bot

> A production-ready e-commerce demo featuring an AI-powered customer support chatbot with enterprise-grade safety features, rate limiting, and bot protection.

```
  ___  _____   _____ _   _____________ ___________ _____  ______  _____ _____
 / _ \|_   _| /  ___| | | | ___ \ ___ \  _  | ___ \_   _| | ___ \|  _  |_   _|
/ /_\ \ | |   \ `--.| | | | |_/ / |_/ / | | | |_/ / | |   | |_/ /| | | | | |
|  _  | | |    `--. \ | | |  __/|  __/| | | |    /  | |   | ___ \| | | | | |
| | | |_| |_  /\__/ / |_| | |   | |   \ \_/ / |\ \  | |   | |_/ /\ \_/ / | |
\_| |_/\___/  \____/ \___/\_|   \_|    \___/\_| \_| \_/   \____/  \___/  \_/
```

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
- **Production Monitoring**: Real-time usage dashboard with Google Cloud integration
- **Smart Rate Limiting**: Progressive warnings and intelligent abuse protection
- **Enterprise Security**: Multi-layered defense with comprehensive bot detection
- **Cost Protection**: Automatic API usage monitoring and circuit breakers
- **Production Architecture**: Scalable design with proper error handling and fallbacks

## 🚀 Key Features

### E-Commerce Platform

> **Note**: This is a demo e-commerce store created as a showcase for the AI support bot capabilities. No real products are sold.

- **Product Catalog**: Clean, responsive product grid with shadcn/ui components
- **Store Information**: Policies for returns, shipping, and warranties
- **Modern UI**: Built with Next.js 14 App Router and Tailwind CSS
- **Onboarding Tour**: Interactive tutorial highlighting key features for new users

### AI Customer Support Bot

- **Natural Language Understanding**: Handles queries about products, orders, returns, and shipping
- **Context Awareness**: Maintains conversation history for coherent responses
- **Fallback Intelligence**: Smart responses even when AI limits are reached
- **24/7 Availability**: Always-on support with graceful degradation

### 📊 Real-Time Monitoring Dashboard

- **Google Cloud Integration**: Live API metrics from Google Cloud Monitoring
- **Interactive Usage Visualization**: Progress bars, percentages, and trend data
- **Data Source Transparency**: Clear indicators showing local vs. cloud data
- **Smart Fallbacks**: Hybrid tracking when cloud monitoring unavailable
- **Cost Tracking**: Real-time token and request usage monitoring
- **Response Analytics**: Error rates, latency metrics, and response code statistics

### 🛡️ Advanced Security & Rate Limiting

- **Smart Rate Limiting**:
  - IP-based: 10 requests/hour per IP (enhanced from 5/minute)
  - User-based: 30 messages/day (guests), 100/day (registered users)
  - Progressive warnings before blocking
- **Intelligent Bot Protection**:
  - Sophisticated pattern detection beyond simple timing
  - Multi-message behavior analysis
  - Automatic suspicious activity logging
  - Graceful degradation with user feedback
- **Enterprise Security Headers**:
  - CORS protection with domain whitelisting
  - Comprehensive security headers (CSP, XSS, etc.)
  - Authentication-required monitoring endpoints
- **Content Validation**:
  - Message length limits (500 chars)
  - Special character filtering
  - Enhanced spam and bot detection

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

- **API Routes**: Next.js API routes with comprehensive middleware
- **AI Integration**: Google Gemini 2.0 Flash with intelligent fallbacks
- **Authentication**: NextAuth.js with guest/user roles
- **Rate Limiting**: Advanced in-memory store with Redis compatibility
- **Monitoring Integration**: Google Cloud Monitoring API

### Infrastructure

- **Deployment**: Vercel with environment-specific credentials
- **Database**: PostgreSQL via Neon (optional)
- **File Storage**: Vercel Blob (optional)
- **Real-Time Monitoring**: Google Cloud Monitoring integration
- **Security**: Multi-layered protection with enterprise-grade headers

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

**Explore the Monitoring Dashboard**:

- Navigate to `/admin` (requires authentication)
- View real-time API usage statistics
- Monitor Google Cloud integration status
- See progressive rate limiting in action

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

   # Optional: Google Cloud Monitoring (for production dashboard)
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=./secrets/google-service-account.json
   # OR for Vercel deployment:
   # GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}

   # Optional: Database
   DATABASE_URL=your-database-url
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

### Testing the Features

```bash
# Test enhanced rate limiting (progressive warnings)
for i in {1..15}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/store-chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"test message"}]}'
  echo "\n---"
done

# View real-time monitoring dashboard (requires authentication)
open http://localhost:3000/admin

# Test monitoring endpoint security
curl -X GET http://localhost:3000/api/store-usage
# Should return 401 without authentication

# Setup Google Cloud monitoring (optional)
# See GOOGLE_CLOUD_SETUP.md for detailed instructions
```

## 📊 Performance & Scalability

- **Response Time**: <500ms average (with AI)
- **Fallback Response**: <50ms (when limits reached)
- **Memory Usage**: Minimal with automatic cleanup
- **Concurrent Users**: Handles high traffic with rate limiting
- **Horizontal Scaling**: Redis-ready for distributed systems

## 🎓 Learning Highlights

This project demonstrates:

- **Production Monitoring**: Real-time dashboard with Google Cloud integration
- **Enterprise Security**: Multi-layered protection with intelligent rate limiting
- **System Design**: Scalable architecture with proper monitoring and observability
- **Error Handling**: Graceful degradation with user-friendly progressive warnings
- **Cloud Integration**: Seamless local development to production deployment
- **Documentation**: Comprehensive technical documentation with setup guides

## 📝 Documentation

- [Google Cloud Monitoring Setup](GOOGLE_CLOUD_SETUP.md) - Complete setup guide for local and production
- [Safety & Bot Protection System](docs/safety-bot-protection.md)
- [API Documentation](docs/api.md) _(coming soon)_
- [Deployment Guide](docs/deployment.md) _(coming soon)_

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
