'use client';
import { useState } from 'react';
import { User } from 'lucide-react';
import { usersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await usersApi.updateProfile(form);
      const token = localStorage.getItem('token') || '';
      setAuth(res.data.data, token);
      toast.success('Cập nhật thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-[1.75rem] font-bold mb-8 text-[#1d1d1f]">Tài khoản của tôi</h1>

        {/* Avatar */}
        <div className="flex items-center gap-4 p-5 bg-[#f5f5f7] rounded-2xl mb-6">
          <div className="w-16 h-16 rounded-full bg-[#0071e3] flex items-center justify-center shrink-0">
            <User size={24} color="#fff" />
          </div>
          <div>
            <p className="text-base font-semibold text-[#1d1d1f]">{user?.name}</p>
            <p className="text-sm text-[#86868b]">{user?.email}</p>
            <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-[#dbeafe] text-[#0071e3] mt-1 inline-block">
              {user?.role === 'admin' ? 'Quản trị' : 'Khách hàng'}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { label: 'Họ tên', key: 'name', type: 'text' },
            { label: 'Số điện thoại', key: 'phone', type: 'tel' },
            { label: 'Địa chỉ', key: 'address', type: 'text' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-sm font-medium mb-1.5 block text-[#1d1d1f]">{label}</label>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="apple-input"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className={`apple-btn-primary w-full mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}