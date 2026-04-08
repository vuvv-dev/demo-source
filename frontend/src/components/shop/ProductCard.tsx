'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Tag, Heart, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';
import { cartApi } from '@/lib/api';

export default function ProductCard({ product }: { product: Product }) {
  const { setItems } = useCartStore();
  const { ids, toggle: toggleWishlist } = useWishlistStore();
  const isWishlisted = ids.has(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - (product.price as number) / (product.originalPrice as number)) * 100)
    : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await cartApi.addItem({ productId: product.id, quantity: 1 });
      setItems(res.data.data.items || []);
      toast.success('Đã thêm vào giỏ hàng!', { style: { borderRadius: '12px' } });
    } catch {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ');
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist(product.id);
      toast.success(isWishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích!', { style: { borderRadius: '12px' } });
    } catch {
      toast.error('Vui lòng đăng nhập để lưu sản phẩm');
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block animate-scale-in">
      <article className="product-card group/card">
        {/* ── Image ── */}
        <div className="card-image group/img">
          <Image
            src={product.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          {/* Discount */}
          {discount && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#ff3b30] text-white text-[11px] font-bold shadow-sm flex items-center gap-1 z-10">
              <Tag size={9} /> -{discount}%
            </div>
          )}

          {/* Wishlist heart */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm z-10 bg-white/90 backdrop-blur-sm hover:bg-white active:scale-90"
            style={{ color: isWishlisted ? '#ff3b30' : '#86868b' }}
            aria-label="Yêu thích"
          >
            <Heart size={15} fill={isWishlisted ? '#ff3b30' : 'none'} />
          </button>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <span className="px-3 py-1.5 rounded-full bg-white/90 text-xs font-semibold text-[#1d1d1f]">Hết hàng</span>
            </div>
          )}

          {/* Add to cart on hover */}
          {product.stock > 0 && (
            <div className="absolute bottom-3 right-3 z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={handleAddToCart}
                className="w-10 h-10 rounded-full bg-[#0071e3] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,113,227,0.4)] hover:bg-[#0077ed] active:scale-90 transition-all duration-200"
                aria-label="Thêm vào giỏ hàng"
              >
                <ShoppingCart size={16} />
              </button>
            </div>
          )}

          {/* Low stock badge */}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="px-2.5 py-1 rounded-full bg-[#ff9f0a] text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                <Package size={9} /> Còn {product.stock}
              </span>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="p-4">
          {/* Category */}
          <span className="pill pill-gray text-[10px]">
            {product.category?.name}
          </span>

          {/* Name */}
          <h3 className="mt-2 text-sm font-semibold text-[#1d1d1f] line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-[#0071e3] transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.averageRating && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={11}
                    style={{
                      fill: i <= Math.round(Number(product.averageRating)) ? '#f5c518' : '#e5e5e7',
                      color: i <= Math.round(Number(product.averageRating)) ? '#f5c518' : '#e5e5e7',
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] text-[#86868b]">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-base font-bold text-[#1d1d1f]">{formatPrice(product.price as number)}</p>
              {product.originalPrice && (
                <p className="text-[11px] text-[#86868b] line-through mt-0.5">{formatPrice(product.originalPrice as number)}</p>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}