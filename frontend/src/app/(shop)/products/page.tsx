'use client';
import { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Search, X, ChevronRight, SlidersHorizontal,
  Grid2x2, List, Star, Package, LayoutGrid,
} from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import ProductCard from '@/components/shop/ProductCard';
import { Product, Category } from '@/types';
import Link from 'next/link';

const LIMIT = 12;

const SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'sold', label: 'Bán chạy nhất' },
  { value: 'price_asc', label: 'Giá: Thấp → Cao' },
  { value: 'price_desc', label: 'Giá: Cao → Thấp' },
];

const STOCK_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'in_stock', label: 'Còn hàng' },
  { value: 'out_of_stock', label: 'Hết hàng' },
];

const RATING_OPTIONS = [
  { value: 4, label: '4★ & trên' },
  { value: 3, label: '3★ & trên' },
  { value: 2, label: '2★ & trên' },
];

function buildApiParams(p: {
  page: number;
  search: string;
  selectedCategory: string;
  sortBy: string;
  order: string;
  minPrice: string;
  maxPrice: string;
  minRating: number | null;
  inStock: string;
}) {
  return {
    page: p.page,
    limit: LIMIT,
    search: p.search || undefined,
    categorySlug: p.selectedCategory || undefined,
    sortBy: p.sortBy,
    order: p.order,
    minPrice: p.minPrice ? +p.minPrice : undefined,
    maxPrice: p.maxPrice ? +p.maxPrice : undefined,
    minRating: p.minRating ?? undefined,
    inStock: p.inStock === 'all' ? undefined : p.inStock,
  };
}

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Core state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ── Filter state — initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categorySlug') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'popular');
  const [order, setOrder] = useState(searchParams.get('order') || 'desc');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState<number | null>(
    searchParams.get('minRating') ? +searchParams.get('minRating')! : null,
  );
  const [inStock, setInStock] = useState(searchParams.get('inStock') || 'all');
  const [page, setPage] = useState(+searchParams.get('page')! || 1);

  // ── Debounce search
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  // ── Sync URL params
  const syncToUrl = useCallback(
    (overrides: Partial<Record<string, string | number | null>> = {}) => {
      const params = new URLSearchParams();
      const vals = { search: debouncedSearch, categorySlug: selectedCategory, sortBy, order, minPrice, maxPrice, minRating, inStock, page };
      (Object.entries(vals) as [string, string | number | null][]).forEach(([k, v]) => {
        if (v != null && v !== '' && v !== 'all' && !(k === 'page' && v === 1)) {
          if (k === 'minRating' && (v as number) > 0) params.set(k, String(v));
          else if (k !== 'minRating') params.set(k, String(v));
        }
      });
      Object.entries(overrides).forEach(([k, v]) => {
        if (v == null || v === '') params.delete(k);
        else params.set(k, String(v));
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearch, selectedCategory, sortBy, order, minPrice, maxPrice, minRating, inStock, page, pathname],
  );

  // ── Fetch products
  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = buildApiParams({ page, search: debouncedSearch, selectedCategory, sortBy, order, minPrice, maxPrice, minRating, inStock });
    productsApi.list(params)
      .then(r => { setProducts(r.data.data); setTotal(r.data.total); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, selectedCategory, sortBy, order, minPrice, maxPrice, minRating, inStock]);

  useEffect(() => { categoriesApi.list().then(r => setCategories(r.data.data)); }, []);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { syncToUrl(); }, [syncToUrl]);

  // ── Filter helpers
  const totalPages = Math.ceil(total / LIMIT);
  const activeCategory = categories.find(c => c.slug === selectedCategory);

  const hasActiveFilters =
    debouncedSearch || selectedCategory || sortBy !== 'popular' || order !== 'desc'
    || minPrice || maxPrice || minRating != null || inStock !== 'all';

  const clearAll = () => {
    setSearch(''); setDebouncedSearch('');
    setSelectedCategory('');
    setSortBy('popular'); setOrder('desc');
    setMinPrice(''); setMaxPrice('');
    setMinRating(null); setInStock('all');
    setPage(1);
  };

  const removeFilter = (type: string, val?: string) => {
    switch (type) {
      case 'search':     setSearch(''); setDebouncedSearch(''); setPage(1); break;
      case 'category':   setSelectedCategory(''); setPage(1); break;
      case 'sort':       setSortBy('popular'); setPage(1); break;
      case 'order':      setOrder('desc'); setPage(1); break;
      case 'minPrice':   setMinPrice(''); setPage(1); break;
      case 'maxPrice':   setMaxPrice(''); setPage(1); break;
      case 'rating':     setMinRating(null); setPage(1); break;
      case 'stock':      setInStock('all'); setPage(1); break;
    }
  };

  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6 text-[#86868b]">
          <Link href="/" className="hover:text-[#1d1d1f] transition-colors">Trang chủ</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-[#1d1d1f] transition-colors">Sản phẩm</Link>
          {activeCategory && (
            <>
              <ChevronRight size={12} />
              <span className="font-medium text-[#1d1d1f]">{activeCategory.name}</span>
            </>
          )}
        </div>

        <div className="flex gap-8">
          {/* ── Sidebar */}
          <aside className="w-56 shrink-0 hidden lg:block">
            <div className="sticky top-20 space-y-6 bg-white rounded-2xl p-4 shadow-sm">

              {/* Search */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-[#86868b]">Tìm kiếm</p>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => handleSearchChange(e.target.value)}
                    placeholder="Tên sản phẩm..."
                    className="w-full h-10 rounded-xl border border-[#e5e5e7] bg-white text-[#1d1d1f] pl-9 pr-4 text-sm focus:border-[#0071e3] outline-none transition-colors"
                  />
                  {search && (
                    <button
                      onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-[#86868b]">Danh mục</p>
                <div className="space-y-0.5">
                  <button
                    onClick={() => { setSelectedCategory(''); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${!selectedCategory ? 'bg-[#0071e3] text-white' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'}`}
                  >
                    Tất cả
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCategory(c.slug); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === c.slug ? 'bg-[#0071e3] text-white' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-[#86868b]">Khoảng giá</p>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={e => { setMinPrice(e.target.value); }}
                    placeholder="Từ"
                    className="w-full h-9 rounded-xl border border-[#e5e5e7] bg-white text-[#1d1d1f] px-3 text-xs focus:border-[#0071e3] outline-none transition-colors"
                  />
                  <span className="text-[#86868b]">–</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => { setMaxPrice(e.target.value); }}
                    placeholder="Đến"
                    className="w-full h-9 rounded-xl border border-[#e5e5e7] bg-white text-[#1d1d1f] px-3 text-xs focus:border-[#0071e3] outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={() => { setPage(1); }}
                  className="w-full mt-2 h-9 rounded-xl text-xs font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors"
                >
                  Áp dụng
                </button>
              </div>

              {/* Rating */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-[#86868b]">Đánh giá</p>
                <div className="space-y-1">
                  {RATING_OPTIONS.map(r => (
                    <button
                      key={r.value}
                      onClick={() => { setMinRating(minRating === r.value ? null : r.value); setPage(1); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${minRating === r.value ? 'bg-[#0071e3] text-white' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'}`}
                    >
                      <Star size={12} className={minRating === r.value ? 'text-white' : 'text-[#f5c518]'} fill={minRating === r.value ? 'white' : '#f5c518'} />
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-[#86868b]">Tình trạng</p>
                <div className="space-y-1">
                  {STOCK_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => { setInStock(s.value); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${inStock === s.value ? 'bg-[#0071e3] text-white' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'}`}
                    >
                      {s.value === 'in_stock' && <Package size={12} className="inline mr-2" />}
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear all */}
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="w-full flex items-center justify-center gap-1.5 text-xs px-3 py-2.5 rounded-xl text-[#ff3b30] bg-[#fef2f2] hover:bg-[#fee2e2] transition-colors font-medium"
                >
                  <X size={12} /> Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          </aside>

          {/* ── Mobile filter bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e7] z-40 px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => document.getElementById('mobile-filter')?.classList.toggle('hidden')}
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-[#e5e5e7] text-sm text-[#1d1d1f] font-medium"
            >
              <SlidersHorizontal size={14} /> Bộ lọc
            </button>
            {/* Mobile sort */}
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="h-10 flex-1 rounded-xl border border-[#e5e5e7] bg-white text-[#1d1d1f] px-3 text-sm cursor-pointer outline-none"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* ── Main content */}
          <div className="flex-1 min-w-0 pb-20 lg:pb-0">

            {/* Header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#1d1d1f]">
                  {activeCategory ? activeCategory.name : 'Tất cả sản phẩm'}
                </h1>
                <p className="text-sm mt-0.5 text-[#86868b]">
                  {loading ? 'Đang tải...' : `${total} sản phẩm`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Order direction toggle */}
                <div className="flex rounded-xl border border-[#e5e5e7] overflow-hidden">
                  <button
                    onClick={() => { setOrder('asc'); setPage(1); }}
                    className={`px-3 h-9 text-xs font-medium transition-colors ${order === 'asc' ? 'bg-[#0071e3] text-white' : 'bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]'}`}
                    title="Tăng dần"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => { setOrder('desc'); setPage(1); }}
                    className={`px-3 h-9 text-xs font-medium transition-colors ${order === 'desc' ? 'bg-[#0071e3] text-white' : 'bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]'}`}
                    title="Giảm dần"
                  >
                    ↓
                  </button>
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); setPage(1); }}
                  className="h-9 rounded-xl border border-[#e5e5e7] bg-white text-[#1d1d1f] px-3 text-sm cursor-pointer outline-none focus:border-[#0071e3] transition-colors"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                {/* Grid / List toggle */}
                <div className="flex rounded-xl border border-[#e5e5e7] overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#0071e3] text-white' : 'bg-white text-[#86868b] hover:bg-[#f5f5f7]'}`}
                    title="Lưới"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#0071e3] text-white' : 'bg-white text-[#86868b] hover:bg-[#f5f5f7]'}`}
                    title="Danh sách"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-5">
                {debouncedSearch && (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0071e3] text-white text-xs font-medium">
                    &ldquo;{debouncedSearch}&rdquo;
                    <button onClick={() => removeFilter('search')} className="ml-1 hover:opacity-70"><X size={10} /></button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0071e3] text-white text-xs font-medium">
                    {activeCategory?.name}
                    <button onClick={() => removeFilter('category')} className="ml-1 hover:opacity-70"><X size={10} /></button>
                  </span>
                )}
                {sortBy !== 'popular' && (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0071e3] text-white text-xs font-medium">
                    {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                    <button onClick={() => removeFilter('sort')} className="ml-1 hover:opacity-70"><X size={10} /></button>
                  </span>
                )}
                {order === 'asc' && (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0071e3] text-white text-xs font-medium">
                    Tăng dần ↑
                    <button onClick={() => removeFilter('order')} className="ml-1 hover:opacity-70"><X size={10} /></button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0071e3] text-white text-xs font-medium">
                    {minPrice ? Number(minPrice).toLocaleString() : '0'} – {maxPrice ? Number(maxPrice).toLocaleString() : '∞'}đ
                    <button onClick={() => { removeFilter('minPrice'); removeFilter('maxPrice'); }} className="ml-1 hover:opacity-70"><X size={10} /></button>
                  </span>
                )}
                {minRating != null && (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0071e3] text-white text-xs font-medium">
                    {minRating}★+
                    <button onClick={() => removeFilter('rating')} className="ml-1 hover:opacity-70"><X size={10} /></button>
                  </span>
                )}
                {inStock !== 'all' && (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0071e3] text-white text-xs font-medium">
                    {inStock === 'in_stock' ? 'Còn hàng' : 'Hết hàng'}
                    <button onClick={() => removeFilter('stock')} className="ml-1 hover:opacity-70"><X size={10} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Product grid / list */}
            {loading ? (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(viewMode === 'grid' ? 6 : 3)].map((_, i) => (
                  <div key={i} className="rounded-2xl animate-pulse bg-white aspect-[0.8/1]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl">
                <p className="text-base text-[#86868b]">Không tìm thấy sản phẩm nào 😢</p>
                <button
                  onClick={clearAll}
                  className="mt-4 px-6 h-10 rounded-xl text-sm font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map(p => <ProductCard key={p.id} product={p} viewMode={viewMode} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-xl border border-[#e5e5e7] text-[#1d1d1f] text-sm font-medium hover:bg-white transition-colors disabled:opacity-40"
                >
                  ←
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const endPage = Math.min(totalPages, startPage + 4);
                  if (i + 1 < startPage || i + 1 > endPage) return null;
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${p === page
                        ? 'bg-[#0071e3] text-white border border-[#0071e3]'
                        : 'border border-[#e5e5e7] text-[#1d1d1f] bg-white hover:bg-[#f5f5f7]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl border border-[#e5e5e7] text-[#1d1d1f] text-sm font-medium hover:bg-white transition-colors disabled:opacity-40"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#f5f5f7] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="flex gap-8">
            <div className="w-56 shrink-0"><div className="h-96 bg-white rounded-2xl animate-pulse" /></div>
            <div className="flex-1"><div className="h-96 bg-white rounded-2xl animate-pulse" /></div>
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}