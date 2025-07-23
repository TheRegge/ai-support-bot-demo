import type { StoreInfo } from './types';

export const STORE_INFO: StoreInfo = {
  products: [
    { 
      id: "1",
      name: "Wireless Headphones", 
      price: "$99.99", 
      stock: 15,
      description: "High-quality wireless headphones with noise cancellation"
    },
    { 
      id: "2",
      name: "Smart Watch", 
      price: "$299.99", 
      stock: 8,
      description: "Feature-rich smartwatch with health monitoring"
    },
    { 
      id: "3",
      name: "Bluetooth Speaker", 
      price: "$79.99", 
      stock: 23,
      description: "Portable speaker with premium sound quality"
    },
    { 
      id: "4",
      name: "Laptop Stand", 
      price: "$49.99", 
      stock: 32,
      description: "Ergonomic aluminum laptop stand with adjustable height"
    },
    { 
      id: "5",
      name: "Wireless Charging Pad", 
      price: "$39.99", 
      stock: 45,
      description: "Fast wireless charger compatible with all Qi-enabled devices"
    },
    { 
      id: "6",
      name: "USB-C Hub", 
      price: "$59.99", 
      stock: 28,
      description: "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader"
    }
  ],
  policies: {
    return: "30-day return policy",
    shipping: "Free shipping on orders over $50",
    warranty: "1-year manufacturer warranty"
  }
};