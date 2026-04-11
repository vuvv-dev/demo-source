'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Package, Truck, CreditCard, Phone, CheckCircle, Clock, XCircle, ShoppingBag, MessageSquare, MapPin } from 'lucide-react';
import { Order } from '@/types';
import { formatPrice, formatDate, stripHtml } from '@/lib/utils';
import { ordersApi, paymentsApi } from '@/lib/api';
import toast from 'react-hot-toast';

const statusConfig: Record<string, {
  label: string;
  desc: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  text: string;
  iconBg: string;
  iconColor: string;
}> = {
  pending: { label: 'Chờ xử lý', desc: 'Đơn hàng đang chờ được xác nhận', icon: <Clock size={18} />, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  confirmed: { label: 'Đã xác nhận', desc: 'Đơn hàng đã được xác nhận, đang chuẩn bị', icon: <CheckCircle size={18} />, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  shipping: { label: 'Đang giao', desc: 'Đơn đang trên đường giao đến bạn', icon: <Truck size={18} />, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  delivered: { label: 'Đã giao', desc: 'Đơn hàng đã được giao thành công', icon: <Package size={18} />, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  cancelled: { label: 'Đã hủy', desc: 'Đơn đã bị hủy', icon: <XCircle size={18} />, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', iconBg: 'bg-red-100', iconColor: 'text-red-500' },
};

const steps = ['pending', 'confirmed', 'shipping', 'delivered'];

const paymentMethodLabels: Record<string, string> = {
  cod: 'COD (Giao hàng thu tiền)',
  bank_transfer: 'Chuyển khoản ngân hàng',
  payos: 'Thanh toán trực tuyến (PayOS)',
};

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const loadOrder = async () => {
    try {
      const r = await ordersApi.detail(params.id as string);
      setOrder(r.data.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handlePayNow = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const res = await paymentsApi.createCheckoutSession(order.id);
      const url = res.data.data.checkoutUrl;
      if (url) window.location.href = url;
      else toast.error('Không thể tạo liên kết thanh toán');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setActionLoading(false); }
  };

  const handleCancelOrder = async () => {
    if (!order || !confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    setActionLoading(true);
    try {
      await ordersApi.cancel(order.id);
      toast.success('Đã hủy đơn hàng');
      loadOrder();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hủy đơn hàng thất bại');
    } finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="bg-[#f5f5f7] min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-3 border-[#0071e3] border-t-transparent animate-spin" />
        <p className="text-sm text-[#86868b]">Đang tải đơn hàng...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="bg-[#f5f5f7] min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-[#f0f0f0]">
        <ShoppingBag size={32} className="text-[#d1d5db]" />
      </div>
      <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">Không tìm thấy đơn hàng</h2>
      <p className="text-[#86868b] mb-8 text-sm">Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <Link href="/orders" className="apple-btn-primary px-8">Quay lại danh sách</Link>
    </div>
  );

  const st = statusConfig[order.status] || statusConfig.pending;
  const currentStep = steps.indexOf(order.status);
  const canPay = order.status === 'pending' && order.paymentMethod === 'payos' && order.paymentStatus === 'pending';

  return (
    <div className="min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-8">

        {/* Back + Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/orders" className="w-9 h-9 rounded-xl bg-white border border-[#f0f0f0] flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] hover:shadow-sm transition-all">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex items-center gap-2 text-xs text-[#86868b]">
            <Link href="/profile" className="hover:text-[#1d1d1f] transition-colors">Tài khoản</Link>
            <span>/</span>
            <Link href="/orders" className="hover:text-[#1d1d1f] transition-colors">Đơn hàng</Link>
            <span>/</span>
            <span className="font-medium text-[#1d1d1f] font-mono">{order.orderNumber}</span>
          </div>
        </div>

        {/* Order Title Row */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[1.6rem] font-bold text-[#1d1d1f] tracking-tight leading-none">
                {order.orderNumber}
              </h1>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold pr-3 py-1 rounded-full border ${st.bg} ${st.border} ${st.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.iconColor.replace('text-', 'bg-')}`} />
                {st.label}
              </span>
            </div>
            <p className="text-[13px] text-[#86868b]">
              Đặt {formatDate(order.createdAt)} · Thanh toán {order.paymentStatus === 'paid' ? 'đã thanh toán' : 'chưa thanh toán'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canPay && (
              <button
                onClick={handlePayNow}
                disabled={actionLoading}
                className="h-10 px-5 rounded-xl bg-[#0071e3] text-white text-sm font-bold hover:bg-[#0077ed] active:scale-[0.97] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                Thanh toán ngay
              </button>
            )}
            {order.status === 'pending' && (
              <button
                onClick={handleCancelOrder}
                disabled={actionLoading}
                className="h-10 px-4 rounded-xl border border-[#e5e5e7] text-[11px] font-semibold text-[#ff3b30] bg-white hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50"
              >
                Hủy đơn
              </button>
            )}
          </div>
        </div>

        {/* Status Tracker */}
        {order.status !== 'cancelled' ? (
          <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-6 shadow-sm">
            <p className="text-[11px] font-bold text-[#86868b] uppercase mb-5">Theo dõi đơn hàng</p>
            <div className="flex items-start relative">
              {/* Track line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-[#f0f0f0]">
                <div
                  className="h-full bg-[#0071e3] rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(0, (currentStep / (steps.length - 1)) * 100)}%` }}
                />
              </div>

              {steps.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                const sc = statusConfig[step];
                return (
                  <div key={step} className="flex-1 flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${done ? 'bg-[#0071e3] text-white shadow-lg shadow-blue-500/30' :
                      active ? 'bg-white border-2 border-[#0071e3] text-[#0071e3] shadow-lg shadow-blue-500/20 scale-110' :
                        'bg-white border-2 border-[#e5e5e7] text-[#d1d5db]'
                      }`}>
                      {done ? <CheckCircle size={16} /> : sc.icon}
                    </div>
                    <p className={`text-[11px] font-semibold text-center leading-tight ${done || active ? 'text-[#1d1d1f]' : 'text-[#86868b]'
                      }`}>{sc.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Current status banner */}
            <div className={`mt-5 flex items-center gap-3 p-3.5 rounded-xl ${st.bg} border ${st.border}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${st.iconBg} ${st.iconColor}`}>
                {st.icon}
              </div>
              <div>
                <p className={`text-[13px] font-semibold ${st.text}`}>{st.label}</p>
                <p className="text-[11px] text-[#86868b] mt-0.5">{st.desc}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex items-center gap-4 p-5 rounded-2xl border mb-6 ${st.bg} ${st.border}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${st.iconBg} ${st.iconColor}`}>
              {st.icon}
            </div>
            <div>
              <p className={`font-bold ${st.text}`}>Đơn hàng đã bị hủy</p>
              <p className="text-[12px] text-[#86868b] mt-0.5">Vui lòng liên hệ hỗ trợ nếu bạn có thắc mắc.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Products */}
          <div className="md:col-span-2 lg:col-span-4 bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f5f5f7]">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-[#86868b]" />
                <h2 className="text-sm font-semibold text-[#1d1d1f]">Sản phẩm</h2>
              </div>
              <span className="text-[12px] text-[#86868b]">{order.items.length} sản phẩm</span>
            </div>

            {/* Product descriptions */}
            {order.items[0]?.product?.description && (
              <div className="px-5 py-3 bg-[#fafafa] border-b border-[#f0f0f0]">
                <p className="text-[12px] text-[#86868b] leading-relaxed italic line-clamp-2">
                  {stripHtml(order.items[0].product.description)}
                </p>
              </div>
            )}

            <div className="divide-y divide-[#f5f5f7]">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-5 group hover:bg-[#fafafa] transition-colors">
                  <Link href={`/products/${item.product?.slug || item.product?.id}`}>
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#f5f5f7] border border-[#f0f0f0] shrink-0 group-hover:border-[#0071e3]/30 transition-all group-hover:shadow-md">
                      <Image
                        src={item.productImage || 'https://via.placeholder.com/64'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <Link href={`/products/${item.product?.slug || item.product?.id}`}>
                      <p className="text-[13px] font-semibold text-[#1d1d1f] line-clamp-1 group-hover:text-[#0071e3] transition-colors leading-tight">{item.productName}</p>
                    </Link>
                    <p className="text-[12px] text-[#86868b] mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    {item.product?.description && (
                      <p className="text-[11px] text-[#86868b] line-clamp-1 leading-relaxed mt-0.5">
                        {stripHtml(item.product.description)}
                      </p>
                    )}
                  </div>
                  <p className="text-[14px] font-bold text-[#1d1d1f] shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            {/* Summary */}
            <div className="px-5 py-4 bg-[#fafafa] space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#86868b]">Tạm tính</span>
                <span className="font-medium text-[#1d1d1f]">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#86868b]">Phí vận chuyển</span>
                <span className="font-medium text-[#34c759]">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#e5e5e7]">
                <span className="text-[15px] font-bold text-[#1d1d1f]">Tổng cộng</span>
                <span className="text-[17px] font-bold text-[#0071e3]">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={15} className="text-[#86868b]" />
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Thông tin đơn</h3>
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-start gap-2.5">
                <span className="text-[11px] font-semibold text-[#86868b] w-16 shrink-0 pt-0.5">Mã đơn</span>
                <span className="text-[12px] font-semibold text-[#1d1d1f] font-mono">{order.orderNumber}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[11px] font-semibold text-[#86868b] w-16 shrink-0 pt-0.5">Ngày đặt</span>
                <span className="text-[12px] text-[#1d1d1f]">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[11px] font-semibold text-[#86868b] w-16 shrink-0 pt-0.5">Tổng tiền</span>
                <span className="text-[12px] font-bold text-[#0071e3]">{formatPrice(order.totalAmount)}</span>
              </div>
              {order.note && (
                <div className="pt-3 border-t border-[#f5f5f7]">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[11px] font-semibold text-[#86868b] w-16 shrink-0 pt-0.5">Ghi chú</span>
                    <p className="text-[12px] italic text-[#86868b] leading-relaxed">{order.note}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Truck size={15} className="text-[#86868b]" />
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Địa chỉ giao hàng</h3>
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-[13px] font-semibold text-[#1d1d1f]">{order.shippingAddress?.name}</p>
              <p className="text-[12px] text-[#1d1d1f]">{order.shippingAddress?.phone}</p>
              <div className="flex items-start gap-1.5 mt-1">
                <MapPin size={12} className="text-[#86868b] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] text-[#86868b] leading-relaxed">{order.shippingAddress?.address}</p>
                  <p className="text-[12px] text-[#86868b]">{order.shippingAddress?.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={15} className="text-[#86868b]" />
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Thanh toán</h3>
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#86868b]">Phương thức</span>
                <span className="text-[12px] font-semibold text-[#1d1d1f]">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#86868b]">Tình trạng</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${order.paymentStatus === 'paid'
                  ? 'bg-[#dcfce7] text-[#16a34a]'
                  : 'bg-amber-50 text-amber-700'
                  }`}>
                  {order.paymentStatus === 'paid' ? '✓ Đã thanh toán' : '◌ Chưa thanh toán'}
                </span>
              </div>
              <div className="mt-auto pt-3 border-t border-[#f5f5f7] flex items-center justify-between">
                <span className="text-[12px] text-[#86868b]">Tổng tiền</span>
                <span className="text-[14px] font-bold text-[#0071e3]">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Help / Support */}
          <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Phone size={15} className="text-[#86868b]" />
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Hỗ trợ</h3>
            </div>
            <div className="flex items-start gap-3 flex-1">
              <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center shrink-0">
                <Phone size={14} className="text-[#0071e3]" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#1d1d1f] mb-0.5">Cần hỗ trợ?</p>
                <p className="text-[11px] text-[#86868b] leading-relaxed">
                  Liên hệ <strong className="text-[#1d1d1f]">1800-1192</strong> hoặc Zalo với mã <strong className="font-mono font-semibold text-[#1d1d1f]">{order.orderNumber}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
