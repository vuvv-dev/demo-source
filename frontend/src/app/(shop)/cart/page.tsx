'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { cartApi } from '@/lib/api';
import { CartItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { setItems: setStoreItems, getTotal } = useCartStore();
  const router = useRouter();

  const fetchCart = () => {
    cartApi.get()
      .then(r => { setItems(r.data.data.items || []); setStoreItems(r.data.data.items || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (id: string, qty: number) => {
    try {
      const res = await cartApi.updateItem(id, { quantity: qty });
      setItems(res.data.data.items || []);
      setStoreItems(res.data.data.items || []);
    } catch { toast.error('Cập nhật thất bại'); }
  };

  const removeItem = async (id: string) => {
    try {
      const res = await cartApi.removeItem(id);
      setItems(res.data.data.items || []);
      setStoreItems(res.data.data.items || []);
      toast.success('Đã xóa sản phẩm');
    } catch { toast.error('Xóa thất bại'); }
  };

  const subtotal = getTotal();
  const shipping = subtotal > 5000000 ? 0 : 30000;
  const total = subtotal + shipping;

  if (loading) return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-4 py-12"><div className="h-96 bg-gray-100 rounded-2xl animate-pulse" /></div>
    </div>
  );

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8" style={{ color: '#1d1d1f' }}>Giỏ hàng</h1>

        {items.length === 0 ? (
          <div className="text-center py-24 rounded-2xl" style={{ background: '#f5f5f7' }}>
            <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: '#d1d5db' }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#1d1d1f' }}>Giỏ hàng trống</h2>
            <p className="text-sm mb-6" style={{ color: '#86868b' }}>Hãy thêm sản phẩm vào giỏ hàng nhé!</p>
            <Link href="/products">
              <button className="px-6 h-10 rounded-xl text-sm font-medium text-white transition-colors" style={{ background: '#0071e3' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#0077ed')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#0071e3')}
              >
                Mua sắm ngay
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 rounded-2xl border" style={{ borderColor: '#f0f0f0', background: '#fff' }}>
                  <Link href={`/products/${item.product.slug}`}>
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0" style={{ background: '#f5f5f7' }}>
                      <Image src={item.product.images[0] || 'https://via.placeholder.com/100'} alt={item.product.name}
                        width={96} height={96} className="object-cover w-full h-full" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold line-clamp-2 leading-snug" style={{ color: '#1d1d1f' }}>{item.product.name}</h3>
                    <p className="text-sm font-bold mt-1" style={{ color: '#0071e3' }}>{formatPrice(item.product.price)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: '#e5e5e7' }}>
                        <button onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center transition-colors" style={{ color: '#1d1d1f' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#f5f5f7')}
                          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium" style={{ color: '#1d1d1f' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center transition-colors" style={{ color: '#1d1d1f' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#f5f5f7')}
                          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: '#ff3b30' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#fef2f2')}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/products">
                <button className="flex items-center gap-2 text-sm transition-colors mt-2" style={{ color: '#0071e3' }}>
                  <ArrowLeft size={14} /> Tiếp tục mua sắm
                </button>
              </Link>
            </div>

            {/* Summary */}
            <div>
              <div className="sticky top-20 p-6 rounded-2xl border" style={{ borderColor: '#f0f0f0', background: '#fff' }}>
                <h3 className="font-semibold mb-4" style={{ color: '#1d1d1f' }}>Tóm tắt đơn hàng</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: '#86868b' }}>Tạm tính</span>
                    <span className="font-medium" style={{ color: '#1d1d1f' }}>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#86868b' }}>Phí vận chuyển</span>
                    <span className="font-medium" style={{ color: shipping === 0 ? '#34c759' : '#1d1d1f' }}>
                      {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-xs" style={{ color: '#34c759' }}>🎉 Bạn được miễn phí vận chuyển!</p>
                  )}
                  <div className="pt-3 border-t flex justify-between" style={{ borderColor: '#f0f0f0' }}>
                    <span className="font-semibold" style={{ color: '#1d1d1f' }}>Tổng cộng</span>
                    <span className="text-xl font-bold" style={{ color: '#1d1d1f' }}>{formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full mt-6 h-12 rounded-xl text-sm font-medium text-white transition-colors"
                  style={{ background: '#0071e3' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#0077ed')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#0071e3')}
                >
                  Tiến hành thanh toán
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
