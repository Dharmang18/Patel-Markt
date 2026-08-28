'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import { categories, Category, categoryEmoji, Product } from '@/lib/products';
import { SlidersHorizontal, Search, X } from 'lucide-react';

// Receives the full catalogue already fetched on the server, so the first
// paint shows every product — no "static list first, then swap" flash.
export default function ShopClient({ initialProducts }: { initialProducts: Product[] }) {
  const t = useTranslations('categories');
  const tp = useTranslations('products');
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') as Category | null;
  const qParam = searchParams.get('q') ?? '';
  const [activeCategory, setActiveCategory] = useState<Category | null>(initialCategory);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [query, setQuery] = useState(qParam);

  // Keep the search box in sync when the ?q= param changes via the header
  // search (Next.js doesn't remount this component on same-route navigation).
  useEffect(() => { setQuery(qParam); }, [qParam]);

  // The filter bar is two rows tall on most widths, so it eats the viewport
  // while browsing. It slides 1:1 with the scroll: scrolling down drags it up
  // until it tucks behind the header, scrolling up pulls it back out.
  //
  // The offset is written straight to the node instead of going through state.
  // A setState here would re-render this component — and with it every card in
  // the grid — on every scroll frame, which is what made it lag.
  const filterBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = filterBarRef.current;
    if (!el) return;
    let lastY = window.scrollY;
    let offset = 0;
    let ticking = false;
    const apply = () => {
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      lastY = y;
      // +8px so the bar's bottom border clears the header rather than
      // leaving a sliver behind it.
      const max = el.offsetHeight + 8;
      const next = Math.min(max, Math.max(0, offset + delta));
      if (next !== offset) {
        offset = next;
        el.style.transform = `translateY(-${offset}px)`;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
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
    <div>
      {/* Page header band */}
      <div className="bg-surface-raised border-b border-surface-line">
        <div className="container-page py-6 sm:py-7">
          <span className="section-kicker !mb-1.5">{tp('shopAll')}</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            {tp('shopTitle')}
          </h1>
          <p className="text-gray-500 mt-2 text-base">
            {tp('productsCount', { count: filtered.length })}
          </p>
          <span className="rule !mt-3" aria-hidden="true" />
        </div>
      </div>

      <div className="container-page py-8">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tp('searchPlaceholder')}
          aria-label={tp('searchPlaceholder')}
          className="field pl-11 pr-11 py-3"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label={tp('searchPlaceholder')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters row — sticks under the header so the active category stays
          visible while scrolling a long grid. */}
      <div
        ref={filterBarRef}
        className="sticky top-[7.5rem] z-20 -mx-4 px-4 py-3 mb-8 bg-surface/95 backdrop-blur
                   border-y border-surface-line flex flex-col lg:flex-row lg:items-center gap-3
                   will-change-transform"
      >
        {/* Category pills — a single horizontal rail on mobile so eleven
            categories don't push the grid below the fold. */}
        <div className="flex gap-2 flex-1 overflow-x-auto no-scrollbar lg:flex-wrap lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            aria-pressed={!activeCategory}
            className={!activeCategory ? 'pill-active' : 'pill-idle'}
          >
            {tp('allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              aria-pressed={activeCategory === cat}
              className={activeCategory === cat ? 'pill-active' : 'pill-idle'}
            >
              <span aria-hidden="true">{categoryEmoji[cat]}</span> {t(cat)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" aria-hidden="true" />
          <label htmlFor="shop-sort" className="sr-only">{tp('sortLabel')}</label>
          <select
            id="shop-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="field py-2 w-auto"
          >
            <option value="default">{tp('sortDefault')}</option>
            <option value="price-asc">{tp('sortPriceAsc')}</option>
            <option value="price-desc">{tp('sortPriceDesc')}</option>
          </select>
        </div>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4" aria-hidden="true">🔍</p>
          <p className="font-semibold text-lg text-gray-700">{tp('noResults')}</p>
          <p className="text-sm text-gray-500 mt-1">{tp('noResultsHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Related products (only while searching) */}
      {suggestions.length > 0 && (
        <div className="mt-14 border-t border-gray-200 pt-10">
          <h2 className="section-title">{tp('related')}</h2>
          <p className="section-subtitle mb-6">{tp('relatedSub')}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {suggestions.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
