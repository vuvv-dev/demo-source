'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, LogOut, LayoutDashboard, Menu, X, ChevronDown, Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

// ─── Navigation data ─────────────────────────────────────────────────────────
interface FeaturedProduct {
  name: string;
  image: string;
  price: number | string;
  slug: string;
}

interface NavItem {
  slug: string;
  label: string;
  href: string;
  featured: FeaturedProduct;
  subLinks: { label: string; href: string }[];
}

const navData: NavItem[] = [
  {
    slug: 'iphone',
    label: 'iPhone',
    href: '/products?categorySlug=iphone',
    featured: { name: 'iPhone', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-iphone-nav-202509?wid=400&hei=260&fmt=png-alpha', price: 'Từ 17.990.000đ', slug: '?categorySlug=iphone&sortBy=popular&order=desc' },
    subLinks: [
      { label: 'iPhone 16 Pro', href: '/products/iphone-16-pro' },
      { label: 'iPhone 16', href: '/products/iphone-16' },
      { label: 'iPhone 15', href: '/products/iphone-15' },
      { label: 'So sánh iPhone', href: '/products?categorySlug=iphone' },
    ],
  },
  {
    slug: 'ipad',
    label: 'iPad',
    href: '/products?categorySlug=ipad',
    featured: { name: 'iPad', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-ipad-nav-202405?wid=400&hei=260&fmt=png-alpha', price: 'Từ 7.990.000đ', slug: '?categorySlug=ipad&sortBy=popular&order=desc' },
    subLinks: [
      { label: 'iPad Pro', href: '/products/ipad-pro' },
      { label: 'iPad Air', href: '/products/ipad-air' },
      { label: 'iPad mini', href: '/products/ipad-mini' },
      { label: 'So sánh iPad', href: '/products?categorySlug=ipad' },
    ],
  },
  {
    slug: 'mac',
    label: 'Mac',
    href: '/products?categorySlug=mac',
    featured: { name: 'Mac', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-mac-nav-202603?wid=400&hei=260&fmt=png-alpha', price: 'Từ 16.490.000đ', slug: '?categorySlug=mac&sortBy=popular&order=desc' },
    subLinks: [
      { label: 'MacBook Pro', href: '/products/macbook-pro' },
      { label: 'MacBook Air', href: '/products/macbook-air' },
      { label: 'iMac', href: '/products/imac' },
      { label: 'So sánh Mac', href: '/products?categorySlug=mac' },
    ],
  },
  {
    slug: 'airpods',
    label: 'AirPods',
    href: '/products?categorySlug=airpods',
    featured: { name: 'AirPods', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-airpods-nav-202509?wid=400&hei=260&fmt=png-alpha', price: 'Từ 3.490.000đ', slug: '?categorySlug=airpods&sortBy=popular&order=desc' },
    subLinks: [
      { label: 'AirPods Pro 2', href: '/products/airpods-pro-2' },
      { label: 'AirPods 3', href: '/products/airpods-3' },
      { label: 'AirPods Max', href: '/products/airpods-max' },
      { label: 'So sánh AirPods', href: '/products?categorySlug=airpods' },
    ],
  },
  {
    slug: 'apple-watch',
    label: 'Watch',
    href: '/products?categorySlug=apple-watch',
    featured: { name: 'Apple Watch', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-watch-nav-202509_GEO_VN?wid=400&hei=260&fmt=png-alpha', price: 'Từ 5.990.000đ', slug: '?categorySlug=apple-watch&sortBy=popular&order=desc' },
    subLinks: [
      { label: 'Ultra 2', href: '/products/apple-watch-ultra-2' },
      { label: 'Series 10', href: '/products/apple-watch-series-10' },
      { label: 'SE', href: '/products/apple-watch-se' },
      { label: 'So sánh Watch', href: '/products?categorySlug=apple-watch' },
    ],
  },
  {
    slug: 'phu-kien',
    label: 'Phụ kiện',
    href: '/products?categorySlug=phu-kien',
    featured: { name: 'Phụ kiện', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-accessories-nav-202603?wid=400&hei=260&fmt=png-alpha', price: 'Xem ngay', slug: '?categorySlug=phu-kien&sortBy=popular&order=desc' },
    subLinks: [
      { label: 'Sạc & Cáp', href: '/products?categorySlug=phu-kien' },
      { label: 'Ốp lưng', href: '/products?categorySlug=phu-kien' },
      { label: 'Tai nghe', href: '/products?categorySlug=phu-kien' },
      { label: 'Xem tất cả phụ kiện', href: '/products?categorySlug=phu-kien' },
    ],
  },
];

// ─── MegaDropdown component ────────────────────────────────────────────────────
function MegaDropdown({ item }: { item: NavItem }) {
  const price = typeof item.featured.price === 'number'
    ? formatPrice(item.featured.price)
    : item.featured.price;

  return (
    <div className="mega-dropdown absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[700px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] border border-gray-100/80 overflow-hidden z-50">
      <div className="grid grid-cols-[1fr_220px] divide-x divide-gray-50">
        {/* Sub-links */}
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] mb-3 px-1">
            {item.label}
          </p>
          <div className="space-y-0.5">
            {item.subLinks.map((sub) => (
              <Link
                key={sub.href}
                href={sub.href}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors group"
              >
                <span className="group-hover:text-[#0071e3] transition-colors">{sub.label}</span>
                <ArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 text-[#0071e3] transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* Featured product */}
        <Link href={`/products/${item.featured.slug}`} className="group p-5 flex flex-col items-center justify-center bg-[#F5F4F7] hover:bg-[#ebeaf0] transition-colors">
          <div className="relative w-36 h-36 mb-3">
            <Image
              src={item.featured.image}
              alt={item.featured.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <p className="text-xs font-semibold text-[#1d1d1f] text-center mb-1 group-hover:text-[#0071e3] transition-colors leading-tight">
            {item.featured.name}
          </p>
          <p className="text-xs text-[#86868b]">{price}</p>
          <span className="mt-2 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#0071e3] text-white">
            Mua ngay
          </span>
        </Link>
      </div>
    </div>
  );
}

// ─── ArrowRight inline ────────────────────────────────────────────────────────
function ArrowRight({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ─── Apple logo icon ──────────────────────────────────────────────────────────
function AppleLogo({ className = '' }: { className?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.88 1.22-2.08 1.09-3.33-1.02.03-2.27.7-3.02 1.68-.6.8-1.12 2.1-1.08 3.34.95.04 2.16-.62 2.98-1.69z" />
    </svg>
  );
}

// ─── Search icon ──────────────────────────────────────────────────────────────
function SearchIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, isAdmin, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { init } = useWishlistStore();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const leaveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close search on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Live search with debounce
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    debounceRef.current = setTimeout(() => {
      productsApi.list({ search: value.trim(), limit: 6, sortBy: 'popular' })
        .then(r => setSearchResults(r.data.data))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
  }, []);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchFocused(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      closeSearch();
    }
  };

  const handleNavEnter = (slug: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActiveDropdown(slug);
  };

  const handleNavLeave = () => {
    leaveTimer.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  const handleDropdownEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  };

  const iconBtn = 'w-9 h-9 flex items-center justify-center rounded-xl text-[#1d1d1f] hover:bg-gray-100 transition-all duration-200 relative cursor-pointer';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 header-search-transition ${scrolled
          ? 'glass bg-white/90 border-b border-black/5 shadow-[0_1px_0_rgba(0,0,0,0.04)]'
          : 'bg-white border-b border-gray-100/80'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className={`flex items-center transition-all duration-300 ${searchOpen ? 'h-[56px]' : 'h-14'}`}>

            {/* Logo */}
            <Link href="/" className="flex items-center justify-center mr-6 shrink-0 text-[#1d1d1f] hover:opacity-70 transition-opacity duration-200">
              <AppleLogo />
            </Link>

            {/* Desktop Nav */}
            <nav ref={navRef} className={`hidden lg:flex items-center flex-1 gap-0.5 ${searchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-200`}>
              {navData.map((item) => {
                const isActive = pathname.includes(item.href.split('?')[0]);
                const isHovered = activeDropdown === item.slug;
                return (
                  <div
                    key={item.slug}
                    className="relative"
                    onMouseEnter={() => handleNavEnter(item.slug)}
                    onMouseLeave={handleNavLeave}
                  >
                    <Link
                      href={item.href}
                      className={`nav-item-link flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive || isHovered
                        ? 'text-[#1d1d1f]'
                        : 'text-[#1d1d1f]/70 hover:text-[#1d1d1f]'
                        }`}
                    >
                      {item.label}
                      <ChevronDown
                        size={12}
                        className={`text-[#86868b] transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`}
                      />
                    </Link>

                    {/* Mega dropdown */}
                    {isHovered && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 pt-0.5"
                        onMouseEnter={handleDropdownEnter}
                        onMouseLeave={handleNavLeave}
                      >
                        <MegaDropdown item={item} />
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-1 ml-auto">

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className={iconBtn}
                title="Tìm kiếm"
                aria-label="Mở tìm kiếm"
              >
                <SearchIcon />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className={`${iconBtn} ${searchOpen ? 'hidden' : ''}`} title="Yêu thích">
                <Heart size={17} />
              </Link>

              {/* Cart */}
              <Link href="/cart" className={`${iconBtn} ${searchOpen ? 'hidden' : ''}`} title="Giỏ hàng">
                <ShoppingCart size={17} />
                {itemCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#ff3b30] text-white text-[10px] font-bold flex items-center justify-center px-1 animate-scale-in shadow-sm">
                    {itemCount() > 99 ? '99+' : itemCount()}
                  </span>
                )}
              </Link>

              {/* User */}
              {user ? (
                <div className="relative ml-1" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200 ${userMenuOpen ? 'bg-[#eff6ff]' : 'hover:bg-gray-100'
                      }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0071e3] to-[#5eb5f7] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                      {user.name[0]?.toUpperCase()}
                    </div>
                    <span className="hidden xl:block text-sm font-medium text-[#1d1d1f] max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown size={14} className={`hidden xl:block text-[#86868b] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden animate-scale-in z-50">
                      <div className="p-4 border-b border-gray-50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071e3] to-[#5eb5f7] flex items-center justify-center text-white text-sm font-bold mb-2">
                          {user.name[0]?.toUpperCase()}
                        </div>
                        <p className="text-sm font-semibold text-[#1d1d1f]">{user.name}</p>
                        <p className="text-xs text-[#86868b] mt-0.5">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-semibold">
                            Quản trị viên
                          </span>
                        )}
                      </div>
                      <div className="p-2 space-y-0.5">
                        <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#1d1d1f] hover:bg-gray-50 transition-colors">
                          <User size={16} className="text-[#86868b]" /> Tài khoản
                        </Link>
                        <Link href="/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#1d1d1f] hover:bg-gray-50 transition-colors">
                          <ShoppingCart size={16} className="text-[#86868b]" /> Đơn hàng
                        </Link>
                        <Link href="/wishlist" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#1d1d1f] hover:bg-gray-50 transition-colors">
                          <Heart size={16} className="text-[#86868b]" /> Yêu thích
                        </Link>
                        {isAdmin && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#0071e3] hover:bg-[#eff6ff] transition-colors">
                            <LayoutDashboard size={16} /> Quản lý cửa hàng
                          </Link>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <button onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#ff3b30] hover:bg-red-50 transition-colors">
                          <LogOut size={16} /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login"
                  className={`ml-2 px-4 h-9 flex items-center justify-center rounded-xl text-sm font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all duration-200 active:scale-[0.97] shadow-[0_2px_8px_rgba(0,113,227,0.3)] ${searchOpen ? 'hidden' : ''}`}>
                  Đăng nhập
                </Link>
              )}

              {/* Mobile toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-[#1d1d1f] hover:bg-gray-100 transition-all ${searchOpen ? 'hidden' : ''}`}>
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Full-screen Search Modal ── */}
      {searchOpen && (
        <>
          {/* Backdrop — click to close */}
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={closeSearch}
          />

          {/* Search panel */}
          <div className="fixed top-0 left-0 right-0 z-[61] bg-white rounded-b-3xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] animate-slide-down">
            <div className="max-w-2xl mx-auto px-4 pt-6 pb-6">
              {/* Search input row */}
              <div className={`pl-4 flex items-center gap-3 rounded-2xl border transition-all duration-200 ${searchFocused ? 'border-[#0071e3] ring-2 ring-[#0071e3]/20' : 'border-gray-200'
                }`}>
                <SearchIcon size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="flex-1 h-14 pl-1 pr-3 text-base bg-transparent outline-none focus:outline-none placeholder:text-gray-400 text-[#1d1d1f]"
                />
                <button
                  onClick={closeSearch}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-[#86868b] hover:bg-gray-100 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick links */}
              {!searchQuery && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {['iPhone 16', 'MacBook Pro', 'AirPods Pro', 'Apple Watch', 'iPad'].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setSearchQuery(q); handleSearchChange(q); }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#f5f5f7] text-[#1d1d1f] hover:bg-gray-200 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Results */}
              {searchQuery && (
                <div className="mt-4">
                  {searchLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full bg-[#0071e3] animate-bounce-dot" />
                        ))}
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        {searchResults.map((p) => (
                          <Link
                            key={p.id}
                            href={`/products/${p.slug}`}
                            onClick={closeSearch}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f5f5f7] transition-colors group"
                          >
                            {p.images?.[0] ? (
                              <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-[#f5f5f7]">
                                <Image src={p.images[0]} alt={p.name} fill className="object-contain" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 shrink-0 rounded-lg bg-[#f5f5f7] flex items-center justify-center">
                                <SearchIcon size={16} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#1d1d1f] line-clamp-2 leading-tight group-hover:text-[#0071e3] transition-colors">
                                {p.name}
                              </p>
                              <p className="text-[11px] text-[#86868b] mt-0.5">
                                {formatPrice(p.price)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href={`/products?search=${encodeURIComponent(searchQuery)}`}
                        onClick={closeSearch}
                        className="flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl bg-[#0071e3]/8 text-[#0071e3] text-sm font-medium hover:bg-[#0071e3]/15 transition-colors"
                      >
                        Xem tất cả kết quả cho "{searchQuery}"
                        <ArrowRight size={14} />
                      </Link>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-[#86868b]">Không tìm thấy sản phẩm nào</p>
                      <p className="text-xs text-[#86868b]/60 mt-1">Thử tìm kiếm với từ khóa khác</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 lg:hidden pt-14 bg-white transition-all duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="animate-slide-up">
          <div className="p-4 space-y-1">
            {/* Mobile search */}
            <form onSubmit={(e) => { e.preventDefault(); if (mobileSearchQuery.trim()) { router.push(`/products?search=${encodeURIComponent(mobileSearchQuery.trim())}`); setMobileOpen(false); setMobileSearchQuery(''); } }} className="flex items-center gap-2 mb-3 px-2">
              <div className="relative flex-1 flex items-center rounded-xl border border-gray-200 bg-[#f5f5f7]">
                <SearchIcon size={14} />
                <input
                  type="text"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="flex-1 h-10 pl-2 pr-3 text-sm bg-transparent outline-none placeholder:text-gray-400 text-[#1d1d1f]"
                />
              </div>
            </form>

            <Link href="/products" onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-base font-medium rounded-xl text-[#1d1d1f] hover:bg-gray-100 transition-colors">
              Tất cả sản phẩm
            </Link>
            {navData.map((item) => (
              <Link key={item.slug} href={item.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-base font-medium rounded-xl text-[#1d1d1f] hover:bg-gray-100 transition-colors">
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-base font-medium rounded-xl text-[#1d1d1f] hover:bg-gray-100 transition-colors">
                  Tài khoản
                </Link>
                <Link href="/orders" onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-base font-medium rounded-xl text-[#1d1d1f] hover:bg-gray-100 transition-colors">
                  Đơn hàng
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full text-left block px-4 py-3 text-base font-medium rounded-xl text-[#ff3b30] hover:bg-red-50 transition-colors mt-1">
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-base font-medium rounded-xl text-[#0071e3] bg-[#eff6ff] hover:bg-[#dbeafe] transition-colors mt-2 text-center">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-14" />
    </>
  );
}
