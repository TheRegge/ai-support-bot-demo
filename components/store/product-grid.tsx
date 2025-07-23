import { ProductCard } from './product-card';
import { STORE_INFO } from '@/lib/store/constants';

export function ProductGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {STORE_INFO.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}