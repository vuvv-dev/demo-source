'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      setAuth(res.data.data.user, res.data.data.accessToken);
      toast.success(`Chào mừng ${res.data.data.user.name}!`);
      router.push(res.data.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', height: '2.75rem', borderRadius: '12px',
    border: '1px solid #e5e5e7', padding: '0 1rem',
    fontSize: '0.875rem', background: '#fff', color: '#1d1d1f',
    outline: 'none', transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ background: '#f5f5f7', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '8px', background: '#1d1d1f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>A</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1d1d1f' }}>AppleStore</span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '2rem', border: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', color: '#1d1d1f', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
            Đăng nhập
          </h2>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#86868b', marginBottom: '1.5rem' }}>
            Chào mừng bạn quay trở lại!
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1d1d1f', display: 'block', marginBottom: '0.375rem' }}>
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0071e3'}
                onBlur={e => e.target.style.borderColor = '#e5e5e7'}
                placeholder="you@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1d1d1f', display: 'block', marginBottom: '0.375rem' }}>
                Mật khẩu
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0071e3'}
                onBlur={e => e.target.style.borderColor = '#e5e5e7'}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: '2.75rem', borderRadius: '12px', border: 'none',
                background: loading ? '#d1d5db' : '#0071e3', color: '#fff',
                fontSize: '0.875rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem', transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!loading) ((e.currentTarget) as HTMLButtonElement).style.background = '#0077ed'; }}
              onMouseLeave={e => { if (!loading) ((e.currentTarget) as HTMLButtonElement).style.background = '#0071e3'; }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#86868b' }}>
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" style={{ color: '#0071e3', fontWeight: 500, textDecoration: 'none' }}>
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
