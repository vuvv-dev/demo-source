'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Tag, Users, LogOut, Store, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const adminLinks = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Sản phẩm', href: '/admin/products', icon: Package },
  { label: 'Đơn hàng', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Danh mục', href: '/admin/categories', icon: Tag },
  { label: 'Khách hàng', href: '/admin/customers', icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-60 min-h-screen bg-[#1d1d1f] text-white flex flex-col fixed left-0 top-0 bottom-0 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 rounded-xl bg-[#0071e3] flex items-center justify-center text-white font-bold text-base shrink-0">
            A
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight">AppleStore</p>
            <p className="text-[10px] text-white/40 mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {adminLinks.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all duration-200 ${
                active
                  ? 'bg-[#0071e3] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
            >
              <Icon size={17} className={active ? 'text-white' : 'text-white/50'} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/"
            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-white/60 bg-white/8 hover:bg-white/16 text-center no-underline transition-all"
          >
            <Store size={13} className="inline mr-1" /> Cửa hàng
          </Link>
          <button
            onClick={logout}
            className="px-3 py-2 rounded-lg bg-white/8 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all flex items-center justify-center"
            title="Đăng xuất"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}