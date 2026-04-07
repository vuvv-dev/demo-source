'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { ordersApi } from '@/lib/api';

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
const steps = ['pending', 'confirmed', 'shipping', 'delivered'];

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.detail(params.id as string)
      .then(r => setOrder(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-4 py-12"><div style={{ height: '30rem', background: '#f5f5f7', borderRadius: '1rem' }} className="animate-pulse" /></div>
    </div>
  );

  if (!order) return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#86868b' }}>Không tìm thấy đơn hàng</p>
    </div>
  );

  const currentStep = steps.indexOf(order.status);

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: '#86868b' }}>
          <Link href="/orders" className="hover:text-dark">Đơn hàng</Link>
          <span>→</span>
          <span style={{ color: '#1d1d1f', fontWeight: 500 }}>{order.orderNumber}</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1d1d1f', marginBottom: '1.5rem' }}>
          Chi tiết đơn hàng #{order.orderNumber}
        </h1>

        {/* Status Tracker */}
        {order.status !== 'cancelled' && (
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {steps.map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                      background: i <= currentStep ? '#0071e3' : '#f5f5f7',
                      color: i <= currentStep ? '#fff' : '#86868b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.875rem', fontWeight: 700,
                    }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 500, marginTop: '0.5rem', color: i <= currentStep ? '#0071e3' : '#86868b', textAlign: 'center' }}>
                      {statusLabels[step]}
                    </p>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: '2px', margin: '0 0.5rem', marginBottom: '1.5rem', borderRadius: '999px', background: i < currentStep ? '#0071e3' : '#f0f0f0' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {/* Items */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f5f5f7' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1d1d1f' }}>Sản phẩm đã đặt</h2>
            </div>
            {order.items.map((item, i) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: i < order.items.length - 1 ? '1px solid #f9f9fb' : 'none' }}>
                <img src={item.productImage || 'https://via.placeholder.com/80'} alt={item.productName}
                  style={{ width: '5rem', height: '5rem', borderRadius: '12px', objectFit: 'cover', background: '#f5f5f7', flexShrink: 0 }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1d1d1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.productName}</p>
                  <p style={{ fontSize: '0.75rem', color: '#86868b', marginTop: '0.25rem' }}>x{item.quantity}</p>
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#1d1d1f', flexShrink: 0 }}>{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
            <div style={{ padding: '1rem 1.5rem', background: '#f5f5f7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#86868b' }}>Tạm tính</span><span style={{ fontWeight: 500, color: '#1d1d1f' }}>{formatPrice(order.totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, paddingTop: '0.75rem', borderTop: '1px solid #e5e5e7' }}>
                <span style={{ color: '#1d1d1f' }}>Tổng cộng</span>
                <span style={{ color: '#1d1d1f', fontSize: '1.25rem' }}>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Address */}
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '1rem' }}>Địa chỉ giao hàng</h3>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1d1d1f' }}>{order.shippingAddress?.name}</p>
              <p style={{ fontSize: '0.8rem', color: '#86868b', marginTop: '0.25rem' }}>{order.shippingAddress?.phone}</p>
              <p style={{ fontSize: '0.8rem', color: '#86868b' }}>{order.shippingAddress?.address}</p>
              <p style={{ fontSize: '0.8rem', color: '#86868b' }}>{order.shippingAddress?.city}</p>
            </div>

            {/* Payment */}
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '1rem' }}>Thông tin thanh toán</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#86868b' }}>Phương thức</span>
                <span style={{ fontWeight: 500, color: '#1d1d1f' }}>{order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#86868b' }}>Thanh toán</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 500, padding: '2px 8px', borderRadius: '999px',
                  background: order.paymentStatus === 'paid' ? '#dcfce7' : '#fef3c7',
                  color: order.paymentStatus === 'paid' ? '#16a34a' : '#d97706' }}>
                  {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#86868b' }}>Ngày đặt</span>
                <span style={{ color: '#1d1d1f' }}>{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}