import { ProductGrid } from '@/components/store/product-grid';
import { ChatWidget } from '@/components/store/chat-widget';
import { auth } from '../(auth)/auth';

export default async function Page() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <>
      {/* Store Content */}
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">TechStore Demo</h1>
          <ProductGrid />
          
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Try the customer support chatbot in the bottom-right corner! 
              Ask about products, returns, shipping, or warranties.
            </p>
            {!isAuthenticated && (
              <p className="text-sm text-gray-500 mt-2">
                Guest users have limited chat messages. Sign up for more!
              </p>
            )}
            {isAuthenticated && (
              <p className="text-sm text-gray-500 mt-2">
                <a href="/admin" className="text-blue-600 hover:text-blue-800">
                  Admin Dashboard
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </>
  );
}
