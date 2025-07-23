import { ProductGrid } from '@/components/store/product-grid';
import { ChatWidget } from '@/components/store/chat-widget';
import { StoreLogo } from '@/components/store/store-logo';
import { CartButton } from '@/components/store/cart-button';
import { CartProvider } from '@/components/store/cart-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { MenuIcon } from '@/components/icons';
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
          <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between min-h-[44px] w-full">
              {/* Logo */}
              <div className="flex-shrink-0">
                <StoreLogo className="h-10 sm:h-12 lg:h-16 w-auto" />
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
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

              {/* Mobile Navigation */}
              <div className="md:hidden flex items-center gap-1 flex-shrink-0">
                <CartButton />
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-600 h-10 w-10">
                      <MenuIcon size={18} />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[min(320px,calc(100vw-2rem))] sm:w-96 bg-white text-gray-900 border-gray-200">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="flex flex-col space-y-4 mt-8">
                      <div className="px-4">
                        <StoreLogo className="h-16 w-auto mb-6" />
                      </div>
                      
                      <nav className="flex flex-col space-y-2 px-4">
                        {isAuthenticated && (
                          <a 
                            href="/admin" 
                            className="flex items-center py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium bg-white"
                          >
                            Dashboard
                          </a>
                        )}
                        
                        <div className="border-t border-gray-200 pt-4 mt-4 bg-white">
                          <div className="text-sm text-gray-500 px-4 mb-2 bg-white">Quick Actions</div>
                          <a 
                            href="#products" 
                            className="flex items-center py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors bg-white"
                          >
                            Browse Products
                          </a>
                          <a 
                            href="#support" 
                            className="flex items-center py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors bg-white"
                          >
                            Customer Support
                          </a>
                        </div>
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:p-8 py-4 sm:py-6 min-w-0">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800 mb-3 leading-tight">AI Customer Support Demo</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 leading-relaxed">Experience our intelligent chatbot assistant! Add items to your cart and try asking:</p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 sm:p-4 rounded-r-lg">
              <ul className="text-gray-700 space-y-1 text-sm sm:text-base">
                <li className="break-words-safe">• &ldquo;What&apos;s in my cart?&rdquo; or &ldquo;Show me my cart total&rdquo;</li>
                <li className="break-words-safe">• &ldquo;Do I qualify for free shipping?&rdquo;</li>
                <li className="break-words-safe">• &ldquo;What are your store policies?&rdquo;</li>
                <li className="break-words-safe">• &ldquo;Can you help me find a product?&rdquo;</li>
              </ul>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-3">The AI assistant has real-time access to your cart and can provide personalized help!</p>
          </div>
          <ProductGrid />
          
          <div className="mt-8 sm:mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 rounded-lg shadow-lg">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Ready to test the AI assistant?</h3>
              <p className="text-blue-100 mb-4 text-sm sm:text-base leading-relaxed">
                Click the chat bubble in the bottom-right corner to start a conversation. 
                The AI knows about your cart, our products, and store policies!
              </p>
              {!isAuthenticated && (
                <p className="text-xs sm:text-sm text-blue-200">
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
