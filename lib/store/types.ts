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

export interface StoreInfo {
  products: Product[];
  policies: {
    return: string;
    shipping: string;
    warranty: string;
  };
}