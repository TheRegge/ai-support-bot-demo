'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Product, CartItem, Cart } from '@/lib/store/types';

interface CartContextValue {
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 5.99;
const STORAGE_KEY = 'shopping-cart';

function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const price = Number.parseFloat(item.product.price.replace('$', ''));
    return total + price * item.quantity;
  }, 0);
}

function calculateShipping(total: number): number {
  return total >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

function getItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedItems = JSON.parse(stored);
        setItems(parsedItems);
      } catch (error) {
        console.warn('Failed to parse stored cart data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...currentItems, {
        id: `${product.id}-${Date.now()}`,
        product,
        quantity
      }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(currentItems => 
      currentItems.filter(item => item.product.id !== productId)
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cart = useMemo(() => {
    const total = calculateTotal(items);
    const shippingCost = calculateShipping(total);
    const itemCount = getItemCount(items);
    
    return {
      items,
      total,
      shippingCost,
      itemCount
    };
  }, [items]);

  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}