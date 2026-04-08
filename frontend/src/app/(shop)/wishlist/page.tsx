'use client';
import { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { wishlistApi, cartApi } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { items, ids, init } = useWishlistStore();
  const { setItems } = useCartStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init().finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await wishlistApi.remove(productId);
      const newItems = items.filter(p => p.id !== productId);
      useWishlistStore.setState({ items: newItems, ids: new Set(newItems.map(p => p.id)) });
      toast.success('Đã xóa khỏi yêu thích');
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const res = await cartApi.addItem({ productId: product.id, quantity: 1 });
      setItems(res.data.data.items || []);
      toast.success('Đã thêm vào giỏ hàng!');
    } catch { toast.error('Vui lòng đăng nhập để thêm vào giỏ'); }
  };

  if (loading) return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-8 w-48 skeleton rounded-xl mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-72 skeleton rounded-2xl" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#fff5f5]">
            <Heart size={20} className="text-red-500" fill="#ff3b30" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">Danh sách yêu thích</h1>
            <p className="text-sm text-[#86868b]">{items.length} sản phẩm</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-[#f5f5f7]">
              <Heart size={36} className="text-[#d1d5db]" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-[#1d1d1f]">Chưa có sản phẩm yêu thích</h2>
            <p className="text-sm text-[#86868b] mb-6">Lưu lại những sản phẩm bạn thích để mua sắm dễ dàng hơn</p>
            <Link href="/products">
              <button className="apple-btn-primary group/btn">Khám phá sản phẩm</button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {items.map(product => (
              <div key={product.id} className="product-card group/card animate-scale-in overflow-hidden">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-[#f5f5f7] group/img">
                  <Link href={`/products/${product.slug}`}>
                    <Image
                      src={product.images[0] || 'https://via.placeholder.com/400'}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                    />
                  </Link>
                  {/* Discount badge */}
                  {product.originalPrice && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#ff3b30] text-white text-[11px] font-bold shadow-sm z-10">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </div>
                  )}
                  {/* Out of stock overlay */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <span className="px-3 py-1.5 rounded-full bg-white/90 text-xs font-semibold text-[#1d1d1f]">Hết hàng</span>
                    </div>
                  )}
                  {/* Actions on hover */}
                  <div className="absolute bottom-3 right-3 z-10 translate-y-2 opacity-0 group-hover/img:translate-y-0 group-hover/img:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-10 h-10 rounded-full bg-[#0071e3] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,113,227,0.4)] hover:bg-[#0077ed] active:scale-90 transition-all duration-200"
                      aria-label="Thêm vào giỏ hàng"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
                {/* Content */}
                <div className="p-4">
                  <span className="pill pill-gray text-[10px]">{product.category?.name}</span>
                  <h3 className="text-sm font-semibold line-clamp-2 leading-snug mb-2 text-[#1d1d1f] min-h-[2.5rem] mt-1.5 group-hover/card:text-[#0071e3] transition-colors">
                    <Link href={`/products/${product.slug}`}>{product.name}</Link>
                  </h3>
                  <p className="text-base font-bold text-[#1d1d1f] mb-3">{formatPrice(product.price)}</p>
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="w-full h-9 rounded-xl border border-[#e5e5e7] flex items-center justify-center text-[#86868b] hover:border-[#ff3b30] hover:text-[#ff3b30] hover:bg-red-50 transition-all text-xs font-medium gap-1.5"
                  >
                    <Trash2 size={13} /> Xóa khỏi yêu thích
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}