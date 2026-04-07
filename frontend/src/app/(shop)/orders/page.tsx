'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý', confirmed: 'Đã xác nhận',
  shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
};
const statusBg: Record<string, string> = {
  pending: '#fef3c7', confirmed: '#dbeafe',
  shipping: '#ede9fe', delivered: '#dcfce7', cancelled: '#fee2e2',
};
const statusColor: Record<string, string> = {
  pending: '#d97706', confirmed: '#0071e3',
  shipping: '#7c3aed', delivered: '#16a34a', cancelled: '#ef4444',
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

  if (loading) return <div style={{ background: '#fff', minHeight: '100vh' }}><div className="max-w-4xl mx-auto px-4 py-12"><div style={{ height: '20rem', background: '#f5f5f7', borderRadius: '1rem' }} className="animate-pulse" /></div></div>;

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1d1d1f', marginBottom: '2rem' }}>Đơn hàng của tôi</h1>

        {orders.length === 0 ? (
          <div className="text-center py-24 rounded-2xl" style={{ background: '#f5f5f7' }}>
            <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: '#d1d5db' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '0.5rem' }}>Chưa có đơn hàng nào</h2>
            <p style={{ fontSize: '0.875rem', color: '#86868b', marginBottom: '1.5rem' }}>Hãy bắt đầu mua sắm nhé!</p>
            <Link href="/products">
              <button style={{ height: '2.5rem', padding: '0 1.5rem', borderRadius: '12px', background: '#0071e3', color: '#fff', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
                Mua sắm ngay
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #f5f5f7', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600, color: '#1d1d1f' }}>{order.orderNumber}</p>
                    <p style={{ fontSize: '0.75rem', color: '#86868b', marginTop: '0.125rem' }}>{formatDate(order.createdAt)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: '999px', background: statusBg[order.status], color: statusColor[order.status] }}>
                      {statusLabels[order.status]}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1d1d1f' }}>{formatPrice(order.totalAmount)}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/orders/${order.id}`}>
                        <button style={{ height: '2rem', padding: '0 0.75rem', borderRadius: '8px', border: '1px solid #e5e5e7', background: '#fff', fontSize: '0.75rem', fontWeight: 500, color: '#1d1d1f', cursor: 'pointer' }}>Chi tiết</button>
                      </Link>
                      {order.status === 'pending' && (
                        <button onClick={() => cancelOrder(order.id)}
                          style={{ height: '2rem', padding: '0 0.75rem', borderRadius: '8px', border: 'none', fontSize: '0.75rem', fontWeight: 500, color: '#ff3b30', background: '#fef2f2', cursor: 'pointer' }}>
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                  {order.items.slice(0, 4).map(item => (
                    <img key={item.id} src={item.productImage || 'https://via.placeholder.com/60'} alt={item.productName}
                      style={{ width: '4rem', height: '4rem', borderRadius: '10px', objectFit: 'cover', background: '#f5f5f7', flexShrink: 0 }} />
                  ))}
                  {order.items.length > 4 && (
                    <div style={{ width: '4rem', height: '4rem', borderRadius: '10px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#86868b', flexShrink: 0 }}>
                      +{order.items.length - 4}
                    </div>
                  )}
                  <p style={{ fontSize: '0.75rem', color: '#86868b', alignSelf: 'center', flexShrink: 0 }}>{order.items.length} sản phẩm</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}