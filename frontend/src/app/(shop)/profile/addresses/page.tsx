'use client';
import { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, CheckCircle2, ChevronRight, Home, Briefcase, User } from 'lucide-react';
import { addressesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import vnDataRaw from '@/data/vietnam-provinces.json';

const vnData = ((vnDataRaw as any).default || vnDataRaw) as any[];

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detailAddress: '',
    isDefault: false
  });

  // Helper to get districts for selected province
  const selectedProvinceData = vnData.find((p: any) => p.Name === form.province);
  const districts = selectedProvinceData?.Districts || [];
  
  // Helper to get wards for selected district
  const selectedDistrictData = districts.find((d: any) => d.Name === form.district);
  const wards = selectedDistrictData?.Wards || [];

  const loadAddresses = async () => {
    try {
      const res = await addressesApi.list();
      setAddresses(res.data);
    } catch (err) {
      toast.error('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await addressesApi.update(editingId, form);
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        await addressesApi.create(form);
        toast.success('Thêm địa chỉ mới thành công');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', phone: '', province: '', district: '', ward: '', detailAddress: '', isDefault: false });
      loadAddresses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (addr: any) => {
    setForm({
      name: addr.name,
      phone: addr.phone,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      detailAddress: addr.detailAddress,
      isDefault: addr.isDefault
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try {
      await addressesApi.delete(id);
      toast.success('Đã xóa địa chỉ');
      loadAddresses();
    } catch (err) {
      toast.error('Xóa thất bại');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressesApi.setDefault(id);
      toast.success('Đã đặt làm mặc định');
      loadAddresses();
    } catch (err) {
      toast.error('Thao tác thất bại');
    }
  };

  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 text-sm text-[#86868b] mb-4">
          <button onClick={() => router.push('/profile')} className="hover:text-[#0071e3] transition-colors">Tài khoản</button>
          <ChevronRight size={14} />
          <span className="text-[#1d1d1f] font-medium">Sổ địa chỉ</span>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-[2rem] font-bold text-[#1d1d1f] tracking-tight">Sổ địa chỉ</h1>
            <p className="text-[#86868b] mt-1">Quản lý các địa chỉ nhận hàng của bạn</p>
          </div>
          {!showForm && (
            <button 
              onClick={() => { setEditingId(null); setShowForm(true); }}
              className="flex items-center gap-2 bg-[#0071e3] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#0077ed] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={18} />
              Thêm địa chỉ mới
            </button>
          )}
        </div>

        {showForm ? (
          <div className="bg-white rounded-[24px] p-8 shadow-sm border border-[#f0f0f0] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold mb-6 text-[#1d1d1f]">
              {editingId ? 'Chỉnh sửa địa chỉ' : 'Địa chỉ mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-[#1d1d1f]">Họ tên người nhận</label>
                  <input 
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="VD: Nguyễn Văn A"
                    className="apple-input bg-[#fbfbfd]" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-[#1d1d1f]">Số điện thoại</label>
                  <input 
                    required
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="VD: 0912345678"
                    className="apple-input bg-[#fbfbfd]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-[#1d1d1f]">Tỉnh / Thành</label>
                  <select 
                    required
                    value={form.province}
                    onChange={e => setForm({...form, province: e.target.value, district: '', ward: ''})}
                    className="apple-input bg-[#fbfbfd] cursor-pointer"
                  >
                    <option value="">Chọn Tỉnh/Thành</option>
                    {(vnData as any[]).map(p => (
                      <option key={p.Id} value={p.Name}>{p.Name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-[#1d1d1f]">Quận / Huyện</label>
                  <select 
                    required
                    disabled={!form.province}
                    value={form.district}
                    onChange={e => setForm({...form, district: e.target.value, ward: ''})}
                    className="apple-input bg-[#fbfbfd] cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((d: any) => (
                      <option key={d.Id} value={d.Name}>{d.Name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-[#1d1d1f]">Phường / Xã</label>
                  <select 
                    required
                    disabled={!form.district}
                    value={form.ward}
                    onChange={e => setForm({...form, ward: e.target.value})}
                    className="apple-input bg-[#fbfbfd] cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((w: any) => (
                      <option key={w.Id} value={w.Name}>{w.Name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-[#1d1d1f]">Địa chỉ chi tiết (Số nhà, tên đường)</label>
                <input 
                  required
                  value={form.detailAddress}
                  onChange={e => setForm({...form, detailAddress: e.target.value})}
                  placeholder="VD: 123 Lê Lợi"
                  className="apple-input bg-[#fbfbfd]" 
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={e => setForm({...form, isDefault: e.target.checked})}
                  className="w-4 h-4 rounded border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]"
                />
                <label htmlFor="isDefault" className="text-sm text-[#1d1d1f] cursor-pointer">Đặt làm địa chỉ mặc định</label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#f0f0f0]">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-[#f5f5f7] text-[#1d1d1f] py-3 rounded-xl font-medium hover:bg-[#e8e8ed] transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="flex-2 bg-[#0071e3] text-white py-3 px-8 rounded-xl font-medium hover:bg-[#0077ed] transition-all shadow-lg shadow-blue-500/20"
                >
                  {editingId ? 'Cập nhật' : 'Lưu địa chỉ'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#f0f0f0]">
                <div className="w-8 h-8 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#86868b]">Đang tải địa chỉ...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#f0f0f0]">
                <div className="w-16 h-16 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto mb-4 text-[#86868b]">
                  <MapPin size={32} />
                </div>
                <h3 className="text-lg font-semibold text-[#1d1d1f]">Chưa có địa chỉ nào</h3>
                <p className="text-[#86868b] mt-1 max-w-xs mx-auto">Bạn chưa lưu địa chỉ giao hàng nào. Hãy thêm một cái để checkout nhanh hơn!</p>
              </div>
            ) : (
              addresses.map((addr) => (
                <div 
                  key={addr.id} 
                  className={`bg-white rounded-3xl p-6 border transition-all ${addr.isDefault ? 'border-[#0071e3] shadow-md' : 'border-[#f0f0f0] shadow-sm'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-[#eff6ff] text-[#0071e3]' : 'bg-[#f5f5f7] text-[#86868b]'}`}>
                        <Home size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#1d1d1f]">{addr.name}</span>
                          {addr.isDefault && (
                            <span className="bg-[#eff6ff] text-[#0071e3] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#dbeafe]">
                              MẶC ĐỊNH
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#1d1d1f] mt-1 font-medium">{addr.phone}</p>
                        <p className="text-sm text-[#86868b] mt-0.5 leading-relaxed">
                          {addr.detailAddress}<br />
                          {addr.ward}, {addr.district}, {addr.province}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleEdit(addr)}
                        className="text-xs font-semibold text-[#0071e3] hover:underline px-3 py-1.5 rounded-lg hover:bg-[#eff6ff] transition-colors"
                      >
                        Chỉnh sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(addr.id)}
                        className="text-xs font-semibold text-[#ff3b30] hover:underline px-3 py-1.5 rounded-lg hover:bg-[#fff1f0] transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                  {!addr.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(addr.id)}
                      className="mt-4 w-full py-2 rounded-xl border border-[#e5e5e7] text-xs font-semibold text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
                    >
                      Đặt làm địa chỉ mặc định
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-12 p-6 bg-white rounded-3xl border border-[#f0f0f0] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="font-bold text-[#1d1d1f]">Bảo mật thông tin</h4>
            <p className="text-sm text-[#86868b]">Docimal bảo đảm an toàn tuyệt đối thông tin địa chỉ của bạn.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
