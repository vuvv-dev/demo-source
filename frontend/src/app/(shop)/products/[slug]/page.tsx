'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Minus, Plus, ChevronRight, Shield, Truck, Tag } from 'lucide-react';
import { productsApi, reviewsApi, cartApi } from '@/lib/api';
import { Product, Review } from '@/types';
import { formatPrice, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const { setItems } = useCartStore();

  useEffect(() => {
    const slug = params.slug as string;
    productsApi.detail(slug).then(r => { setProduct(r.data.data); setLoading(false); }).catch(() => setLoading(false));
    reviewsApi.list(slug).then(r => setReviews(r.data.data));
  }, [params.slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      const res = await cartApi.addItem({ productId: product.id, quantity: qty });
      setItems(res.data.data.items || []);
      toast.success('Đã thêm vào giỏ hàng!', { style: { borderRadius: '12px' } });
    } catch {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ');
    }
  };

  if (loading) return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square rounded-2xl animate-pulse" style={{ background: '#f5f5f7' }} />
          <div className="space-y-4">
            <div className="h-6 w-32 rounded-xl animate-pulse" style={{ background: '#f5f5f7' }} />
            <div className="h-10 w-3/4 rounded-xl animate-pulse" style={{ background: '#f5f5f7' }} />
            <div className="h-5 w-48 rounded-xl animate-pulse" style={{ background: '#f5f5f7' }} />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-24">
      <p style={{ color: '#86868b' }}>Sản phẩm không tồn tại</p>
    </div>
  );

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const rating = product.averageRating ? Number(product.averageRating) : 0;
  const ratingDist = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    return { stars, count, pct: reviews.length ? Math.round(count / reviews.length * 100) : 0 };
  });

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-8" style={{ color: '#86868b' }}>
          <Link href="/" className="hover:text-dark">Trang chủ</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-dark">{product.category?.name}</Link>
          <ChevronRight size={12} />
          <span style={{ color: '#1d1d1f', fontWeight: 500 }}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div
              className="relative rounded-2xl overflow-hidden mb-4"
              style={{ aspectRatio: '1/1', background: '#f5f5f7' }}
            >
              <Image
                src={product.images[selectedImg] || 'https://via.placeholder.com/600'}
                alt={product.name}
                fill
                className="object-contain"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1" style={{ background: '#ff3b30' }}>
                  <Tag size={11} /> -{discount}%
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className="rounded-xl overflow-hidden border-2 transition-all"
                    style={{
                      borderColor: selectedImg === i ? '#0071e3' : 'transparent',
                      width: 72, height: 72,
                    }}
                  >
                    <Image src={img} alt="" width={72} height={72} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: '#f5f5f7', color: '#86868b' }}>
              {product.category?.name}
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold mt-3 leading-tight" style={{ color: '#1d1d1f', letterSpacing: '-0.02em' }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={16}
                    style={{ fill: i <= rating ? '#f5c518' : '#e5e5e7', color: i <= rating ? '#f5c518' : '#e5e5e7' }} />
                ))}
              </div>
              <span className="text-sm" style={{ color: '#86868b' }}>
                {rating}/5 · {product.reviewCount} đánh giá · {product.sold} đã bán
              </span>
            </div>

            {/* Price */}
            <div className="mt-6">
              <p className="text-3xl font-bold" style={{ color: '#1d1d1f' }}>{formatPrice(product.price)}</p>
              {product.originalPrice && (
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-base line-through" style={{ color: '#86868b' }}>{formatPrice(product.originalPrice)}</p>
                  <span className="text-sm font-bold text-white px-2 py-0.5 rounded-md" style={{ background: '#ff3b30' }}>−{discount}%</span>
                </div>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full" style={{ background: product.stock > 0 ? '#34c759' : '#ff3b30' }} />
              <span className="text-sm" style={{ color: product.stock > 0 ? '#34c759' : '#ff3b30' }}>
                {product.stock > 0 ? (product.stock <= 5 ? `Chỉ còn ${product.stock} sản phẩm` : 'Còn hàng') : 'Hết hàng'}
              </span>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-3" style={{ color: '#1d1d1f' }}>Số lượng</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: '#e5e5e7' }}>
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center transition-colors"
                      style={{ color: '#1d1d1f' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#f5f5f7')}
                      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={qty}
                      onChange={e => setQty(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="w-12 h-10 text-center text-sm font-medium border-0 outline-none"
                      style={{ background: 'transparent', color: '#1d1d1f' }}
                    />
                    <button
                      onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                      className="w-10 h-10 flex items-center justify-center transition-colors"
                      style={{ color: '#1d1d1f' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#f5f5f7')}
                      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-sm" style={{ color: '#86868b' }}>Còn {product.stock} sản phẩm</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 h-12 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: product.stock > 0 ? '#0071e3' : '#d1d5db', color: '#fff' }}
                onMouseEnter={e => { if (product.stock > 0) ((e.currentTarget as HTMLButtonElement).style.background = '#0077ed'); }}
                onMouseLeave={e => { if (product.stock > 0) ((e.currentTarget as HTMLButtonElement).style.background = '#0071e3'); }}
              >
                <ShoppingCart size={18} /> Thêm vào giỏ hàng
              </button>
              <button
                onClick={() => window.location.href = '/checkout'}
                className="flex-1 h-12 rounded-xl text-sm font-medium border transition-all"
                style={{ borderColor: '#e5e5e7', color: '#1d1d1f', background: '#fff' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#f5f5f7')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#fff')}
              >
                Mua ngay
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ background: '#f5f5f7' }}>
              {[
                { icon: Shield, text: 'Bảo hành chính hãng 12 tháng' },
                { icon: Truck, text: 'Giao hàng miễn phí nội thành' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm" style={{ color: '#1d1d1f' }}>
                  <Icon size={14} style={{ color: '#34c759' }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-0 border-b" style={{ borderColor: '#f0f0f0' }}>
            {(['desc', 'specs', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
                style={{
                  borderBottomColor: activeTab === tab ? '#0071e3' : 'transparent',
                  color: activeTab === tab ? '#0071e3' : '#86868b',
                }}
              >
                {tab === 'desc' ? 'Mô tả' : tab === 'specs' ? 'Thông số kỹ thuật' : `Đánh giá (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'desc' && (
              <p className="text-base leading-relaxed max-w-3xl" style={{ color: '#86868b', whiteSpace: 'pre-line' }}>
                {product.description}
              </p>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-xl">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specs || {}).map(([key, val], i) => (
                      <tr key={key} style={{ background: i % 2 === 0 ? '#ffffff' : '#f9f9fb' }}>
                        <td className="py-3 px-4 text-sm font-medium w-44" style={{ color: '#86868b', borderRadius: `${i===0?'8px 0 0 8px':'0'} ${i===Object.keys(product.specs||{}).length-1?'0 8px 8px 0':'0'}` }}>
                          {key}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium" style={{ color: '#1d1d1f' }}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rating summary */}
                <div className="p-6 rounded-2xl" style={{ background: '#f5f5f7' }}>
                  <div className="text-center mb-6">
                    <p className="text-5xl font-bold" style={{ color: '#1d1d1f' }}>{rating}</p>
                    <div className="flex justify-center mt-2 gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} size={18} style={{ fill: i <= rating ? '#f5c518' : '#e5e5e7', color: i <= rating ? '#f5c518' : '#e5e5e7' }} />)}
                    </div>
                    <p className="text-sm mt-1" style={{ color: '#86868b' }}>{reviews.length} đánh giá</p>
                  </div>
                  <div className="space-y-2">
                    {ratingDist.map(({ stars, count, pct }) => (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-xs w-8" style={{ color: '#86868b' }}>{stars} ★</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#e5e5e7' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#f5c518' }} />
                        </div>
                        <span className="text-xs w-4 text-right" style={{ color: '#86868b' }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-4">
                  {reviews.length === 0 && (
                    <p className="text-base text-center py-12" style={{ color: '#86868b' }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                  )}
                  {reviews.map(review => (
                    <div key={review.id} className="p-4 rounded-2xl border" style={{ borderColor: '#f0f0f0' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#0071e3' }}>
                            {review.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#1d1d1f' }}>{review.user?.name}</p>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(i => <Star key={i} size={10} style={{ fill: i <= review.rating ? '#f5c518' : '#e5e5e7', color: i <= review.rating ? '#f5c518' : '#e5e5e7' }} />)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs" style={{ color: '#86868b' }}>
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#86868b' }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
