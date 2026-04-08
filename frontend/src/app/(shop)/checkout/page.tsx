'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CreditCard, Truck, CheckCircle2, Lock } from 'lucide-react';
import { ordersApi, paymentsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, setItems } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: 'TP. Hồ Chí Minh', paymentMethod: 'cod', note: '' });

  const subtotal = getTotal();
  const shipping = subtotal > 5000000 ? 0 : 30000;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) return toast.error('Vui lòng điền đầy đủ thông tin');
    setLoading(true);
    try {
      const res = await ordersApi.create({
        shippingAddress: { name: form.name, phone: form.phone, address: form.address, city: form.city },
        paymentMethod: form.paymentMethod, note: form.note,
      });

      if (form.paymentMethod === 'stripe' && res.data.requiresPayment) {
        const sessionRes = await paymentsApi.createCheckoutSession(res.data.data.id);
        const stripeUrl = sessionRes.data.data.url;
        if (stripeUrl) {
          window.location.href = stripeUrl;
          return;
        }
      }

      setItems([]);
      toast.success('Đặt hàng thành công! 🎉');
      router.push(`/orders/${res.data.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại');
    } finally { setLoading(false); }
  };

  if (items.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <CheckCircle2 size={48} className="mx-auto mb-4 text-[#34c759]" />
      <h2 className="text-xl font-bold mb-2 text-[#1d1d1f]">Đặt hàng thành công!</h2>
      <p className="text-sm mb-6 text-[#86868b]">Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ sớm nhất.</p>
      <button onClick={() => router.push('/orders')} className="apple-btn-primary group/btn">Xem đơn hàng</button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8 text-[#1d1d1f]">Thanh toán</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-5">
              {/* Shipping */}
              <div className="p-6 rounded-2xl border border-[#f0f0f0]">
                <h3 className="font-semibold mb-5 text-[#1d1d1f]">Thông tin giao hàng</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-[#1d1d1f]">Họ tên *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="apple-input"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-[#1d1d1f]">Số điện thoại *</label>
                    <input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="apple-input"
                      placeholder="0912345678"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-[#1d1d1f]">Địa chỉ *</label>
                    <input
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      className="apple-input"
                      placeholder="123 Nguyễn Trãi, Quận 1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-[#1d1d1f]">Thành phố *</label>
                    <select
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="apple-input cursor-pointer"
                    >
                      {['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-[#1d1d1f]">Ghi chú (tùy chọn)</label>
                    <input
                      value={form.note}
                      onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                      className="apple-input"
                      placeholder="Giao giờ hành chính, ghi chú..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="p-6 rounded-2xl border border-[#f0f0f0]">
                <h3 className="font-semibold mb-5 text-[#1d1d1f]">Phương thức thanh toán</h3>
                <div className="space-y-3">
                  {[
                    { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: Truck, desc: 'Trả tiền mặt khi nhận được hàng' },
                    { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng', icon: CreditCard, desc: 'Chuyển khoản trước qua tài khoản ngân hàng' },
                    { value: 'stripe', label: 'Thanh toán bằng thẻ (Stripe)', icon: Lock, desc: 'Thanh toán an toàn qua Stripe' },
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === opt.value
                        ? 'border-[#0071e3] bg-[#eff6ff]'
                        : 'border-[#e5e5e7] bg-white'
                      }`}>
                      <input type="radio" name="payment" value={opt.value} checked={form.paymentMethod === opt.value}
                        onChange={() => setForm(f => ({ ...f, paymentMethod: opt.value }))} className="hidden" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${form.paymentMethod === opt.value ? 'border-[#0071e3]' : 'border-[#d1d5db]'
                        }`}>
                        {form.paymentMethod === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />}
                      </div>
                      <opt.icon size={18} className="text-[#86868b]" />
                      <div>
                        <p className="text-sm font-medium text-[#1d1d1f]">{opt.label}</p>
                        <p className="text-xs text-[#86868b]">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div>
              <div className="sticky top-20 p-6 rounded-2xl border border-[#f0f0f0] bg-white">
                <h3 className="font-semibold mb-4 text-[#1d1d1f]">Đơn hàng ({items.length})</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[#f5f5f7]">
                        <Image src={item.product.images[0] || 'https://via.placeholder.com/60'} alt={item.product.name} width={56} height={56} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-2 text-[#1d1d1f]">{item.product.name}</p>
                        <p className="text-xs text-[#86868b]">x{item.quantity}</p>
                        <p className="text-xs font-bold mt-0.5 text-[#0071e3]">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#f0f0f0] pt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#86868b]">Tạm tính</span><span className="font-medium text-[#1d1d1f]">{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-[#86868b]">Phí vận chuyển</span><span className="font-medium text-[#1d1d1f]">{shipping === 0 ? <span className="text-[#34c759]">Miễn phí</span> : formatPrice(shipping)}</span></div>
                  <div className="flex justify-between pt-2 border-t border-[#f0f0f0]">
                    <span className="font-bold text-[#1d1d1f]">Tổng</span>
                    <span className="text-xl font-bold text-[#1d1d1f]">{formatPrice(total)}</span>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="apple-btn-primary w-full mt-6 group/btn disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}