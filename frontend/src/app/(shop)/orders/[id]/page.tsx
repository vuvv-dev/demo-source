'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { ordersApi } from '@/lib/api';

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý', confirmed: 'Đã xác nhận',
  shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
};
const steps = ['pending', 'confirmed', 'shipping', 'delivered'];

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.detail(params.id as string)
      .then(r => setOrder(r.data.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12"><div className="h-[30rem] bg-gray-100 rounded-2xl animate-pulse" /></div>
    </div>
  );

  if (!order) return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <p className="text-[#86868b]">Không tìm thấy đơn hàng</p>
    </div>
  );

  const currentStep = steps.indexOf(order.status);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6 text-[#86868b]">
          <Link href="/orders" className="hover:text-[#1d1d1f] transition-colors">Đơn hàng</Link>
          <span>→</span>
          <span className="font-medium text-[#1d1d1f]">{order.orderNumber}</span>
        </div>
        <h1 className="text-[1.75rem] font-bold mb-6 text-[#1d1d1f]">
          Chi tiết đơn hàng #{order.orderNumber}
        </h1>

        {/* Status Tracker */}
        {order.status !== 'cancelled' && (
          <div className="bg-white border border-[#f0f0f0] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              {steps.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= currentStep ? 'bg-[#0071e3] text-white' : 'bg-[#f5f5f7] text-[#86868b]'
                      }`}>
                      {i + 1}
                    </div>
                    <p className={`text-xs font-medium mt-2 text-center ${i <= currentStep ? 'text-[#0071e3]' : 'text-[#86868b]'
                      }`}>
                      {statusLabels[step]}
                    </p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors ${i < currentStep ? 'bg-[#0071e3]' : 'bg-[#f0f0f0]'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white border border-[#f0f0f0] rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-[#f5f5f7]">
            <h2 className="text-base font-semibold text-[#1d1d1f]">Sản phẩm đã đặt</h2>
          </div>
          {order.items.map((item, i) => (
            <div key={item.id} className={`flex items-center gap-4 p-4 lg:p-6 ${i < order.items.length - 1 ? 'border-b border-[#f9f9fb]' : ''}`}>
              <Image src={item.productImage || 'https://via.placeholder.com/80'} alt={item.productName}
                width={80} height={80} className="w-20 h-20 rounded-xl object-cover bg-[#f5f5f7] shrink-0" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-[#1d1d1f] truncate">{item.productName}</p>
                <p className="text-xs text-[#86868b] mt-1">x{item.quantity}</p>
              </div>
              <p className="text-base font-bold text-[#1d1d1f] shrink-0">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
          <div className="p-4 lg:p-6 bg-[#f5f5f7]">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#86868b]">Tạm tính</span><span className="font-medium text-[#1d1d1f]">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-3 border-t border-[#e5e5e7]">
              <span className="text-[#1d1d1f]">Tổng cộng</span>
              <span className="text-[#1d1d1f]">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Address + Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address */}
          <div className="bg-white border border-[#f0f0f0] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Địa chỉ giao hàng</h3>
            <p className="text-sm font-semibold text-[#1d1d1f]">{order.shippingAddress?.name}</p>
            <p className="text-xs text-[#86868b] mt-1">{order.shippingAddress?.phone}</p>
            <p className="text-xs text-[#86868b]">{order.shippingAddress?.address}</p>
            <p className="text-xs text-[#86868b]">{order.shippingAddress?.city}</p>
          </div>

          {/* Payment */}
          <div className="bg-white border border-[#f0f0f0] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">Thông tin thanh toán</h3>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#86868b]">Phương thức</span>
              <span className="font-medium text-[#1d1d1f]">{order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}</span>
            </div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-[#86868b]">Thanh toán</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#fef3c7] text-[#d97706]'
                }`}>
                {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#86868b]">Ngày đặt</span>
              <span className="text-[#1d1d1f]">{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}