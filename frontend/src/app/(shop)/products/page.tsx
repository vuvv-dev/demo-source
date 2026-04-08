'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import ProductCard from '@/components/shop/ProductCard';
import { Product, Category } from '@/types';
import Link from 'next/link';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categorySlug') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'popular');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const limit = 12;

  const fetchProducts = () => {
    setLoading(true);
    productsApi.list({ page, limit, search, categorySlug: selectedCategory, sortBy, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined })
      .then(r => { setProducts(r.data.data); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { categoriesApi.list().then(r => setCategories(r.data.data)); }, []);
  useEffect(() => { fetchProducts(); }, [page, selectedCategory, sortBy, search, minPrice, maxPrice]);

  const totalPages = Math.ceil(total / limit);
  const activeCategory = categories.find(c => c.slug === selectedCategory);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6 text-[#86868b]">
          <Link href="/" className="hover:text-[#1d1d1f] transition-colors">Trang chủ</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-[#1d1d1f]">
            {activeCategory ? activeCategory.name : 'Sản phẩm'}
          </span>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 hidden lg:block">
            <div className="sticky top-20 space-y-6">
              {/* Search */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-[#86868b]">Tìm kiếm</p>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchProducts()}
                    placeholder="Tên sản phẩm..."
                    className="w-full h-10 rounded-xl border border-[#e5e5e7] bg-white text-[#1d1d1f] pl-9 pr-4 text-sm focus:border-[#0071e3] outline-none transition-colors"
                  />
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

              {/* Price */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-[#86868b]">Khoảng giá</p>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="Từ"
                    className="w-full h-9 rounded-xl border border-[#e5e5e7] bg-white text-[#1d1d1f] px-3 text-xs focus:border-[#0071e3] outline-none transition-colors"
                  />
                  <span className="text-[#86868b]">–</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="Đến"
                    className="w-full h-9 rounded-xl border border-[#e5e5e7] bg-white text-[#1d1d1f] px-3 text-xs focus:border-[#0071e3] outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={() => { setPage(1); fetchProducts(); }}
                  className="w-full mt-2 h-9 rounded-xl text-xs font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#1d1d1f]">
                  {activeCategory ? activeCategory.name : 'Tất cả sản phẩm'}
                </h1>
                <p className="text-sm mt-0.5 text-[#86868b]">{total} sản phẩm</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Clear filters */}
                {(selectedCategory || search || minPrice || maxPrice) && (
                  <button
                    onClick={() => { setSelectedCategory(''); setSearch(''); setMinPrice(''); setMaxPrice(''); setPage(1); fetchProducts(); }}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-[#ff3b30] bg-[#fef2f2] transition-colors"
                  >
                    <X size={12} /> Xóa lọc
                  </button>
                )}
                <select
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); setPage(1); fetchProducts(); }}
                  className="h-9 rounded-xl border border-[#e5e5e7] bg-white text-[#1d1d1f] px-3 text-sm cursor-pointer outline-none focus:border-[#0071e3] transition-colors"
                >
                  <option value="popular">Phổ biến nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp → Cao</option>
                  <option value="price_desc">Giá: Cao → Thấp</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl animate-pulse bg-[#f5f5f7] aspect-[0.8/1]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-base text-[#86868b]">Không tìm thấy sản phẩm nào 😢</p>
                <button
                  onClick={() => { setSelectedCategory(''); setSearch(''); setMinPrice(''); setMaxPrice(''); }}
                  className="mt-4 px-6 h-10 rounded-xl text-sm font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-xl border border-[#e5e5e7] text-[#1d1d1f] text-sm font-medium hover:bg-[#f5f5f7] transition-colors disabled:opacity-40"
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
                        : 'border border-[#e5e5e7] text-[#1d1d1f] hover:bg-[#f5f5f7]'
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl border border-[#e5e5e7] text-[#1d1d1f] text-sm font-medium hover:bg-[#f5f5f7] transition-colors disabled:opacity-40"
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
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="h-96 bg-gray-100 rounded-2xl animate-pulse" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}