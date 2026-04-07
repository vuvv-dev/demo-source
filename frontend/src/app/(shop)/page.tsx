'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Truck, CreditCard, RotateCcw } from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import ProductCard from '@/components/shop/ProductCard';
import { Product, Category } from '@/types';

const categoryEmoji: Record<string, string> = {
  'iphone': '📱',
  'ipad': '📲',
  'mac': '💻',
  'airpods': '🎧',
  'apple-watch': '⌚',
  'phu-kien': '🔌',
};

const trustItems = [
  { icon: Shield, label: 'Chính hãng 100%', sub: 'Bảo hành Apple Authorised' },
  { icon: Truck, label: 'Giao hàng nhanh', sub: 'Từ 2h trong nội thành' },
  { icon: CreditCard, label: 'Thanh toán an toàn', sub: 'COD hoặc chuyển khoản' },
  { icon: RotateCcw, label: 'Đổi trả dễ dàng', sub: 'Trong 15 ngày đầu tiên' },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsApi.list({ limit: 8, sortBy: 'popular' }),
      categoriesApi.list(),
    ]).then(([pRes, cRes]) => {
      setProducts(pRes.data.data);
      setCategories(cRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>

      {/* ─── Hero ─── */}
      <section
        className="relative overflow-hidden"
        style={{ background: '#f5f5f7' }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-16 lg:py-20">
            {/* Left */}
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <p className="text-sm font-medium mb-3" style={{ color: '#0071e3' }}>
                ✨ Sản phẩm mới nhất 2026
              </p>
              <h1
                className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
                style={{ color: '#1d1d1f', letterSpacing: '-0.02em' }}
              >
                iPhone 16 Pro Max
              </h1>
              <p className="mt-4 text-base leading-relaxed max-w-md mx-auto lg:mx-0" style={{ color: '#86868b' }}>
                Chip A18 Pro mạnh mẽ nhất từ trước đến nay. Màn hình Super Retina XDR 6.9 inch. Camera Fusion 48MP.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/products/iphone-16-pro-max">
                  <button
                    className="px-7 h-11 rounded-xl text-sm font-medium transition-all"
                    style={{ background: '#0071e3', color: '#fff' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#0077ed')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#0071e3')}
                  >
                    Mua ngay
                  </button>
                </Link>
                <Link href="/products?categorySlug=iphone">
                  <button
                    className="px-7 h-11 rounded-xl text-sm font-medium transition-all border"
                    style={{ borderColor: '#d2d2d7', color: '#0071e3', background: 'transparent' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#f5f5f7')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                  >
                    Khám phá iPhone
                  </button>
                </Link>
              </div>
              <p className="mt-5 text-2xl font-bold" style={{ color: '#1d1d1f' }}>
                Từ 39.990.000đ
              </p>
            </div>

            {/* Right - Hero image */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative mx-auto w-full max-w-md" style={{ aspectRatio: '1/1' }}>
                <Image
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700"
                  alt="iPhone 16 Pro Max"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid #f5f5f7' }}>
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustItems.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: '#f5f5f7' }}
                >
                  <Icon size={16} style={{ color: '#0071e3' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#1d1d1f' }}>{label}</p>
                  <p className="text-xs" style={{ color: '#86868b' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#1d1d1f' }}>
              Dòng sản phẩm
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#86868b' }}>
              Khám phá hệ sinh thái Apple
            </p>
          </div>
          <Link href="/products">
            <button
              className="flex items-center gap-1 text-sm font-medium transition-colors px-4 py-2 rounded-xl"
              style={{ color: '#0071e3', background: '#eff6ff' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#dbeafe')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#eff6ff')}
            >
              Xem tất cả <ArrowRight size={14} />
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/products?categorySlug=${cat.slug}`}>
              <div
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border text-center cursor-pointer"
                style={{
                  borderColor: '#f0f0f0',
                  background: '#ffffff',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#0071e3';
                  (e.currentTarget as HTMLDivElement).style.background = '#f5f5f7';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#f0f0f0';
                  (e.currentTarget as HTMLDivElement).style.background = '#ffffff';
                }}
              >
                <span className="text-3xl">{categoryEmoji[cat.slug] || '🍎'}</span>
                <p className="text-xs font-semibold" style={{ color: '#1d1d1f' }}>{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section style={{ background: '#f5f5f7' }}>
        <div className="max-w-7xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#1d1d1f' }}>
                Sản phẩm nổi bật
              </h2>
              <p className="mt-1 text-sm" style={{ color: '#86868b' }}>
                Những sản phẩm được yêu thích nhất
              </p>
            </div>
            <Link href="/products?sortBy=popular">
              <button
                className="flex items-center gap-1 text-sm font-medium transition-colors px-4 py-2 rounded-xl"
                style={{ color: '#0071e3', background: '#eff6ff' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#dbeafe')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#eff6ff')}
              >
                Xem thêm <ArrowRight size={14} />
              </button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl"
                  style={{ aspectRatio: '0.8/1' }}
                >
                  <div className="w-full h-full animate-pulse" style={{ background: '#e5e5e7', borderRadius: '1rem' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── iPhone Banner ─── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div
          className="relative overflow-hidden rounded-3xl px-10 py-14 text-center"
          style={{ background: '#1d1d1f' }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: '#86868b' }}>Công nghệ đỉnh cao</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
            iPhone 16 Series
          </h2>
          <p className="mt-3 text-base max-w-md mx-auto" style={{ color: '#86868b' }}>
            Trải nghiệm chip A18 Pro mạnh mẽ, camera Fusion 48MP và pin trâu nhất từ trước đến nay.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products?categorySlug=iphone">
              <button
                className="px-7 h-11 rounded-xl text-sm font-medium transition-all"
                style={{ background: '#0071e3', color: '#fff' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#0077ed')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#0071e3')}
              >
                Xem ngay
              </button>
            </Link>
            <p className="flex items-center justify-center text-base font-bold text-white">
              Từ 22.990.000đ
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
