'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Truck, CreditCard, RotateCcw } from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import ProductCard from '@/components/shop/ProductCard';
import { Product, Category } from '@/types';

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function SectionHeading({
  label,
  title,
  sub,
  align = 'left',
  className = '',
  children,
}: {
  label?: string;
  title: string;
  sub?: string;
  align?: 'left' | 'center';
  className?: string;
  children?: React.ReactNode;
}) {
  const { ref, visible } = useReveal(0.08);
  return (
    <div
      ref={ref}
      className={`flex items-end justify-between mb-10 gap-4 flex-wrap ${align === 'center' ? 'flex-col items-center text-center' : ''} ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div>
        {label && <p className="text-[11px] font-semibold text-[#86868b] mb-1.5 uppercase tracking-widest">{label}</p>}
        <h2 className="text-3xl lg:text-4xl xl:text-[42px] font-semibold tracking-tight text-[#1d1d1f] leading-[1.1]">{title}</h2>
        {sub && <p className="mt-1.5 text-sm lg:text-base text-[#86868b]">{sub}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

function EcosystemBlock({
  label,
  title,
  description,
  image,
  imageAlt,
  reverse,
  delay = 0,
}: {
  label: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
  delay?: number;
}) {
  const { ref, visible } = useReveal(0.12);
  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease, transform 0.7s ease`,
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className={`flex flex-col lg:items-start text-left ${reverse ? 'lg:order-2' : 'lg:order-1'}`}>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#86868b] mb-3">{label}</p>
        <h3 className="text-2xl lg:text-[28px] font-semibold text-[#1d1d1f] tracking-tight mb-4 leading-tight">{title}</h3>
        <p className="text-sm lg:text-[15px] leading-relaxed text-[#86868b] max-w-md">{description}</p>
      </div>
      <div
        className={`relative w-full ${reverse ? 'lg:order-1' : 'lg:order-2'}`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s',
          transitionDelay: `${delay}ms`,
        }}
      >
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
          <Image src={image} alt={imageAlt} fill className="object-cover" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const featuredScrollRef = useRef<HTMLDivElement>(null);

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
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="pt-10 lg:pt-16 pb-10">
        <div className="max-w-[1300px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-14 animate-fade-in">
            <h1 className="text-6xl lg:text-[72px] font-semibold text-[#1d1d1f] tracking-tight leading-none">
              Cửa Hàng
            </h1>
            <div className="flex flex-col shrink-0 lg:text-right lg:pb-3">
              <p className="text-[15px] lg:text-base text-[#1d1d1f] font-medium leading-relaxed">
                Cách tốt nhất để mua sản phẩm bạn thích.
              </p>
              <div className="flex items-center lg:justify-end gap-3 mt-2">
                <Link href="#" className="text-[#0066cc] hover:underline text-[13px] lg:text-sm font-medium inline-flex items-center gap-1">
                  Kết Nối Với Chuyên Gia
                  <ArrowRight size={14} />
                </Link>
                <div className="flex -space-x-2">
                  {[10, 11, 12].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-gray-100 ring-2 ring-gray-50">
                      <Image src={`https://i.pravatar.cc/100?img=${i}`} alt="Expert" width={36} height={36} />
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Category nav */}
          <div className="mb-16 overflow-x-auto no-scrollbar -mx-6 px-6">
            <div className="flex items-start gap-10 md:gap-14 min-w-max pb-4">
              {[
                { name: 'Mac', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-mac-nav-202603?wid=400&hei=260&fmt=png-alpha&.v=M1Q3OGxnb1lBaHhqNjZ2OVRXZmx4V2duSGVkdTVncGZYc0RnS1paU3IySCsrUlZaSVRoWVYzU0Qra0FoTmUwNng2bitObzZwQzk4cEorV1dZdzhIazAreDNWYWNLK1lESGRXY25VRzdWVTQ', slug: 'mac' },
                { name: 'iPhone', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-iphone-nav-202509?wid=400&hei=260&fmt=png-alpha&.v=dW5XbHI1eDVpd01qWUU4bFRtWGZXM1doT212VzJoWjBSKzRpbmNETHN1QjVoZlhhY1p4QWdsTjFNaGRHM3FYWW15d1FhSDJ0bkR0ZGZtUjZJNmFveGVEVGM2Z3VEVWcvT3Z6KzhkR29Ddmc', slug: 'iphone' },
                { name: 'iPad', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-ipad-nav-202405?wid=400&hei=260&fmt=png-alpha&.v=dW5XbHI1eDVpd01qWUU4bFRtWGZXNGFLQTJVNnlNQmQrVmRBYnZYei9jckUzelNmMnRxajE0NHhmMWtLazl6eG53M0FRZHBXNTh1U1lFVEtSR2YzTm5qbE56RWRpRFNIRXZvbkd2S0l5dTg', slug: 'ipad' },
                { name: 'Apple Watch', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-watch-nav-202509_GEO_VN?wid=400&hei=260&fmt=png-alpha&.v=S0tSVzBtSkRkSFFhMm1zS1NmeWtkK0gvNGFhODF5SWpidW9tVnFmL2Irb1R1VkJuQ29uUmRMelVabnRBV0VHSGM5THdmR1U4Nmp4b2NFbEg2N21UQzYzZVFZZGtHNUI4c1NvME1xTTYxSzRMSUNabG1aSTZUOVg1S2E0WTkzNG0', slug: 'apple-watch' },
                { name: 'AirPods', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-airpods-nav-202509?wid=400&hei=260&fmt=png-alpha&.v=Q0Z1bWFqMUpRRnp3T0Y0VWJpdk1yMDhFUStvWHB3SDlDa3VrdUZORWRqeld1aTN5QlRYNG5PRjJxc2d1RklXbVM0TjRWdzF2UjRGVEY0c3dBQVZ6VGZUMjJQZFhhT2thWmkxZjhra3FyZEk', slug: 'airpods' },
                { name: 'AirTag', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-airtags-nav-202601?wid=400&hei=260&fmt=png-alpha&.v=Q0Z1bWFqMUpRRnp3T0Y0VWJpdk1yL1FqZ2pobDV2bDUyWU1XVmNnMmx3VFd1aTN5QlRYNG5PRjJxc2d1RklXbVM0TjRWdzF2UjRGVEY0c3dBQVZ6VFg3OVE4VE5ic3VkUXEzS3pERTg2am8', slug: 'airtag' },
                { name: 'Apple TV 4K', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-appletv-nav-202210?wid=400&hei=260&fmt=png-alpha&.v=T0wvM1N3YUcxQ09qK0VNRkl1RU1BZFM5WnN0RmVZRmVXQ0FCUWJjbnJDald1aTN5QlRYNG5PRjJxc2d1RklXbVM0TjRWdzF2UjRGVEY0c3dBQVZ6VFZ3YmJrVi9SakQxWUcrYWQwVXc5VTA', slug: '#' },
                { name: 'Phụ Kiện', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-accessories-nav-202603?wid=400&hei=260&fmt=png-alpha&.v=QnhsNk96S0o4R1dkN2FveStNM1hwNzZGMHVrNGw2NTM5Vmk2bHZzMXQ3aUlac2ROMkdFNG0rMXdMQ0t2WTVlSFBrcjVFNVdueFRVbVY3TGtiL2RjUWVXQ0tWTWFGNXA2NmlzMmRVQ1l6WmlFMHVWQmxPTEFhTVNvVStGSjlxajM', slug: 'phu-kien' },
              ].map((cat, i) => (
                <Link
                  key={i}
                  href={cat.slug !== '#' ? `/products?categorySlug=${cat.slug}` : '#'}
                  className="flex flex-col items-center group animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="relative w-20 h-20 mb-3 transition-all duration-300 group-hover:scale-110 rounded-full bg-[#F5F4F7] border border-gray-100/50 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md">
                    <div className="relative w-[70%] h-[70%]">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-110"
                        sizes="80px"
                      />
                    </div>
                  </div>
                  <span className="text-[12px] font-medium text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors whitespace-nowrap">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured cards */}
          <div className="animate-fade-in-up">
            <h2 className="text-2xl lg:text-[28px] font-semibold text-[#1d1d1f] mb-7 overflow-hidden">
              Thế hệ mới nhất. <span className="text-[#86868b]">Xem ngay có gì mới.</span>
            </h2>

            <div className="relative">
              <div id="featured-scroll" className="overflow-x-auto no-scrollbar scroll-smooth" ref={featuredScrollRef}>
                <div className="flex gap-6 min-w-max pb-4 pr-6">
                  {/* iPhone 17 Pro */}
                  <div className="relative w-[320px] md:w-[400px] h-[480px] md:h-[500px] rounded-[28px] overflow-hidden bg-black text-white group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
                    <Image
                      src="https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-iphone-17-pro-202509?wid=800&hei=1000"
                      alt="iPhone 17 Pro"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-10" />
                    <div className="relative z-20 flex flex-col h-full p-9">
                      <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-2">Mới</p>
                      <h3 className="text-2xl md:text-3xl font-semibold mb-2 leading-tight">iPhone 17 Pro</h3>
                      <p className="text-sm md:text-base font-medium text-white/80 line-clamp-2">Pro đỉnh cao. Chip A19 siêu mạnh mẽ, camera tiên tiến.</p>
                      <p className="mt-auto text-sm md:text-base font-semibold">Từ 34.490.000đ</p>
                    </div>
                  </div>

                  {/* MacBook Neo */}
                  <div className="relative w-[320px] md:w-[400px] h-[480px] md:h-[500px] rounded-[28px] overflow-hidden bg-[#f5f5f7] text-[#1d1d1f] group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                    <Image
                      src="https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-macbook-neo-202603?wid=800&hei=1000"
                      alt="MacBook Neo"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-white/5 z-10" />
                    <div className="relative z-20 flex flex-col h-full p-9">
                      <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest mb-2">Mới</p>
                      <h3 className="text-2xl md:text-3xl font-semibold mb-2 leading-tight">MacBook Neo</h3>
                      <p className="text-sm md:text-base font-medium text-[#86868b] line-clamp-2">Điều tuyệt vời của Mac ở mức giá bất ngờ. Siêu mỏng nhẹ.</p>
                      <p className="mt-auto text-sm md:text-base font-semibold">Từ 16.490.000đ</p>
                    </div>
                  </div>

                  {/* iPhone 17e */}
                  <div className="relative w-[320px] md:w-[320px] h-[480px] md:h-[500px] rounded-[28px] overflow-hidden bg-white text-[#1d1d1f] group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                    <Image
                      src="https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-iphone-17e-202603?wid=800&hei=1000"
                      alt="iPhone 17e"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-white/10 z-10" />
                    <div className="relative z-20 flex flex-col h-full p-8">
                      <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest mb-2">Mới</p>
                      <h3 className="text-2xl font-semibold mb-2 leading-tight">iPhone 17e</h3>
                      <p className="text-sm font-medium text-[#86868b]">Đủ tính năng. Đáng giá trị. Sắc màu rực rỡ.</p>
                      <p className="mt-auto text-sm font-semibold">Từ 17.990.000đ</p>
                    </div>
                  </div>

                  {/* AirPods Max 2 */}
                  <div className="relative w-[320px] md:w-[320px] h-[480px] md:h-[500px] rounded-[28px] overflow-hidden bg-white text-[#1d1d1f] group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                    <Image
                      src="https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-airpods-max-202409?wid=800&hei=1000"
                      alt="AirPods Max"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/5 z-10" />
                    <div className="relative z-20 flex flex-col h-full p-8">
                      <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest mb-2">Mới</p>
                      <h3 className="text-2xl font-semibold mb-2 leading-tight">AirPods Max 2</h3>
                      <p className="text-sm font-medium text-[#86868b]">Các tính năng thông minh mới. Trải nghiệm nghe sống động.</p>
                      <p className="mt-auto text-sm font-semibold">Từ 14.990.000đ</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => featuredScrollRef.current?.scrollBy({ left: -440, behavior: 'smooth' })}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all z-10 -ml-3 hidden md:flex"
              >
                <ArrowRight className="rotate-180" size={16} />
              </button>
              <button
                onClick={() => featuredScrollRef.current?.scrollBy({ left: 440, behavior: 'smooth' })}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all z-10 -mr-3 hidden md:flex"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 py-14 lg:py-20 space-y-20">
          <SectionHeading
            label="Hệ sinh thái"
            title="Mua sắm ngay"
            sub="Tất cả thiết bị Apple kết nối với nhau một cách liền mạch."
          />
          <EcosystemBlock
            label="iPhone và Mac"
            title="iPhone và Mac. Kết nối không giới hạn."
            description="Với tính năng Phản chiếu iPhone, bạn có thể xem và điều khiển màn hình iPhone trên máy Mac mà không cần phải chạm tay vào điện thoại. Các tính năng Handoff cũng giúp bạn trả lời cuộc gọi hoặc tin nhắn từ iPhone ngay trên máy Mac."
            image="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=90"
            imageAlt="iPhone và MacBook"
            delay={0}
          />
          <EcosystemBlock
            label="iPhone và Apple Watch"
            title="iPhone và Apple Watch. Luôn đồng hành."
            description="Để quên iPhone của bạn ở đâu đó? Các phiên bản Apple Watch mới nhất có thể hiển thị cho bạn biết phương hướng và khoảng cách gần đúng của điện thoại. Để chụp ảnh nhóm trên iPhone, hãy đứng vào khung hình cùng mọi người và dùng Apple Watch làm kính nhắm để chụp ảnh."
            image="https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=1200&q=90"
            imageAlt="iPhone và Apple Watch"
            reverse
            delay={80}
          />
        </div>
      </section>

      {/* San pham noi bat */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-14 lg:py-20">
          <SectionHeading
            label="Bán chạy nhất"
            title="Sản phẩm nổi bật"
            sub="Những lựa chọn được yêu thích nhất"
          >
            <Link href="/products?sortBy=popular">
              <button className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0071e3] hover:gap-2.5 transition-all px-4 py-2 rounded-xl bg-[#eff6ff] hover:bg-[#dbeafe]">
                Xem thêm <ArrowRight size={14} />
              </button>
            </Link>
          </SectionHeading>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden skeleton h-64" />
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

      {/* Unified Final Section: Slimmer & Dynamic */}
      <section className="bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <div className="relative overflow-hidden rounded-[40px] border border-gray-100 shadow-2xl transition-all duration-700 hover:shadow-blue-500/10 group">
            {/* Background Layer: White to Blue Transition */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-[#0071e3]/10 z-0" />

            {/* Ambient Animation */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0071e3]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />

            <div className="relative z-10 flex flex-col">
              {/* Part 1: iPhone 16 (White Background Vibe) */}
              <div className="px-8 lg:px-16 py-12 lg:py-16 text-center animate-fade-in-up">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#86868b] mb-4">Mới nhất</p>
                <h2 className="text-4xl lg:text-6xl font-semibold text-[#1d1d1f] tracking-tight mb-4 leading-none">
                  iPhone 17 Series
                </h2>
                <p className="text-sm lg:text-lg max-w-xl mx-auto text-[#86868b] mb-8 leading-relaxed font-medium">
                  Chip A18 Pro mạnh mẽ. Camera Fusion 48MP.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/products?categorySlug=iphone">
                    <button className="h-12 px-8 rounded-full bg-[#0071e3] text-white font-bold text-sm hover:bg-[#0077ed] active:scale-95 transition-all shadow-lg shadow-blue-500/20">
                      Xem ngay
                    </button>
                  </Link>
                  <span className="text-[#1d1d1f] font-semibold">Từ 22.990.000đ</span>
                </div>
              </div>

              {/* Seamless Transition to Blue Part */}
              <div className="relative px-8 lg:px-16 py-10 lg:py-12 bg-gradient-to-br from-[#0071e3] to-[#005bb5] text-white overflow-hidden">
                {/* Movement Animation */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-2">Sẵn sàng để bắt đầu?</h3>
                    <p className="text-white/70 text-sm font-medium">Trải nghiệm hệ sinh thái Apple chính hãng.</p>
                  </div>
                  <Link href="/products">
                    <button className="relative overflow-hidden inline-flex items-center gap-2 bg-white text-[#0071e3] font-bold px-8 h-12 rounded-full hover:bg-white/90 active:scale-[0.97] transition-all shadow-xl group/btn">
                      <span className="relative z-10">Mua sắm ngay</span>
                      <ArrowRight size={16} className="relative z-10 transition-transform group-hover/btn:translate-x-1" />
                      {/* Shine Effect Animation */}
                      <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] group-hover/btn:animate-shine" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
