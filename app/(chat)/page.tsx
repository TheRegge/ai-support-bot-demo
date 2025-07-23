import { ProductGrid } from '@/components/store/product-grid';
import { ChatWidget } from '@/components/store/chat-widget';
import { StoreLogo } from '@/components/store/store-logo';
import { CartButton } from '@/components/store/cart-button';
import { CartProvider } from '@/components/store/cart-context';
import { auth } from '../(auth)/auth';

export default async function Page() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <CartProvider>
      {/* Store Content */}
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-6xl mx-auto p-8">
            <div className="flex items-center justify-between">
              <StoreLogo className="h-20 w-auto" />
              
              <div className="flex items-center gap-4">
                {isAuthenticated && (
                  <a 
                    href="/admin" 
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    Dashboard
                  </a>
                )}
                <CartButton />
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="max-w-6xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-gray-800 mb-2">AI Customer Support Demo</h1>
            <p className="text-lg text-gray-600 mb-4">Experience our intelligent chatbot assistant! Add items to your cart and try asking:</p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <ul className="text-gray-700 space-y-1">
                <li>• "What's in my cart?" or "Show me my cart total"</li>
                <li>• "Do I qualify for free shipping?"</li>
                <li>• "Tell me about the MacBook Pro" or product questions</li>
                <li>• "What's your return policy?" or shipping info</li>
                <li>• "Can you recommend accessories for my items?"</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 mt-3">The AI assistant has real-time access to your cart and can provide personalized help!</p>
          </div>
          <ProductGrid />
          
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">🤖 Ready to test the AI assistant?</h3>
              <p className="text-blue-100 mb-4">
                Click the chat bubble in the bottom-right corner to start a conversation. 
                The AI knows about your cart, our products, and store policies!
              </p>
              {!isAuthenticated && (
                <p className="text-sm text-blue-200">
                  💡 Guest users have limited chat messages. Sign up for unlimited access!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </CartProvider>
  );
}
