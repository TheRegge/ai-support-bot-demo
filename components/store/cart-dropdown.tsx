'use client';

import { useState } from 'react';
import { Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from './cart-context';
import { CheckoutModal } from './checkout-modal';
import type { CartItem } from '@/lib/store/types';

interface CartItemRowProps {
  item: CartItem;
  onRemove: (productId: string) => void;
}

function CartItemRow({ item, onRemove }: CartItemRowProps) {
  const price = Number.parseFloat(item.product.price.replace('$', ''));
  const itemTotal = price * item.quantity;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-900 truncate">
          {item.product.name}
        </h4>
        <p className="text-sm text-gray-500">{item.product.price} each</p>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">
          Qty: {item.quantity}
        </span>
        
        <span className="text-sm font-medium text-gray-900 w-16 text-right">
          ${itemTotal.toFixed(2)}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          className="size-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onRemove(item.product.id)}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}

export function CartDropdown() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  return (
    <>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          className="relative group hover:border-blue-500 transition-all duration-200 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <ShoppingCart className="size-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          <span className="ml-2 font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
            Cart
          </span>
          {cart.itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full size-6 flex items-center justify-center animate-pulse">
              {cart.itemCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-80 sm:w-96 max-w-[calc(100vw-2rem)] p-0 bg-white border-gray-200" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <Card className="border-0 shadow-lg bg-white">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900">Shopping Cart</h3>
              {cart.items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-gray-500 hover:text-red-600"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {cart.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="size-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add some items to get started</p>
              </div>
            ) : (
              <>
                <div className="max-h-80 overflow-y-auto">
                  {cart.items.map((item, index) => (
                    <div key={item.id}>
                      <CartItemRow
                        item={item}
                        onRemove={removeFromCart}
                      />
                      {index < cart.items.length - 1 && (
                        <Separator className="my-2 bg-gray-200" />
                      )}
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4 bg-gray-200" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">${cart.total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium text-gray-900">
                      {cart.shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${cart.shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  {cart.total < 50 && cart.shippingCost > 0 && (
                    <p className="text-xs text-gray-500">
                      Add ${(50 - cart.total).toFixed(2)} more for free shipping
                    </p>
                  )}
                  
                  <Separator className="my-2 bg-gray-200" />
                  
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">${(cart.total + cart.shippingCost).toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
                  size="lg"
                  onClick={() => setShowCheckoutModal(true)}
                >
                  Checkout
                </Button>
              </>
            )}
          </div>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>

    <CheckoutModal 
      isOpen={showCheckoutModal} 
      onClose={() => setShowCheckoutModal(false)} 
    />
    </>
  );
}