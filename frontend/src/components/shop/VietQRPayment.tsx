'use client';
import { useState, useEffect, useCallback } from 'react';
import { Copy, CheckCircle2, AlertCircle, QrCode, RefreshCw, Loader2, Clock } from 'lucide-react';
import { paymentsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface VietQRPaymentProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
  onConfirmed?: () => void;
}

export default function VietQRPayment({ orderId, orderNumber, amount, paymentMethod, onConfirmed }: VietQRPaymentProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrType, setQrType] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<{ bankCode: string; accountNumber: string } | null>(null);
  const [displayOrderNumber, setDisplayOrderNumber] = useState(orderNumber);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(300);
  const [confirming, setConfirming] = useState(false);

  const copy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* ignore */ }
  };

  const fetchQR = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentsApi.getQRCode(orderId);
      const data = res.data?.data || res.data || {};

      if (data.alreadyPaid) {
        setError('Đơn hàng này đã được thanh toán.');
        setLoading(false);
        return;
      }

      setQrUrl(data.qrUrl || null);
      setQrType(data.qrType || null);
      setDisplayOrderNumber(data.orderNumber || orderNumber);
      setBankInfo(
        data.qrType === 'vietqr'
          ? { bankCode: data.bankCode || '', accountNumber: data.accountNumber || '' }
          : null,
      );
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error?.[0] || 'Không thể tạo mã QR.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchQR(); }, [fetchQR]);

  useEffect(() => {
    if (loading || error || !qrUrl) return;
    const timer = setInterval(() => {
      setCountdown(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, error, qrUrl]);

  const handleConfirm = async () => {
    if (!confirm('Bạn đã chuyển khoản thành công?')) return;
    setConfirming(true);
    try {
      await paymentsApi.confirmPayment(orderId);
      if (onConfirmed) onConfirmed();
      else window.location.href = `/checkout/success?order_id=${orderId}`;
    } catch {
      toast.error('Xác nhận thất bại, vui lòng thử lại.');
      setConfirming(false);
    }
  };

  const isVietQR = qrType === 'vietqr';

  return (
    <div className="space-y-0">
      {/* Amount & order number */}
      <div className="text-center mb-5">
        <p className="text-xs text-[#86868b] font-medium uppercase tracking-wider mb-1">Số tiền cần thanh toán</p>
        <p className="text-3xl font-bold text-[#1d1d1f] tracking-tight">{formatPrice(amount)}</p>
        <p className="text-[12px] text-[#86868b] mt-0.5">
          Mã đơn: <span className="font-mono font-semibold text-[#1d1d1f]">{displayOrderNumber || '—'}</span>
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mb-4">
            <Loader2 size={24} className="text-[#0071e3] animate-spin" />
          </div>
          <p className="text-sm text-[#86868b]">Đang tạo mã QR...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center py-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle size={24} className="text-[#ff3b30]" />
          </div>
          <p className="text-sm text-[#ff3b30] text-center mb-4">{error}</p>
          <button onClick={fetchQR} className="flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-semibold bg-[#f5f5f7] hover:bg-gray-200 transition-colors">
            <RefreshCw size={14} /> Thử lại
          </button>
        </div>
      )}

      {/* QR + info */}
      {!loading && !error && qrUrl && (
        <>
          {/* Bank info strip */}
          {isVietQR && bankInfo && (
            <div className="bg-[#f5f5f7] rounded-xl p-3 mb-4 flex items-center justify-between text-xs gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[#86868b]">STK: <span className="font-bold text-[#1d1d1f] font-mono">{bankInfo.accountNumber}</span></p>
                <p className="text-[#86868b]">NH: <span className="font-semibold text-[#1d1d1f]">{bankInfo.bankCode}</span></p>
              </div>
              <button onClick={() => copy(bankInfo.accountNumber, 'acc')} className="text-[#0071e3] font-semibold hover:underline shrink-0">
                {copiedField === 'acc' ? <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-[#34c759]" /> Đã copy</span> : 'Copy STK'}
              </button>
            </div>
          )}

          {/* QR image */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="relative w-52 h-52 rounded-2xl border-2 border-[#0071e3]/10 bg-white p-3 shadow-inner overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="Mã QR thanh toán" className="w-full h-full object-contain" />
              {[
                { top: -1, left: -1 }, { top: -1, right: -1 },
                { bottom: -1, left: -1 }, { bottom: -1, right: -1 },
              ].map((pos, i) => (
                <div key={i} className="absolute w-5 h-5 rounded-sm" style={{ background: '#0071e3', ...pos }} />
              ))}
            </div>
          </div>

          {/* Countdown timer */}
          {countdown > 0 && (
            <div className="flex items-center justify-center gap-2 text-xs text-[#86868b] mb-4">
              <Clock size={12} />
              <span>Mã QR sẽ hết hiệu lực sau <strong className="text-[#1d1d1f]">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</strong></span>
            </div>
          )}

          {/* Timer expired */}
          {countdown === 0 && (
            <div className="text-center py-4 mb-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-700 font-medium mb-2">Mã QR đã hết hiệu lực</p>
              <button onClick={() => { setCountdown(300); fetchQR(); }} className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors mx-auto">
                <RefreshCw size={13} /> Tải lại mã QR
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-[#f5f5f7] rounded-2xl p-4 mb-5">
            <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-2">Hướng dẫn</p>
            <ol className="text-[12px] text-[#86868b] space-y-1.5">
              <li className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                Mở app ngân hàng / Ví điện tử (VietQR, MoMo, ZaloPay...)
              </li>
              <li className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                Quét mã QR hoặc sao chép STK bên trên
              </li>
              <li className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                Chuyển đúng <span className="font-bold text-[#1d1d1f]">{formatPrice(amount)}</span> & nhấn &ldquo;Đã thanh toán&ldquo;
              </li>
            </ol>
          </div>

          {/* Copy buttons */}
          <div className="flex gap-2 mb-5">
            <button onClick={() => copy(String(amount), 'amt')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#e5e5e7] text-[12px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors">
              {copiedField === 'amt' ? <><CheckCircle2 size={13} className="text-[#34c759]" /> Đã copy</> : <><Copy size={13} /> Copy số tiền</>}
            </button>
            {displayOrderNumber && (
              <button onClick={() => copy(displayOrderNumber, 'ord')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#e5e5e7] text-[12px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors">
                {copiedField === 'ord' ? <><CheckCircle2 size={13} className="text-[#34c759]" /> Đã copy</> : <><Copy size={13} /> Copy mã đơn</>}
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {isVietQR && (
              <p className="text-center text-[11px] text-[#86868b]">
                Sau khi chuyển khoản xong, nhấn &ldquo;Đã thanh toán&ldquo; để xác nhận
              </p>
            )}
            <button
              onClick={handleConfirm}
              disabled={confirming || countdown === 0}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#0071e3] text-white font-bold text-[15px] hover:bg-[#0077ed] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {confirming ? 'Đang xác nhận...' : 'Đã thanh toán'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
