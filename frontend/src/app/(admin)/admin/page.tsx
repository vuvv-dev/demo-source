'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ShoppingBag, Package, Users, ArrowRight } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { DashboardStats } from '@/types';
import StatCard from '@/components/admin/StatCard';
import { Card } from '@/components/ui/card';

const statusBg: Record<string, string> = {
  pending: 'bg-yellow-50', confirmed: 'bg-blue-50', shipping: 'bg-purple-50',
  delivered: 'bg-green-50', cancelled: 'bg-red-50',
};
const statusTextColor: Record<string, string> = {
  pending: 'text-yellow-700', confirmed: 'text-blue-700', shipping: 'text-purple-700',
  delivered: 'text-green-700', cancelled: 'text-red-700',
};
const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý', confirmed: 'Đã xác nhận',
  shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardApi.stats().then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#86868b] mt-1">Chào mừng quay trở lại, Admin!</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Doanh thu"
          value={stats ? formatPrice(stats.totalRevenue) : '—'}
          icon={<TrendingUp size={22} />}
          bg="bg-green-50" iconColor="#34c759"
        />
        <StatCard
          label="Đơn hàng"
          value={stats?.totalOrders ?? '—'}
          icon={<ShoppingBag size={22} />}
          bg="bg-blue-50" iconColor="#0071e3"
        />
        <StatCard
          label="Sản phẩm"
          value={stats?.totalProducts ?? '—'}
          icon={<Package size={22} />}
          bg="bg-amber-50" iconColor="#f59e0b"
        />
        <StatCard
          label="Khách hàng"
          value={stats?.totalUsers ?? '—'}
          icon={<Users size={22} />}
          bg="bg-purple-50" iconColor="#8b5cf6"
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-[#1d1d1f]">Đơn hàng gần đây</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-medium text-[#0071e3] hover:underline">
              Xem tất cả <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {stats?.recentOrders?.slice(0, 6).map(order => (
              <div key={order.id} className="flex items-center justify-between px-6 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="min-w-0">
                  <p className="text-xs font-mono font-semibold text-[#1d1d1f]">{order.orderNumber}</p>
                  <p className="text-xs text-[#86868b] mt-0.5">{order.user?.name} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-bold text-[#1d1d1f]">{formatPrice(order.totalAmount)}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBg[order.status]} ${statusTextColor[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.recentOrders?.length) && (
              <p className="px-6 py-10 text-center text-sm text-[#86868b]">Chưa có đơn hàng nào</p>
            )}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-[#1d1d1f]">Sản phẩm bán chạy</h2>
            <Link href="/admin/products" className="flex items-center gap-1 text-xs font-medium text-[#0071e3] hover:underline">
              Xem tất cả <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {stats?.topProducts?.map((product, i) => (
              <div key={product.id} className="flex items-center gap-4 px-6 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <span className="text-lg font-extrabold text-gray-200 w-6 text-center shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1d1d1f] truncate">{product.name}</p>
                  <p className="text-xs text-[#86868b]">{product.category?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#1d1d1f]">{formatPrice(product.price)}</p>
                  <p className="text-xs text-[#86868b]">{product.sold} đã bán</p>
                </div>
              </div>
            ))}
            {(!stats?.topProducts?.length) && (
              <p className="px-6 py-10 text-center text-sm text-[#86868b]">Chưa có dữ liệu</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
