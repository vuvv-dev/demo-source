'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Tag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { cartApi } from '@/lib/api';

export default function ProductCard({ product }: { product: Product }) {
  const { setItems } = useCartStore();
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

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

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className="group bg-white rounded-2xl border overflow-hidden cursor-pointer"
        style={{
          borderColor: '#f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
          (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e5e7';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
          (e.currentTarget as HTMLDivElement).style.borderColor = '#f0f0f0';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden" style={{ background: '#f5f5f7' }}>
          <Image
            src={product.images[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Discount badge */}
          {discount && (
            <div
              className="absolute top-3 left-3 px-2 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1"
              style={{ background: '#ff3b30' }}
            >
              <Tag size={10} /> -{discount}%
            </div>
          )}

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{
              background: '#0071e3',
              color: '#fff',
              opacity: 0,
              transform: 'translateY(6px)',
              boxShadow: '0 4px 12px rgba(0,113,227,0.4)',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#0077ed')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#0071e3')}
            aria-label="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-md inline-block"
            style={{ background: '#f5f5f7', color: '#86868b' }}
          >
            {product.category?.name}
          </span>

          {/* Name */}
          <h3
            className="mt-2 text-sm font-semibold line-clamp-2 leading-snug"
            style={{ color: '#1d1d1f', minHeight: '2.5rem' }}
          >
            {product.name}
          </h3>

          {/* Rating */}
          {product.averageRating && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={11}
                    className="transition-colors"
                    style={{
                      fill: i <= Math.round(Number(product.averageRating)) ? '#f5c518' : '#e5e5e7',
                      color: i <= Math.round(Number(product.averageRating)) ? '#f5c518' : '#e5e5e7',
                    }}
                  />
                ))}
              </div>
              <span className="text-xs" style={{ color: '#86868b' }}>({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-base font-bold" style={{ color: '#1d1d1f' }}>
                {formatPrice(product.price)}
              </p>
              {product.originalPrice && (
                <p className="text-xs line-through" style={{ color: '#86868b' }}>
                  {formatPrice(product.originalPrice)}
                </p>
              )}
            </div>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-xs font-medium" style={{ color: '#ff9f0a' }}>
                Còn {product.stock}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
