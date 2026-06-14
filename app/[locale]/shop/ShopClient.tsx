'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { categories, Category, categoryEmoji, Product } from '@/lib/products';
import { SlidersHorizontal, Search } from 'lucide-react';

// Receives the full catalogue already fetched on the server, so the first
// paint shows every product — no "static list first, then swap" flash.
export default function ShopClient({ initialProducts }: { initialProducts: Product[] }) {
  const t = useTranslations('categories');
  const tp = useTranslations('products');
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') as Category | null;
  const [activeCategory, setActiveCategory] = useState<Category | null>(initialCategory);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [query, setQuery] = useState('');
  const products = initialProducts;

  // Localised category label, falling back to the raw value if the category
  // isn't in the translation file (e.g. a custom category added via admin).
  const categoryLabel = (cat: string) => {
    try { return t(cat as Category); } catch { return cat; }
  };

  const inActiveCategory = (p: Product) => !activeCategory || p.category === activeCategory;
  const bySort = (a: Product, b: Product) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  };

  // Split text into words (Latin + Devanagari aware) for word-prefix matching.
  const toWords = (s: string) =>
    s.toLowerCase().split(/[^a-z0-9ऀ-ॿ]+/i).filter(Boolean);

  const q = query.trim().toLowerCase();
  const terms = toWords(q);
  // A product matches when every search term is the prefix of some word in its
  // name, brand, category (raw + localised) or description. Prefix-per-word
  // (not substring) means "atta" hits "Chakki Atta" but not "khatta"/"Navrattan".
  const matchesQuery = (p: Product) => {
    if (!terms.length) return true;
    const words = toWords(
      `${p.name} ${p.nameDE} ${p.brand} ${p.category} ${categoryLabel(p.category)} ${p.description} ${p.descriptionDE}`
    );
    return terms.every((term) => words.some((w) => w.startsWith(term)));
  };

  const matched = products.filter(inActiveCategory).filter(matchesQuery).sort(bySort);

  // While searching, suggest related products: other items that share a
  // category or brand with the matches (but aren't matches themselves).
  const matchedIds = new Set(matched.map((p) => p.id));
  const relatedCats = new Set(matched.map((p) => p.category));
  const relatedBrands = new Set(matched.map((p) => p.brand.toLowerCase()).filter(Boolean));
  const suggestions = q && matched.length
    ? products
        .filter(inActiveCategory)
        .filter((p) => !matchedIds.has(p.id) && (relatedCats.has(p.category) || relatedBrands.has(p.brand.toLowerCase())))
        .sort(bySort)
        .slice(0, 8)
    : [];

  const filtered = matched;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">{tp('featured')}</h1>
        <p className="text-gray-500 mt-1">{tp('productsCount', { count: filtered.length })}</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tp('searchPlaceholder')}
          className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 flex-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              !activeCategory
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
            }`}
          >
            Alle
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
              }`}
            >
              {categoryEmoji[cat]} {t(cat)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          >
            <option value="default">Standard</option>
            <option value="price-asc">Preis: aufsteigend</option>
            <option value="price-desc">Preis: absteigend</option>
          </select>
        </div>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-semibold text-lg">{tp('noResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Related products (only while searching) */}
      {suggestions.length > 0 && (
        <div className="mt-14 border-t border-gray-100 pt-10">
          <h2 className="text-2xl font-extrabold text-gray-900">{tp('related')}</h2>
          <p className="text-gray-500 mt-1 mb-6">{tp('relatedSub')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {suggestions.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
