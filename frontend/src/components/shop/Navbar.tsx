'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Search, User, LogOut, LayoutDashboard, Menu, X, ChevronDown, Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

const navLinks = [
  { label: 'iPhone', href: '/products?categorySlug=iphone' },
  { label: 'iPad', href: '/products?categorySlug=ipad' },
  { label: 'Mac', href: '/products?categorySlug=mac' },
  { label: 'AirPods', href: '/products?categorySlug=airpods' },
  { label: 'Watch', href: '/products?categorySlug=apple-watch' },
  { label: 'Phụ kiện', href: '/products?categorySlug=phu-kien' },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { init } = useWishlistStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    init();
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const iconBtn = 'w-9 h-9 flex items-center justify-center rounded-xl text-[#1d1d1f] hover:bg-gray-100 transition-all duration-200 relative';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass bg-white/90 border-b border-black/5 shadow-[0_1px_0_rgba(0,0,0,0.04)]'
            : 'bg-white border-b border-gray-100/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mr-8 shrink-0 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1d1d1f] to-[#3d3d3d] flex items-center justify-center text-white text-sm font-bold shadow-sm transition-transform group-hover:scale-105">
                A
              </div>
              <span className="font-bold text-base text-[#1d1d1f] tracking-tight hidden sm:block">AppleStore</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1">
              {navLinks.map((link) => {
                const isActive = pathname.includes(link.href.split('?')[0]);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link text-sm ${isActive ? 'active' : ''}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 ml-auto">

              {/* Wishlist */}
              <Link href="/wishlist" className={iconBtn} title="Yêu thích">
                <Heart size={17} />
              </Link>

              {/* Search */}
              <Link href="/products" className={iconBtn} title="Tìm kiếm">
                <Search size={17} />
              </Link>

              {/* Cart */}
              <Link href="/cart" className={iconBtn} title="Giỏ hàng">
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
                    className={`flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200 ${
                      userMenuOpen ? 'bg-[#eff6ff]' : 'hover:bg-gray-100'
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
                  className="ml-2 px-4 h-9 flex items-center justify-center rounded-xl text-sm font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all duration-200 active:scale-[0.97] shadow-[0_2px_8px_rgba(0,113,227,0.3)]">
                  Đăng nhập
                </Link>
              )}

              {/* Mobile toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-[#1d1d1f] hover:bg-gray-100 transition-all ml-1">
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 lg:hidden pt-14 bg-white transition-all duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="animate-slide-up">
          <div className="p-4 space-y-1">
            <Link href="/products" onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-base font-medium rounded-xl text-[#1d1d1f] hover:bg-gray-100 transition-colors">
              Tất cả sản phẩm
            </Link>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-base font-medium rounded-xl text-[#1d1d1f] hover:bg-gray-100 transition-colors">
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <button onClick={() => { logout(); setMobileOpen(false); }}
                className="w-full text-left block px-4 py-3 text-base font-medium rounded-xl text-[#ff3b30] hover:bg-red-50 transition-colors mt-1">
                Đăng xuất
              </button>
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