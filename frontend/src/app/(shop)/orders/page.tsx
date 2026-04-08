'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Package } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const statusBadgeClass: Record<string, string> = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  shipping: 'badge-shipping',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
};
const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý', confirmed: 'Đã xác nhận',
  shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    ordersApi.list().then(r => setOrders(r.data.data)).catch(() => router.push('/auth/login')).finally(() => setLoading(false));
  }, [router]);

  const cancelOrder = async (id: string) => {
    if (!confirm('Hủy đơn hàng này?')) return;
    try { await ordersApi.cancel(id); ordersApi.list().then(r => setOrders(r.data.data)); }
    catch (err: any) { alert(err.response?.data?.message || 'Hủy thất bại'); }
  };

  if (loading) return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-8 w-48 skeleton rounded-xl mb-8" />
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#f0f0f0] overflow-hidden">
              <div className="flex items-center justify-between p-4 lg:p-6 border-b border-[#f5f5f7] gap-4">
                <div className="space-y-2">
                  <div className="h-3 w-32 skeleton rounded-lg" />
                  <div className="h-3 w-24 skeleton rounded-lg" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-20 skeleton rounded-full" />
                  <div className="h-5 w-20 skeleton rounded-lg" />
                </div>
              </div>
              <div className="flex gap-3 p-4 lg:p-6">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="w-16 h-16 skeleton rounded-xl shrink-0" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#eff6ff]">
            <Package size={20} className="text-[#0071e3]" />
          </div>
          <div>
            <h1 className="text-[1.75rem] font-bold text-[#1d1d1f] tracking-tight">Đơn hàng của tôi</h1>
            <p className="text-sm text-[#86868b]">{orders.length} đơn hàng</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 rounded-2xl bg-[#f5f5f7]">
            <ShoppingBag size={48} className="mx-auto mb-4 text-[#d1d5db]" />
            <h2 className="text-xl font-semibold mb-2 text-[#1d1d1f]">Chưa có đơn hàng nào</h2>
            <p className="text-sm text-[#86868b] mb-6">Hãy bắt đầu mua sắm nhé!</p>
            <Link href="/products">
              <button className="apple-btn-primary group/btn">Mua sắm ngay</button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 stagger-children">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                {/* Header row */}
                <div className="flex items-center justify-between p-4 lg:p-6 border-b border-[#f5f5f7] flex-wrap gap-3">
                  <div>
                    <p className="text-xs font-mono font-bold text-[#1d1d1f]">{order.orderNumber}</p>
                    <p className="text-xs text-[#86868b] mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={statusBadgeClass[order.status]}>{statusLabels[order.status]}</span>
                    <span className="text-base font-bold text-[#1d1d1f]">{formatPrice(order.totalAmount)}</span>
                    <div className="flex gap-2">
                      <Link href={`/orders/${order.id}`}>
                        <button className="h-8 px-3 rounded-lg border border-[#e5e5e7] bg-white text-xs font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors">Chi tiết</button>
                      </Link>
                      {order.status === 'pending' && (
                        <button onClick={() => cancelOrder(order.id)}
                          className="h-8 px-3 rounded-lg border-0 text-xs font-medium text-[#ff3b30] bg-[#fef2f2] hover:bg-red-50 transition-colors">
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* Items row */}
                <div className="flex gap-3 p-4 lg:p-6 overflow-x-auto">
                  {order.items.slice(0, 4).map(item => (
                    <Image key={item.id} src={item.productImage || 'https://via.placeholder.com/60'} alt={item.productName}
                      width={64} height={64}
                      className="w-16 h-16 rounded-xl object-cover bg-[#f5f5f7] shrink-0 transition-transform duration-200 hover:scale-105" />
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-16 h-16 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-xs text-[#86868b] shrink-0">
                      +{order.items.length - 4}
                    </div>
                  )}
                  <p className="text-xs text-[#86868b] self-center shrink-0">{order.items.length} sản phẩm</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}