import { Suspense } from 'react';
import { getProducts } from '@/lib/catalog';
import ShopClient from './ShopClient';

// Fetch the full catalogue on the server so the initial HTML already contains
// every product (reflecting admin stock/price changes). This avoids the old
// behaviour where the static list rendered first and then got replaced.
export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">Laden...</div>}>
      <ShopClient initialProducts={products} />
    </Suspense>
  );
}
