'use client';
import { useEffect, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ShoppingBag, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

const confettiColors = ['#0071e3', '#34c759', '#f5c518', '#ff9f0a', '#8b5cf6', '#ff3b30'];

function ConfettiPiece({ delay, x }: { delay: number; x: number }) {
  const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
  return (
    <div
      className="absolute w-2 h-2 rounded-full opacity-0"
      style={{
        left: `${x}%`,
        top: '-10px',
        background: color,
        animation: `confetti-drop 1.5s ease-in ${delay}ms forwards`,
      }}
    />
  );
}

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { setItems } = useCartStore();
  const [confetti] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      delay: Math.random() * 800,
      x: Math.random() * 100,
    }))
  );

  useEffect(() => {
    const sessionId = params.get('session_id');
    const orderId = params.get('order_id');
    if (orderId) {
      setItems([]);
      toast.success('Thanh toán thành công qua Stripe!');
      router.replace(`/orders/${orderId}`);
    } else if (sessionId) {
      toast.success('Thanh toán thành công!');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f5f5f7] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti */}
      {confetti.map(c => (
        <ConfettiPiece key={c.id} delay={c.delay} x={c.x} />
      ))}

      {/* Glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full bg-[#34c759]/10 blur-3xl" />
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl border border-[#f0f0f0] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-10 text-center animate-scale-in">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[#dcfce7] flex items-center justify-center mx-auto mb-6 animate-float">
          <CheckCircle2 size={40} className="text-[#34c759]" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#16a34a] text-xs font-semibold mb-4">
          <Sparkles size={11} />
          Thành công
        </div>

        <h2 className="text-2xl font-bold mb-3 text-[#1d1d1f] tracking-tight">Thanh toán thành công!</h2>
        <p className="text-sm leading-relaxed mb-2 text-[#86868b]">
          Cảm ơn bạn đã đặt hàng tại AppleStore.
        </p>
        <p className="text-sm mb-8 text-[#86868b]">
          Đang chuyển hướng đến trang đơn hàng...
        </p>

        <button
          onClick={() => router.push('/orders')}
          className="apple-btn-primary w-full group/btn inline-flex items-center justify-center gap-2"
        >
          <ShoppingBag size={16} />
          Xem đơn hàng
        </button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SuccessContent />
    </Suspense>
  );
}