'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import { ordersApi } from '@/lib/api';
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
      setItems([]);
      toast.success('Đặt hàng thành công! 🎉');
      router.push(`/orders/${res.data.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại');
    } finally { setLoading(false); }
  };

  if (items.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: '#34c759' }} />
      <h2 className="text-xl font-bold mb-2" style={{ color: '#1d1d1f' }}>Đặt hàng thành công!</h2>
      <p className="text-sm mb-6" style={{ color: '#86868b' }}>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ sớm nhất.</p>
      <button onClick={() => router.push('/orders')} className="px-6 h-10 rounded-xl text-sm font-medium text-white" style={{ background: '#0071e3' }}>Xem đơn hàng</button>
    </div>
  );

  const inputStyle = { border: '1px solid #e5e5e7', borderRadius: '12px', padding: '0.625rem 1rem', fontSize: '0.875rem', width: '100%', background: '#fff', color: '#1d1d1f', outline: 'none', transition: 'border-color 0.2s' };
  const labelStyle = { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', display: 'block', color: '#1d1d1f' };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8" style={{ color: '#1d1d1f' }}>Thanh toán</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-5">
              {/* Shipping */}
              <div className="p-6 rounded-2xl border" style={{ borderColor: '#f0f0f0' }}>
                <h3 className="font-semibold mb-5" style={{ color: '#1d1d1f' }}>Thông tin giao hàng</h3>
                <div className="space-y-4">
                  <div>
                    <label style={labelStyle}>Họ tên *</label>
                    <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onFocus={e => e.target.style.borderColor = '#0071e3'} onBlur={e => e.target.style.borderColor = '#e5e5e7'} placeholder="Nguyễn Văn A" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Số điện thoại *</label>
                    <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} onFocus={e => e.target.style.borderColor = '#0071e3'} onBlur={e => e.target.style.borderColor = '#e5e5e7'} placeholder="0912345678" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Địa chỉ *</label>
                    <input style={inputStyle} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} onFocus={e => e.target.style.borderColor = '#0071e3'} onBlur={e => e.target.style.borderColor = '#e5e5e7'} placeholder="123 Nguyễn Trãi, Quận 1" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Thành phố *</label>
                    <select style={inputStyle} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="cursor-pointer">
                      {['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Ghi chú (tùy chọn)</label>
                    <input style={inputStyle} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Giao giờ hành chính, ghi chú..." />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="p-6 rounded-2xl border" style={{ borderColor: '#f0f0f0' }}>
                <h3 className="font-semibold mb-5" style={{ color: '#1d1d1f' }}>Phương thức thanh toán</h3>
                <div className="space-y-3">
                  {[
                    { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: Truck, desc: 'Trả tiền mặt khi nhận được hàng' },
                    { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng', icon: CreditCard, desc: 'Chuyển khoản trước qua tài khoản ngân hàng' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all"
                      style={{ borderColor: form.paymentMethod === opt.value ? '#0071e3' : '#e5e5e7', background: form.paymentMethod === opt.value ? '#eff6ff' : '#fff' }}>
                      <input type="radio" name="payment" value={opt.value} checked={form.paymentMethod === opt.value}
                        onChange={() => setForm(f => ({ ...f, paymentMethod: opt.value }))} className="hidden" />
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: form.paymentMethod === opt.value ? '#0071e3' : '#d1d5db' }}>
                        {form.paymentMethod === opt.value && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#0071e3' }} />}
                      </div>
                      <opt.icon size={18} style={{ color: '#86868b' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#1d1d1f' }}>{opt.label}</p>
                        <p className="text-xs" style={{ color: '#86868b' }}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div>
              <div className="sticky top-20 p-6 rounded-2xl border" style={{ borderColor: '#f0f0f0', background: '#fff' }}>
                <h3 className="font-semibold mb-4" style={{ color: '#1d1d1f' }}>Đơn hàng ({items.length})</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: '#f5f5f7' }}>
                        <img src={item.product.images[0] || 'https://via.placeholder.com/60'} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-2" style={{ color: '#1d1d1f' }}>{item.product.name}</p>
                        <p className="text-xs" style={{ color: '#86868b' }}>x{item.quantity}</p>
                        <p className="text-xs font-bold mt-0.5" style={{ color: '#0071e3' }}>{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }} className="space-y-2 text-sm">
                  <div className="flex justify-between"><span style={{ color: '#86868b' }}>Tạm tính</span><span className="font-medium" style={{ color: '#1d1d1f' }}>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between"><span style={{ color: '#86868b' }}>Phí vận chuyển</span><span className="font-medium" style={{ color: shipping === 0 ? '#34c759' : '#1d1d1f' }}>{shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</span></div>
                  <div className="flex justify-between pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
                    <span className="font-bold" style={{ color: '#1d1d1f' }}>Tổng</span>
                    <span className="text-xl font-bold" style={{ color: '#1d1d1f' }}>{formatPrice(total)}</span>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full mt-6 h-12 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: '#0071e3' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#0077ed')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#0071e3')}
                >
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