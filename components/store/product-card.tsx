import type { Product } from '@/lib/store/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductIllustration } from './product-illustration';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="p-6 bg-white text-gray-900 border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="h-32 mb-4 overflow-hidden rounded-lg">
        <ProductIllustration productId={product.id} />
      </div>
      <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
      <p className="text-blue-600 font-bold">{product.price}</p>
      <p className="text-sm text-gray-500">{product.stock} in stock</p>
      {product.description && (
        <p className="text-sm text-gray-600 mt-2">{product.description}</p>
      )}
      <Button className="w-full mt-4">
        Add to Cart
      </Button>
    </Card>
  );
}