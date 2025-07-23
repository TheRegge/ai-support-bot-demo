'use client';

import type { Product } from '@/lib/store/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductIllustration } from './product-illustration';
import { useCart } from './cart-context';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Card className="p-4 sm:p-6 bg-white text-gray-900 border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="h-28 sm:h-32 mb-3 sm:mb-4 overflow-hidden rounded-lg">
        <ProductIllustration productId={product.id} />
      </div>
      <h3 className="font-semibold text-base sm:text-lg text-gray-900 leading-tight">{product.name}</h3>
      <p className="text-blue-600 font-bold text-lg sm:text-xl mt-1">{product.price}</p>
      <p className="text-xs sm:text-sm text-gray-500">{product.stock} in stock</p>
      {product.description && (
        <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
      )}
      <Button 
        className="w-full mt-3 sm:mt-4 text-sm sm:text-base py-2 sm:py-2.5 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-200 hover:scale-[1.02] transition-all duration-200" 
        onClick={handleAddToCart}
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </Button>
    </Card>
  );
}