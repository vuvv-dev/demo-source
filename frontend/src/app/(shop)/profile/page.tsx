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

  const inputStyle = { width: '100%', height: '2.75rem', borderRadius: '12px', border: '1px solid #e5e5e7', padding: '0 1rem', fontSize: '0.875rem', background: '#fff', color: '#1d1d1f', outline: 'none', boxSizing: 'border-box' as const };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1d1d1f', marginBottom: '2rem' }}>Tài khoản của tôi</h1>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: '#f5f5f7', borderRadius: '16px', marginBottom: '1.5rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={24} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1d1d1f' }}>{user?.name}</p>
            <p style={{ fontSize: '0.875rem', color: '#86868b' }}>{user?.email}</p>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 10px', borderRadius: '999px', background: '#dbeafe', color: '#0071e3', marginTop: '0.25rem', display: 'inline-block' }}>
              {user?.role === 'admin' ? 'Quản trị' : 'Khách hàng'}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Họ tên', key: 'name', type: 'text' },
            { label: 'Số điện thoại', key: 'phone', type: 'tel' },
            { label: 'Địa chỉ', key: 'address', type: 'text' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1d1d1f', display: 'block', marginBottom: '0.375rem' }}>{label}</label>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0071e3'}
                onBlur={e => e.target.style.borderColor = '#e5e5e7'}
              />
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{ width: '100%', height: '2.75rem', borderRadius: '12px', border: 'none', background: loading ? '#d1d5db' : '#0071e3', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', transition: 'background 0.2s' }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#0077ed'; }}
            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#0071e3'; }}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}