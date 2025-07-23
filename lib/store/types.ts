export interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  description?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  shippingCost: number;
  itemCount: number;
}

export interface StoreInfo {
  products: Product[];
  policies: {
    return: string;
    shipping: string;
    warranty: string;
  };
}