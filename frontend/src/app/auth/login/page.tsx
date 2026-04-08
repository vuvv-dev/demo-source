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

  return (
    <div className="bg-gradient-to-br from-[#f5f5f7] via-white to-[#eff6ff] min-h-screen flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#0071e3]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-[#5eb5f7]/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 no-underline group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d1d1f] to-[#3d3d3d] flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-semibold text-lg text-[#1d1d1f]">AppleStore</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-[#f0f0f0] p-8 animate-scale-in">
          <h2 className="text-2xl font-bold text-center text-[#1d1d1f] mb-1 tracking-tight">
            Đăng nhập
          </h2>
          <p className="text-center text-sm text-[#86868b] mb-6">
            Chào mừng bạn quay trở lại!
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-[#1d1d1f] mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="apple-input"
                placeholder="you@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1d1d1f] mb-1.5 block">
                Mật khẩu
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="apple-input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`apple-btn-primary w-full mt-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#86868b]">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-[#0071e3] font-medium no-underline hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}