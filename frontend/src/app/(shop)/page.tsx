'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Truck, CreditCard, RotateCcw, Zap, Sparkles } from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import ProductCard from '@/components/shop/ProductCard';
import { Product, Category } from '@/types';
import { formatPrice } from '@/lib/utils';

const categoryIcons: Record<string, JSX.Element> = {
  'iphone': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="3" /><line x1="12" y1="18" x2="12" y2="18.01" /></svg>,
  'ipad': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2" /><circle cx="12" cy="14" r="1.5" /></svg>,
  'mac': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>,
  'airpods': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10a6 6 0 0 0 12 0V5a2 2 0 1 0-4 0" /><path d="M6 10H3a3 3 0 0 0 3 3" /><path d="M18 10h3a3 3 0 0 1-3 3" /></svg>,
  'apple-watch': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="16" rx="3" /><path d="M9 1h6M9 23h6" /><rect x="9" y="8" width="6" height="4" rx="1" /></svg>,
  'phu-kien': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6M12 16v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" /></svg>,
};

const trustItems = [
  { icon: Shield, label: 'Chính hãng 100%', sub: 'Bảo hành Apple Authorised', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: Truck, label: 'Giao hàng nhanh', sub: 'Từ 2h trong nội thành', color: 'text-[#0071e3]', bg: 'bg-blue-50' },
  { icon: CreditCard, label: 'Thanh toán an toàn', sub: 'COD hoặc chuyển khoản', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: RotateCcw, label: 'Đổi trả dễ dàng', sub: 'Trong 15 ngày đầu tiên', color: 'text-orange-500', bg: 'bg-orange-50' },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);

  useEffect(() => {
    Promise.all([
      productsApi.list({ limit: 8, sortBy: 'popular' }),
      categoriesApi.list(),
    ]).then(([pRes, cRes]) => {
      const data = pRes.data.data;
      setProducts(data);
      setCategories(cRes.data.data);
      // Use first product as hero, fallback to hardcoded
      setHeroProduct(data[0] || null);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen">

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden min-h-[580px] flex items-center">
        {/* Background image */}
        {heroProduct?.images?.[0] ? (
          <>
            <div className="absolute inset-0 z-0">
              <Image
                src={heroProduct.images[0]}
                alt={heroProduct.name}
                fill
                className="object-cover object-center"
                priority
              />
            </div>
            {/* Overlay gradient */}
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0d1117]/90 via-[#0d1117]/70 to-transparent" />
            {/* Animated background product images (parallax layers) */}
            {products[1]?.images?.[0] && (
              <div className="hero-bg-layer hero-bg-layer-1">
                <Image src={products[1].images[0]} alt="" fill className="object-cover opacity-20 blur-sm scale-110" />
              </div>
            )}
            {products[2]?.images?.[0] && (
              <div className="hero-bg-layer hero-bg-layer-2">
                <Image src={products[2].images[0]} alt="" fill className="object-cover opacity-15 blur-md scale-125" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#111827] to-[#1a1f35]" />
        )}

        {/* Animated orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
            {/* Left — text */}
            <div className="order-2 lg:order-1 text-center lg:text-left animate-slide-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-semibold mb-5 animate-pulse-glow">
                <Sparkles size={12} className="text-yellow-400" />
                Sản phẩm nổi bật
              </div>

              {/* Product name */}
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1] text-white mb-5 drop-shadow-lg">
                {heroProduct?.name || 'iPhone 16 Pro Max'}
              </h1>

              {/* Description */}
              <p className="text-base lg:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 text-white/70 mb-8">
                {heroProduct?.description
                  ? heroProduct.description.length > 120
                    ? heroProduct.description.substring(0, 120) + '...'
                    : heroProduct.description
                  : 'Chip A18 Pro mạnh mẽ nhất từ trước đến nay. Màn hình Super Retina XDR 6.9 inch. Camera Fusion 48MP đỉnh cao.'}
              </p>

              {/* Rating */}
              {heroProduct?.averageRating && (
                <div className="flex items-center gap-2 mb-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="14" height="14" viewBox="0 0 24 24"
                        fill={s <= Math.round(Number(heroProduct.averageRating)) ? '#ff9f0a' : '#374151'}
                        stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-white/60">
                    {heroProduct.averageRating} ({heroProduct.reviewCount} đánh giá)
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                <Link href={heroProduct ? `/products/${heroProduct.slug}` : '/products/iphone-16-pro-max'}>
                  <button className="gradient-btn inline-flex items-center gap-2 px-7 h-12 rounded-xl text-sm font-semibold">
                    Mua ngay <ArrowRight size={16} />
                  </button>
                </Link>
                <Link href={heroProduct?.category ? `/products?categorySlug=${heroProduct.category.slug}` : '/products'}>
                  <button className="inline-flex items-center gap-2 px-6 h-12 rounded-xl text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all">
                    Khám phá thêm
                  </button>
                </Link>
              </div>

              {/* Price tag */}
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-white/60 border border-white/10 backdrop-blur-sm">Giá từ</span>
                <span className="text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                  {heroProduct ? formatPrice(heroProduct.price) : '39.990.000đ'}
                </span>
                {heroProduct?.originalPrice && heroProduct.originalPrice > heroProduct.price && (
                  <span className="text-base text-white/40 line-through">
                    {formatPrice(heroProduct.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Right — hero product image */}
            <div className="order-1 lg:order-2 relative animate-fade-in">
              {/* Main image */}
              <div className="relative mx-auto w-full max-w-md animate-hero-float">
                {heroProduct?.images?.[0] ? (
                  <Image
                    src={heroProduct.images[0]}
                    alt={heroProduct.name}
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                ) : (
                  <Image
                    src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700"
                    alt="iPhone 16 Pro Max"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                )}
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 -z-10 flex items-center justify-center">
                <div className="w-80 h-80 rounded-full bg-gradient-to-br from-[#0071e3]/30 to-[#5eb5f7]/15 blur-3xl animate-pulse-glow" />
              </div>
              {/* Floating product chips */}
              {products[1] && (
                <div className="absolute top-8 -right-4 lg:right-4 glass-card px-3 py-2 rounded-xl animate-chip-float-1">
                  <p className="text-[10px] text-[#86868b]">🔥 Bán chạy</p>
                  <p className="text-xs font-semibold text-[#1d1d1f] line-clamp-1">{products[1].name}</p>
                </div>
              )}
              {products[2] && (
                <div className="absolute bottom-12 -left-4 lg:left-2 glass-card px-3 py-2 rounded-xl animate-chip-float-2">
                  <p className="text-[10px] text-[#86868b]">⭐ Nổi bật</p>
                  <p className="text-xs font-semibold text-[#1d1d1f] line-clamp-1">{products[2].name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="bg-white border-b border-[#f5f5f7]">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trustItems.map(({ icon: Icon, label, sub, color, bg }, i) => (
              <div key={label} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl ${bg} animate-slide-up`}
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1d1d1f]">{label}</p>
                  <p className="text-[11px] text-[#86868b] mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-heading">Dòng sản phẩm</h2>
            <p className="section-sub">Khám phá hệ sinh thái Apple</p>
          </div>
          <Link href="/products">
            <button className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-[#0071e3] hover:gap-2.5 transition-all px-4 py-2 rounded-xl bg-[#eff6ff] hover:bg-[#dbeafe]">
              Xem tất cả <ArrowRight size={14} />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 stagger-children">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/products?categorySlug=${cat.slug}`}>
              <div className="category-card group h-full">
                <div className="text-[#0071e3] group-hover:scale-110 transition-transform duration-300">
                  {categoryIcons[cat.slug] || categoryIcons['phu-kien']}
                </div>
                <p className="text-xs font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section className="bg-gradient-to-b from-[#f5f5f7] to-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-heading">Sản phẩm nổi bật</h2>
              <p className="section-sub">Những sản phẩm được yêu thích nhất</p>
            </div>
            <Link href="/products?sortBy=popular">
              <button className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-[#0071e3] hover:gap-2.5 transition-all px-4 py-2 rounded-xl bg-[#eff6ff] hover:bg-[#dbeafe]">
                Xem thêm <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="aspect-square skeleton rounded-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 skeleton rounded-lg w-1/3" />
                    <div className="h-4 skeleton rounded-lg w-3/4" />
                    <div className="h-4 skeleton rounded-lg w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 stagger-children">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── iPhone Banner ─── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d1d1f] via-[#2d2d2d] to-[#1d1d1f] px-8 lg:px-16 py-16 text-center">
          {/* Glow effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#0071e3]/20 blur-[100px] rounded-full" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-medium mb-5">
              <Zap size={12} className="text-yellow-400" /> Công nghệ đỉnh cao
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              iPhone 16 Series
            </h2>
            <p className="text-base max-w-lg mx-auto text-white/50 mb-10">
              Trải nghiệm chip A18 Pro mạnh mẽ, camera Fusion 48MP và pin trâu nhất từ trước đến nay.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products?categorySlug=iphone">
                <button className="gradient-btn inline-flex items-center gap-2 px-8 h-12 rounded-xl text-sm font-semibold">
                  Xem ngay <ArrowRight size={16} />
                </button>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-sm">Từ</span>
                <span className="text-2xl font-bold text-white">22.990.000đ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0071e3] to-[#5eb5f7] px-8 lg:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">Sẵn sàng để bắt đầu?</h3>
            <p className="text-white/70 text-sm">Khám phá toàn bộ sản phẩm Apple chính hãng</p>
          </div>
          <Link href="/products">
            <button className="relative z-10 inline-flex items-center gap-2 bg-white text-[#0071e3] font-semibold px-7 h-12 rounded-xl hover:bg-white/90 active:scale-[0.97] transition-all shadow-lg">
              Mua sắm ngay <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}