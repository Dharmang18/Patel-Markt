'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { Product, categoryEmoji } from '@/lib/products';
import { useCartStore } from '@/lib/store';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('products');
  const locale = useLocale();
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  const productName = locale === 'de' ? product.nameDE : product.name;

  const handleAdd = () => {
    if (!product.inStock) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="card overflow-hidden group flex flex-col">
      {/* Product image */}
      <div className="h-44 bg-gradient-to-br from-red-50 to-amber-100 flex items-center justify-center text-5xl relative overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <span>{categoryEmoji[product.category]}</span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-full">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">
            {product.brand}
          </p>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
            {productName}
          </h3>
          <p className="text-xs text-gray-400">{product.unit}</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold text-gray-900">
            €{product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200 ${
              added
                ? 'bg-green-500 text-white'
                : product.inStock
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                OK
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {t('addToCart')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
