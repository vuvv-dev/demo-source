'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  MapPin,
  Plus,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  QrCode
} from 'lucide-react';
import { ordersApi, paymentsApi, addressesApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import vnDataRaw from '@/data/vietnam-provinces.json';
import VietQRPayment from '@/components/shop/VietQRPayment';

function QrCodeIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return <QrCode size={size} className={className} />;
}

const vnData = ((vnDataRaw as any).default || vnDataRaw) as any[];

type Step = 'address' | 'payment' | 'review' | 'qr';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, setItems } = useCartStore();
  const { user } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState<Step>('address');
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string|null>(null);
  
  // For Guest or New Address
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [manualAddress, setManualAddress] = useState({ 
    name: '', 
    phone: '', 
    province: '', 
    district: '', 
    ward: '', 
    detailAddress: '' 
  });

  // Helper to get districts for selected province
  const selectedProvinceData = vnData.find((p: any) => p.Name === manualAddress.province);
  const districts = selectedProvinceData?.Districts || [];
  
  // Helper to get wards for selected district
  const selectedDistrictData = districts.find((d: any) => d.Name === manualAddress.district);
  const wards = selectedDistrictData?.Wards || [];

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [note, setNote] = useState('');
  const [qrOrderId, setQrOrderId] = useState<string | null>(null);
  const [qrTotal, setQrTotal] = useState<number>(0);

  // Calculate Shipping
  const subtotal = getTotal();
  const getShippingFee = () => {
    if (subtotal > 5000000) return 0;
    
    let province = '';
    if (selectedAddressId) {
      const addr = addresses.find(a => a.id === selectedAddressId);
      province = addr?.province || '';
    } else {
      province = manualAddress.province;
    }

    if (province === 'TP. Hồ Chí Minh' || province === 'Hà Nội') return 20000;
    return 40000;
  };

  const shipping = getShippingFee();
  const total = subtotal + shipping;

  useEffect(() => {
    if (user) {
      loadAddresses();
    } else {
      setShowAddressForm(true);
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      const res = await addressesApi.list();
      setAddresses(res.data);
      const defaultAddr = res.data.find((a: any) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (res.data.length > 0) setSelectedAddressId(res.data[0].id);
      else setShowAddressForm(true);
    } catch (err) {
      console.error('Failed to load addresses');
    }
  };

  const validateAddress = () => {
    if (!user || showAddressForm) {
      if (!manualAddress.name || !manualAddress.phone || !manualAddress.province || !manualAddress.district || !manualAddress.ward || !manualAddress.detailAddress) {
        toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
        return false;
      }
    } else {
      if (!selectedAddressId) {
        toast.error('Vui lòng chọn hoặc thêm địa chỉ giao hàng');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 'address') {
      if (!validateAddress()) return;
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      setCurrentStep('review');
    }
  };

  const prevStep = () => {
    if (currentStep === 'payment') setCurrentStep('address');
    if (currentStep === 'review') setCurrentStep('payment');
    if (currentStep === 'qr') { setQrOrderId(null); setCurrentStep('review'); }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: any = {
        paymentMethod,
        note,
      };

      if (user && !showAddressForm && selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        payload.shippingAddress = {
          name: manualAddress.name,
          phone: manualAddress.phone,
          address: `${manualAddress.detailAddress}, ${manualAddress.ward}, ${manualAddress.district}`,
          city: manualAddress.province
        };
      }

      const res = await ordersApi.create(payload);

      // bank_transfer: show QR payment inline after order is created
      if (paymentMethod === 'bank_transfer') {
        setQrOrderId(res.data.data.id);
        setQrTotal(total);
        setCurrentStep('qr');
        return;
      }

      // payos: redirect to PayOS checkout page
      if (paymentMethod === 'payos' && res.data.requiresPayment) {
        const sessionRes = await paymentsApi.createCheckoutSession(res.data.data.id);
        const checkoutUrl = sessionRes.data.data.checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        }
      }

      setItems([]);
      toast.success('Đặt hàng thành công! 🎉');
      router.push(`/orders/${res.data.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <CheckCircle2 size={64} className="mx-auto mb-6 text-[#34c759]" />
        <h2 className="text-2xl font-bold mb-3 text-[#1d1d1f]">Giỏ hàng của bạn đang trống</h2>
        <p className="text-[#86868b] mb-10">Hãy quay lại cửa hàng để chọn cho mình những sản phẩm tuyệt vời nhất.</p>
        <button onClick={() => router.push('/')} className="apple-btn-primary px-10">Trang chủ</button>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <h1 className="text-[2.5rem] font-bold text-[#1d1d1f] tracking-tight">Thanh toán</h1>
          <div className="flex items-center gap-2">
            {[
              { id: 'address', label: 'Giao hàng' },
              { id: 'payment', label: 'Thanh toán' },
              { id: 'review', label: 'Hoàn tất' },
              { id: 'qr', label: 'QR Code' }
            ].map((step, idx) => {
              const steps = ['address', 'payment', 'review', 'qr'];
              const stepIdx = steps.indexOf(currentStep);
              return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  currentStep === step.id
                    ? 'bg-[#0071e3] text-white shadow-lg shadow-blue-500/30'
                    : (idx < stepIdx ? 'bg-[#34c759] text-white' : 'bg-white text-[#86868b] border border-[#d2d2d7]')
                }`}>
                  {idx < stepIdx ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${currentStep === step.id ? 'text-[#1d1d1f]' : 'text-[#86868b]'}`}>
                  {step.label}
                </span>
                {idx < 3 && <div className="mx-4 w-8 h-px bg-[#d2d2d7]" />}
              </div>
            )})}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* STEP 1: ADDRESS */}
            {currentStep === 'address' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="bg-white rounded-[24px] p-8 border border-[#f0f0f0] shadow-sm">
                  <h3 className="text-xl font-bold mb-6 text-[#1d1d1f]">Địa chỉ nhận hàng</h3>
                  
                  {user && (
                    <div className="space-y-4 mb-6">
                      {addresses.map(addr => (
                        <label key={addr.id} className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${
                          selectedAddressId === addr.id && !showAddressForm ? 'border-[#0071e3] bg-[#eff6ff]' : 'border-[#e5e5e7] hover:border-[#d2d2d7]'
                        }`}>
                          <input 
                            type="radio" 
                            name="address" 
                            checked={selectedAddressId === addr.id && !showAddressForm}
                            onChange={() => { setSelectedAddressId(addr.id); setShowAddressForm(false); }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-[#1d1d1f]">{addr.name}</span>
                              {addr.isDefault && <span className="bg-[#eff6ff] text-[#0071e3] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#dbeafe]">MẶC ĐỊNH</span>}
                            </div>
                            <p className="text-sm text-[#1d1d1f] mb-1">{addr.phone}</p>
                            <p className="text-sm text-[#86868b]">{addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}</p>
                          </div>
                        </label>
                      ))}
                      
                      <button 
                        onClick={() => setShowAddressForm(!showAddressForm)}
                        className={`w-full flex items-center justify-center gap-2 p-5 rounded-2xl border border-dashed transition-all ${
                          showAddressForm ? 'border-[#0071e3] text-[#0071e3] bg-[#eff6ff]' : 'border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]'
                        }`}
                      >
                        {showAddressForm ? <CheckCircle2 size={18} /> : <Plus size={18} />}
                        <span className="font-medium">{showAddressForm ? 'Sử dụng địa chỉ khác bên dưới' : 'Sử dụng địa chỉ giao hàng khác'}</span>
                      </button>
                    </div>
                  )}

                  {showAddressForm && (
                    <div className="space-y-4 pt-4 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          placeholder="Họ tên người nhận" 
                          className="apple-input bg-[#fbfbfd]"
                          value={manualAddress.name}
                          onChange={e => setManualAddress({...manualAddress, name: e.target.value})}
                        />
                        <input 
                          placeholder="Số điện thoại" 
                          className="apple-input bg-[#fbfbfd]"
                          value={manualAddress.phone}
                          onChange={e => setManualAddress({...manualAddress, phone: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select 
                          required
                          className="apple-input bg-[#fbfbfd] cursor-pointer"
                          value={manualAddress.province}
                          onChange={e => setManualAddress({...manualAddress, province: e.target.value, district: '', ward: ''})}
                        >
                          <option value="">Chọn Tỉnh/Thành</option>
                          {vnData.map((p: any) => (
                            <option key={p.Id} value={p.Name}>{p.Name}</option>
                          ))}
                        </select>
                        <select 
                          required
                          disabled={!manualAddress.province}
                          className="apple-input bg-[#fbfbfd] cursor-pointer disabled:opacity-50"
                          value={manualAddress.district}
                          onChange={e => setManualAddress({...manualAddress, district: e.target.value, ward: ''})}
                        >
                          <option value="">Chọn Quận/Huyện</option>
                          {districts.map((d: any) => (
                            <option key={d.Id} value={d.Name}>{d.Name}</option>
                          ))}
                        </select>
                        <select 
                          required
                          disabled={!manualAddress.district}
                          className="apple-input bg-[#fbfbfd] cursor-pointer disabled:opacity-50"
                          value={manualAddress.ward}
                          onChange={e => setManualAddress({...manualAddress, ward: e.target.value})}
                        >
                          <option value="">Chọn Phường/Xã</option>
                          {wards.map((w: any) => (
                            <option key={w.Id} value={w.Name}>{w.Name}</option>
                          ))}
                        </select>
                      </div>
                      <input 
                        placeholder="Địa chỉ chi tiết (Số nhà, tên đường)" 
                        className="apple-input bg-[#fbfbfd]"
                        value={manualAddress.detailAddress}
                        onChange={e => setManualAddress({...manualAddress, detailAddress: e.target.value})}
                      />
                    </div>
                  )}
                </div>
                
                <button onClick={nextStep} className="apple-btn-primary w-full py-4 rounded-[18px] text-lg flex items-center justify-center gap-2">
                  Tiếp tục đến thanh toán
                  <ArrowRight size={20} />
                </button>
              </div>
            )}

            {/* STEP 2: PAYMENT */}
            {currentStep === 'payment' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-[24px] p-8 border border-[#f0f0f0] shadow-sm">
                  <h3 className="text-xl font-bold mb-6 text-[#1d1d1f]">Phương thức thanh toán</h3>
                  <div className="grid gap-4">
                    {[
                      { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: Truck, desc: 'Trả bằng tiền mặt khi shipper giao hàng đến.' },
                      { id: 'bank_transfer', label: 'Chuyển khoản QR Code', icon: QrCodeIcon, desc: 'Quét mã QR bằng app ngân hàng. Xác nhận tức thì.' },
                      { id: 'payos', label: 'Thanh toán nhanh PayOS', icon: Lock, desc: 'Chuyển khoản qua cổng PayOS. An toàn & nhanh chóng.' }
                    ].map(method => (
                      <label key={method.id} className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === method.id ? 'border-[#0071e3] bg-[#eff6ff]' : 'border-[#e5e5e7] hover:border-[#d2d2d7]'
                      }`}>
                        <input 
                          type="radio" 
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <method.icon size={18} className={paymentMethod === method.id ? 'text-[#0071e3]' : 'text-[#86868b]'} />
                            <span className="font-bold text-[#1d1d1f]">{method.label}</span>
                          </div>
                          <p className="text-sm text-[#86868b]">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="mt-8">
                    <label className="text-sm font-medium mb-2 block text-[#1d1d1f]">Ghi chú đơn hàng (Tùy chọn)</label>
                    <textarea 
                      placeholder="VD: Giao giờ hành chính, gọi trước khi đến..."
                      className="apple-input bg-[#fbfbfd] min-h-[100px] py-3"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 bg-white border border-[#d2d2d7] text-[#1d1d1f] py-4 rounded-[18px] font-semibold hover:bg-[#f5f5f7] flex items-center justify-center gap-2">
                    <ArrowLeft size={20} />
                    Quay lại
                  </button>
                  <button onClick={nextStep} className="flex-[2] apple-btn-primary py-4 rounded-[18px] text-lg flex items-center justify-center gap-2">
                    Kiểm tra lại đơn hàng
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: QR PAYMENT */}
            {currentStep === 'qr' && qrOrderId && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white rounded-[24px] p-8 border border-[#f0f0f0] shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#005bb5] flex items-center justify-center">
                      <QrCode size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1d1d1f]">Thanh toán qua QR</h3>
                      <p className="text-sm text-[#86868b]">Quét mã QR ngân hàng (VietQR)</p>
                    </div>
                  </div>
                  <VietQRPayment
                    orderId={qrOrderId}
                    orderNumber=""
                    amount={qrTotal}
                    paymentMethod="bank_transfer"
                    onConfirmed={() => { setItems([]); router.push('/orders'); }}
                  />
                </div>
                <button onClick={prevStep} className="w-full mt-4 bg-white border border-[#d2d2d7] text-[#1d1d1f] py-4 rounded-[18px] font-semibold hover:bg-[#f5f5f7] flex items-center justify-center gap-2">
                  <ArrowLeft size={20} />
                  Quay lại kiểm tra đơn hàng
                </button>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {currentStep === 'review' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white rounded-[24px] p-8 border border-[#f0f0f0] shadow-sm">
                  <h3 className="text-xl font-bold mb-6 text-[#1d1d1f]">Xác nhận thông tin</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-5 bg-[#fbfbfd] rounded-2xl border border-[#f0f0f0]">
                      <div className="flex items-center gap-2 mb-3 text-[#0071e3]">
                        <MapPin size={18} />
                        <h4 className="font-bold">Địa chỉ giao hàng</h4>
                      </div>
                      {(!user || showAddressForm || !selectedAddressId) ? (
                        <div className="text-sm text-[#1d1d1f]">
                          <p className="font-semibold">{manualAddress.name}</p>
                          <p>{manualAddress.phone}</p>
                          <p>{manualAddress.detailAddress}, {manualAddress.ward}, {manualAddress.district}, {manualAddress.province}</p>
                        </div>
                      ) : (
                        <div className="text-sm text-[#1d1d1f]">
                          {(() => {
                            const addr = addresses.find(a => a.id === selectedAddressId);
                            return addr ? (
                              <>
                                <p className="font-semibold">{addr.name}</p>
                                <p>{addr.phone}</p>
                                <p>{addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}</p>
                              </>
                            ) : 'Chưa chọn địa chỉ';
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="p-5 bg-[#fbfbfd] rounded-2xl border border-[#f0f0f0]">
                      <div className="flex items-center gap-2 mb-3 text-[#0071e3]">
                        <CreditCard size={18} />
                        <h4 className="font-bold">Thanh toán & Vận chuyển</h4>
                      </div>
                      <div className="text-sm text-[#1d1d1f]">
                        <p className="flex justify-between mb-1"><span>Phương thức:</span> <span className="font-semibold uppercase">{paymentMethod}</span></p>
                        <p className="flex justify-between mb-1"><span>Vận chuyển:</span> <span className="font-semibold">{shipping === 0 ? 'Miễn phí' : 'Tiêu chuẩn'}</span></p>
                        <p className="text-[#86868b] mt-2 italic">"{note || 'Không có ghi chú'}"</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-700">
                    <ShieldCheck className="shrink-0" />
                    {paymentMethod === 'bank_transfer' ? (
                      <p>Đơn hàng sẽ được tạo và mã QR sẽ hiện ra ngay. Bạn có thể quét và thanh toán ngay.</p>
                    ) : (
                      <p>Bằng cách nhấn &ldquo;Đặt hàng hàng ngay&ldquo;, bạn đồng ý với các điều khoản dịch vụ và chính sách bảo mật của Docimal.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 bg-white border border-[#d2d2d7] text-[#1d1d1f] py-4 rounded-[18px] font-semibold hover:bg-[#f5f5f7] flex items-center justify-center gap-2">
                    <ArrowLeft size={20} />
                    Thay đổi
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="flex-[2] apple-btn-primary py-4 rounded-[18px] text-lg flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-transform"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang xử lý...
                      </div>
                    ) : (
                      <>Đặt hàng ngay ({formatPrice(total)})</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-[24px] p-6 border border-[#f0f0f0] shadow-sm sticky top-24">
              <h3 className="font-bold text-lg mb-6 text-[#1d1d1f]">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-16 h-16 bg-[#f5f5f7] rounded-xl overflow-hidden shrink-0 border border-[#f0f0f0]">
                      <Image 
                        src={item.product.images[0] || 'https://via.placeholder.com/100'} 
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#1d1d1f] line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-[#86868b] mt-0.5">SL: {item.quantity}</p>
                      <p className="text-sm font-bold text-[#0071e3] mt-1">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-[#f5f5f7] pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#86868b]">Tạm tính</span>
                  <span className="text-[#1d1d1f] font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#86868b]">Phí vận chuyển</span>
                  <span className="text-[#1d1d1f] font-medium">
                    {shipping === 0 ? <span className="text-[#34c759] font-bold">Miễn phí</span> : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#f5f5f7]">
                  <span className="font-bold text-[#1d1d1f]">Tổng cộng</span>
                  <span className="text-2xl font-bold text-[#0071e3] tracking-tight">{formatPrice(total)}</span>
                </div>
              </div>

              {currentStep !== 'review' && (
                <div className="mt-8 p-4 bg-[#fbfbfd] rounded-2xl flex items-center gap-3">
                  <AlertCircle size={18} className="text-[#86868b]" />
                  <p className="text-[11px] text-[#86868b]">Ưu phí vận chuyển sẽ được áp dụng dựa trên địa chỉ của bạn.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 py-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
              <ShieldCheck size={20} />
              <div className="w-px h-8 bg-[#d2d2d7]" />
              <div className="text-[10px] font-bold text-[#86868b] leading-tight uppercase tracking-widest">
                Giao dịch<br />An toàn 100%
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}