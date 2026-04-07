'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, User, LogOut, LayoutDashboard, Menu, X, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
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

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.92)' : '#ffffff',
          backdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none',
          borderBottom: '1px solid ' + (scrolled ? '#f0f0f0' : '#f5f5f7'),
          boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.04)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mr-8 shrink-0">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: '#1d1d1f' }}
              >
                A
              </div>
              <span className="font-semibold text-base" style={{ color: '#1d1d1f', letterSpacing: '-0.01em' }}>
                AppleStore
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                  style={{
                    color: '#1d1d1f',
                    fontWeight: 500,
                    opacity: 0.8,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Search */}
              <Link
                href="/products"
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: '#1d1d1f' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f7')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Search size={17} />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors relative"
                style={{ color: '#1d1d1f' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f7')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <ShoppingCart size={17} />
                {itemCount() > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1"
                    style={{ background: '#ff3b30' }}
                  >
                    {itemCount() > 99 ? '99+' : itemCount()}
                  </span>
                )}
              </Link>

              {/* User */}
              {user ? (
                <div className="relative ml-1" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors"
                    style={{ color: '#1d1d1f' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f7')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                      style={{ background: '#0071e3' }}
                    >
                      {user.name[0]?.toUpperCase()}
                    </div>
                    <span className="hidden xl:block text-sm font-medium max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown size={14} className="hidden xl:block" />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border"
                      style={{
                        borderColor: '#f0f0f0',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                      }}
                    >
                      <div className="p-3 border-b" style={{ borderColor: '#f5f5f7' }}>
                        <p className="text-sm font-medium" style={{ color: '#1d1d1f' }}>{user.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#86868b' }}>{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors"
                          style={{ color: '#1d1d1f' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f7')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <User size={16} /> Tài khoản
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors"
                          style={{ color: '#1d1d1f' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f7')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          Đơn hàng
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                            style={{ color: '#0071e3' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#eff6ff')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <LayoutDashboard size={16} /> Quản lý cửa hàng
                          </Link>
                        )}
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors mt-1"
                          style={{ color: '#ff3b30' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <LogOut size={16} /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="ml-1 px-4 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all"
                  style={{ background: '#0071e3', color: '#fff' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#0077ed')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#0071e3')}
                >
                  Đăng nhập
                </Link>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg ml-1"
                style={{ color: '#1d1d1f' }}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden pt-14"
          style={{ background: '#ffffff' }}
        >
          <div className="p-4 space-y-1">
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-base font-medium rounded-xl"
              style={{ color: '#1d1d1f' }}
            >
              Tất cả sản phẩm
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-base font-medium rounded-xl"
                style={{ color: '#1d1d1f' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-14" />
    </>
  );
}
