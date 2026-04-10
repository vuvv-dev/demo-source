'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Heart, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';
import { cartApi } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
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

  // ── List view
  if (viewMode === 'list') {
    return (
      <Link href={`/products/${product.slug}`} className="group block">
        <article className="flex gap-4 p-4 bg-white rounded-2xl hover:shadow-md transition-all duration-200">
          {/* Image */}
          <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-[#f5f5f7]">
            <Image
              src={product.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="112px"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <span className="px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-semibold text-[#1d1d1f]">Hết hàng</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-[#86868b]">{product.category?.name}</span>
              <h3 className="mt-1 text-sm font-semibold text-[#1d1d1f] line-clamp-2 leading-snug group-hover:text-[#0071e3] transition-colors">
                {product.name}
              </h3>
              {/* Rating */}
              {product.averageRating ? (
                <div className="flex items-center gap-1.5 mt-1.5">
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
                  <span className="text-[11px] text-[#86868b]">({product.reviewCount} đánh giá)</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-end justify-between mt-2">
              <div className="flex items-end gap-2">
                <p className="text-base font-bold text-[#1d1d1f]">{formatPrice(product.price as number)}</p>
                {product.originalPrice && (
                  <p className="text-[11px] text-[#86868b] line-through">{formatPrice(product.originalPrice as number)}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {product.stock === 0 ? (
                  <span className="px-3 py-1.5 rounded-xl bg-[#fef2f2] text-[11px] font-semibold text-[#ff3b30]">Hết hàng</span>
                ) : product.stock <= 5 ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#ff9f0a]">
                    <Package size={10} /> Còn {product.stock}
                  </span>
                ) : null}
                <div
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={handleWishlist}
                    className="w-9 h-9 rounded-xl border border-[#e5e5e7] flex items-center justify-center transition-colors hover:border-[#ff3b30] hover:text-[#ff3b30]"
                    style={{ color: isWishlisted ? '#ff3b30' : '#86868b' }}
                    aria-label="Yêu thích"
                  >
                    <Heart size={14} fill={isWishlisted ? '#ff3b30' : 'none'} />
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="h-9 px-4 rounded-xl bg-[#0071e3] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#0077ed] transition-colors active:scale-95"
                  >
                    <ShoppingCart size={14} />
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // ── Grid view (default)
  return (
    <Link href={`/products/${product.slug}`} className="group block h-full animate-scale-in">
      <article className="product-card h-full flex flex-col group/card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
        {/* Image */}
        <div className="card-image group/img relative w-full aspect-[4/3] bg-[#f5f5f7]">
          <Image
            src={product.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          {discount ? (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0071e3] text-white text-[10px] font-semibold z-10">
              Giảm {discount}%
            </div>
          ) : product.extraMetadata?.badge ? (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1d1d1f]/80 backdrop-blur-sm text-white text-[10px] font-semibold z-10">
              {product.extraMetadata.badge}
            </div>
          ) : null}

          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 z-10 bg-white/90 backdrop-blur-sm hover:bg-white active:scale-90 border border-white/50"
            style={{ color: isWishlisted ? '#ff3b30' : '#86868b' }}
            aria-label="Yêu thích"
          >
            <Heart size={15} fill={isWishlisted ? '#ff3b30' : 'none'} />
          </button>

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <span className="px-3 py-1.5 rounded-full bg-white/90 text-xs font-semibold text-[#1d1d1f]">Hết hàng</span>
            </div>
          )}

          {product.stock > 0 && (
            <div className="absolute bottom-3 right-3 z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={handleAddToCart}
                className="w-10 h-10 rounded-full bg-white text-[#1d1d1f] flex items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.12)] hover:bg-[#0071e3] hover:text-white active:scale-90 transition-all duration-200 border border-gray-200"
                aria-label="Thêm vào giỏ hàng"
              >
                <ShoppingCart size={16} />
              </button>
            </div>
          )}

          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="px-2.5 py-1 rounded-full bg-[#ff9f0a] text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                <Package size={9} /> Còn {product.stock}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div>
            <span className="pill pill-gray text-[10px]">{product.category?.name}</span>
          </div>

          <h3 className="mt-2 text-sm font-semibold text-[#1d1d1f] line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-[#0071e3] transition-colors">
            {product.name}
          </h3>

          <div className="min-h-[22px] mt-2.5">
            {product.averageRating ? (
              <div className="flex items-center gap-1.5">
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
            ) : (
              <div className="h-[14px]" />
            )}
          </div>

          <div className="mt-auto pt-3 flex items-end justify-between">
            <div className="min-h-[44px] flex flex-col justify-end">
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