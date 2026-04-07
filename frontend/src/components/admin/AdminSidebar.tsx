'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Tag, Users, LogOut, ChevronRight } from 'lucide-react';
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
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        background: '#1d1d1f',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '2.5rem', height: '2.5rem', borderRadius: '10px',
              background: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>A</span>
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>AppleStore</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {adminLinks.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem', borderRadius: '10px',
                fontSize: '0.875rem', fontWeight: 500,
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                background: active ? '#0071e3' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)'; } }}
            >
              <Icon size={17} />
              <span style={{ flex: 1 }}>{label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: '2rem', height: '2rem', borderRadius: '50%',
              background: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/" style={{
            flex: 1, padding: '0.5rem', borderRadius: '8px', textAlign: 'center',
            fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.08)', textDecoration: 'none',
          }}>
            ← Cửa hàng
          </Link>
          <button onClick={logout} style={{
            padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.08)',
            color: '#ff6b6b', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
