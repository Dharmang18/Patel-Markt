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
    <div className="card-interactive overflow-hidden group flex flex-col">
      {/* Product image */}
      <div className="aspect-square bg-surface-sunken/50 flex items-center justify-center text-5xl relative overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <span aria-hidden="true">{categoryEmoji[product.category]}</span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-800 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 border-t border-surface-line">
        <div className="flex-1 min-w-0">
          {product.brand && <p className="eyebrow mb-1 truncate">{product.brand}</p>}
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1.5 line-clamp-2">
            {productName}
          </h3>
          <p className="text-xs text-gray-500">{product.unit}</p>
        </div>

        {/* Price and action sit on their own rows: the German label
            ("In den Warenkorb") does not fit beside the price in a 4-up grid,
            and the button is the primary action on the page. */}
        <div className="mt-4 space-y-3">
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-extrabold text-gray-900 tabular-nums">
              €{product.price.toFixed(2)}
            </p>
            {product.inStock && (
              <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                {t('inStock')}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            aria-label={`${t('addToCart')} – ${productName}`}
            className={`btn btn-sm w-full ${
              added
                ? 'bg-green-600 text-white'
                : product.inStock
                ? 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('added')}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('addToCart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
