'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Phone, MapPin, CreditCard, Package, Clock } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};
const statusBg: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  shipping: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};
const steps = ['pending', 'confirmed', 'shipping', 'delivered'];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = () => {
    ordersApi.detail(params.id as string)
      .then(r => setOrder(r.data.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [params.id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await ordersApi.updateStatus(order!.id, { status });
      toast.success('Cập nhật trạng thái thành công!');
      fetchOrder();
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="h-48 bg-white rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-white rounded-2xl animate-pulse" />
        <div className="h-64 bg-white rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  if (!order) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#86868b]">
      <p className="text-lg mb-4">Không tìm thấy đơn hàng</p>
      <Link href="/admin/orders">
        <Button variant="outline" className="gap-2"><ChevronLeft className="w-4 h-4" />Quay lại danh sách</Button>
      </Link>
    </div>
  );

  const currentStep = steps.indexOf(order.status);
  const isFinal = order.status === 'delivered' || order.status === 'cancelled';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon" className="rounded-xl border-gray-200">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1d1d1f]">Chi tiết đơn hàng</h1>
            <p className="text-sm text-[#86868b] font-mono">{order.orderNumber}</p>
          </div>
        </div>
        <span className={cn('text-sm font-medium px-3 py-1.5 rounded-full', statusBg[order.status])}>
          {statusLabels[order.status]}
        </span>
      </div>

      {/* Customer info banner */}
      {order.user && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3] font-bold text-lg">
            {order.user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1d1d1f]">{order.user.name}</p>
            <p className="text-xs text-[#86868b]">{order.user.email}</p>
            {order.user.phone && <p className="text-xs text-[#86868b]">{order.user.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs text-[#86868b]">Ngày đặt</p>
            <p className="text-sm font-medium text-[#1d1d1f]">{formatDate(order.createdAt)}</p>
          </div>
        </div>
      )}

      {/* Status tracker */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    i <= currentStep
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-gray-100 text-[#86868b]',
                  )}>
                    {i + 1}
                  </div>
                  <p className={cn(
                    'text-xs font-medium mt-2 text-center',
                    i <= currentStep ? 'text-[#0071e3]' : 'text-[#86868b]',
                  )}>
                    {statusLabels[step]}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('flex-1 h-1 mx-2 rounded-full transition-all', i < currentStep ? 'bg-[#0071e3]' : 'bg-gray-100')} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status update controls */}
      {!isFinal && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-[#1d1d1f] mb-3">Cập nhật trạng thái</p>
          <div className="flex flex-wrap gap-2">
            {steps.map((step) => {
              const stepIndex = steps.indexOf(step);
              const isCurrent = order.status === step;
              const isPast = stepIndex < currentStep;
              const isFuture = stepIndex > currentStep;

              return (
                <button
                  key={step}
                  onClick={() => updateStatus(step)}
                  disabled={updating || isCurrent}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium border transition-all disabled:cursor-not-allowed',
                    isCurrent
                      ? 'bg-[#0071e3] text-white border-[#0071e3]'
                      : isPast
                      ? 'bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20 hover:bg-[#0071e3]/20'
                      : 'bg-gray-50 text-[#86868b] border-gray-200 hover:bg-gray-100',
                  )}
                >
                  {statusLabels[step]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order items */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#86868b]" />
              Sản phẩm đã đặt ({order.items.length})
            </h2>
            <span className="text-sm font-bold text-[#1d1d1f]">
              {formatPrice(order.totalAmount)}
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-5">
                <Image
                  src={item.productImage || 'https://via.placeholder.com/80'}
                  alt={item.productName}
                  width={64} height={64}
                  className="w-16 h-16 rounded-xl object-cover bg-gray-50 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1d1d1f] truncate">{item.productName}</p>
                  {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
                    <p className="text-xs text-[#86868b] mt-0.5">
                      {Object.entries(item.selectedVariant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </p>
                  )}
                  <p className="text-xs text-[#86868b] mt-1">x{item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#1d1d1f]">{formatPrice(item.price * item.quantity)}</p>
                  <p className="text-xs text-[#86868b]">{formatPrice(item.price)} × {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#86868b]">Tạm tính</span>
              <span className="text-[#1d1d1f] font-medium">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#86868b]">Phí vận chuyển</span>
              <span className="text-[#1d1d1f] font-medium">Miễn phí</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
              <span className="text-[#1d1d1f]">Tổng cộng</span>
              <span className="text-[#1d1d1f]">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Shipping address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#86868b]" />
              Địa chỉ giao hàng
            </h3>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#1d1d1f]">{order.shippingAddress?.name}</p>
              <p className="text-xs text-[#86868b] flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" />
                {order.shippingAddress?.phone}
              </p>
              <p className="text-xs text-[#86868b]">{order.shippingAddress?.address}</p>
              <p className="text-xs text-[#86868b]">{order.shippingAddress?.city}</p>
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-[#86868b]" />
              Thanh toán
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#86868b]">Phương thức</span>
                <span className="font-medium text-[#1d1d1f]">
                  {order.paymentMethod === 'cod' ? 'COD (Nhận hàng trả tiền)' : 'Chuyển khoản'}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-[#86868b]">Trạng thái TT</span>
                <span className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full',
                  order.paymentStatus === 'paid'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-yellow-50 text-yellow-700',
                )}>
                  {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-[#86868b]">Ngày đặt</span>
                <span className="font-medium text-[#1d1d1f] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Note */}
          {order.note && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Ghi chú</h3>
              <p className="text-sm text-[#86868b]">{order.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
