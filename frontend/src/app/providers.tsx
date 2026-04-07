'use client';
import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { cartApi } from '@/lib/api';

export function Providers({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);
  const user = useAuthStore((s) => s.user);
  const setItems = useCartStore((s) => s.setItems);

  useEffect(() => { init(); }, [init]);

  // Sync cart from backend when user logs in
  useEffect(() => {
    if (user) {
      cartApi.get()
        .then(r => setItems(r.data.data?.items || []))
        .catch(() => {});
    }
  }, [user, setItems]);

  return <ThemeProvider attribute="class">{children}</ThemeProvider>;
}