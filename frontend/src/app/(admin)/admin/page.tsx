'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ShoppingBag, Package, Users, ArrowRight } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { DashboardStats } from '@/types';

const statusBg: Record<string, string> = {
  pending: '#fef3c7', confirmed: '#dbeafe', shipping: '#ede9fe',
  delivered: '#dcfce7', cancelled: '#fee2e2',
};
const statusTextColor: Record<string, string> = {
  pending: '#d97706', confirmed: '#0071e3', shipping: '#7c3aed',
  delivered: '#16a34a', cancelled: '#ef4444',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardApi.stats().then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  const statCards = stats ? [
    { label: 'Doanh thu', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: '#34c759', bg: '#f0fdf4' },
    { label: 'Đơn hàng', value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, color: '#0071e3', bg: '#eff6ff' },
    { label: 'Sản phẩm', value: stats.totalProducts.toLocaleString(), icon: Package, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Khách hàng', value: stats.totalUsers.toLocaleString(), icon: Users, color: '#8b5cf6', bg: '#f5f3ff' },
  ] : [];

  const statusLabels: Record<string, string> = {
    pending: 'Chờ xử lý', confirmed: 'Đã xác nhận',
    shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ fontSize: '0.875rem', color: '#86868b', marginTop: '0.25rem' }}>Chào mừng quay trở lại, Admin!</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: '#86868b', fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1d1d1f', marginTop: '0.5rem' }}>{value}</p>
              </div>
              <div style={{ width: '3rem', height: '3rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg }}>
                <Icon size={20} style={{ color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Orders */}
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f5f5f7' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1d1d1f' }}>Đơn hàng gần đây</h2>
            <Link href="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#0071e3', textDecoration: 'none', fontWeight: 500 }}>
              Xem tất cả <ArrowRight size={13} />
            </Link>
          </div>
          <div>
            {stats?.recentOrders?.slice(0, 6).map(order => (
              <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.5rem', borderBottom: '1px solid #f9f9fb' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600, color: '#1d1d1f' }}>{order.orderNumber}</p>
                  <p style={{ fontSize: '0.75rem', color: '#86868b', marginTop: '0.125rem' }}>{order.user?.name} · {formatDate(order.createdAt)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1d1d1f' }}>{formatPrice(order.totalAmount)}</p>
                  <span style={{ fontSize: '0.7rem', fontWeight: 500, padding: '2px 8px', borderRadius: '999px', color: statusTextColor[order.status] || '#86868b', background: statusBg[order.status] || '#f5f5f7' }}>
                    {statusLabels[order.status]}
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.recentOrders?.length) && (
              <p style={{ padding: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#86868b' }}>Chưa có đơn hàng nào</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f5f5f7' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1d1d1f' }}>Sản phẩm bán chạy</h2>
            <Link href="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#0071e3', textDecoration: 'none', fontWeight: 500 }}>
              Xem tất cả <ArrowRight size={13} />
            </Link>
          </div>
          <div>
            {stats?.topProducts?.map((product, i) => (
              <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: '1px solid #f9f9fb' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d1d5db', width: '1.5rem', textAlign: 'center' }}>{i + 1}</span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1d1d1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#86868b' }}>{product.category?.name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1d1d1f' }}>{formatPrice(product.price)}</p>
                  <p style={{ fontSize: '0.75rem', color: '#86868b' }}>{product.sold} đã bán</p>
                </div>
              </div>
            ))}
            {(!stats?.topProducts?.length) && (
              <p style={{ padding: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#86868b' }}>Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
