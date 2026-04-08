'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Minus, Plus, ChevronRight, Shield, Truck, Tag, Heart } from 'lucide-react';
import { productsApi, reviewsApi, cartApi } from '@/lib/api';
import { Product, Review, ProductVariant } from '@/types';
import { formatPrice, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { setItems } = useCartStore();
  const { toggle: toggleWishlist, ids: wishlistIds } = useWishlistStore();

  useEffect(() => {
    const slug = params.slug as string;
    productsApi.detail(slug).then(r => {
      setProduct(r.data.data);
      const vMap: Record<string, string> = {};
      (r.data.data.variants || []).forEach((v: ProductVariant) => {
        if (!vMap[v.name]) vMap[v.name] = v.value;
      });
      setSelectedVariants(vMap);
      setLoading(false);
    }).catch(() => setLoading(false));
    reviewsApi.list(slug).then(r => setReviews(r.data.data));
  }, [params.slug]);

  const variantGroups = (product?.variants || []).reduce<Record<string, ProductVariant[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {});

  const getSelectedVariantStock = () => {
    if (!product?.variants?.length) return product?.stock ?? 0;
    const variant = product.variants.find(v =>
      Object.entries(selectedVariants).every(([k, val]) => v.name === k && v.value === val)
    );
    return variant?.stock ?? product?.stock ?? 0;
  };

  const getDisplayPrice = () => {
    if (!product) return 0;
    const variant = product.variants?.find(v =>
      Object.entries(selectedVariants).every(([k, val]) => v.name === k && v.value === val)
    );
    return (product.price as number) + (variant?.priceModifier ?? 0);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const hasVariants = (product.variants?.length ?? 0) > 0;
    if (hasVariants && Object.keys(selectedVariants).length !== Object.keys(variantGroups).length) {
      toast.error('Vui lòng chọn đầy đủ biến thể sản phẩm');
      return;
    }
    try {
      const res = await cartApi.addItem({
        productId: product.id,
        quantity: qty,
        selectedVariant: hasVariants ? selectedVariants : undefined,
      });
      setItems(res.data.data.items || []);
      toast.success('Đã thêm vào giỏ hàng!', { style: { borderRadius: '12px' } });
    } catch {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ');
    }
  };

  if (loading) return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square rounded-2xl animate-pulse bg-[#f5f5f7]" />
          <div className="space-y-4">
            <div className="h-6 w-32 rounded-xl animate-pulse bg-[#f5f5f7]" />
            <div className="h-10 w-3/4 rounded-xl animate-pulse bg-[#f5f5f7]" />
            <div className="h-5 w-48 rounded-xl animate-pulse bg-[#f5f5f7]" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-24">
      <p className="text-[#86868b]">Sản phẩm không tồn tại</p>
    </div>
  );

  const displayPrice = getDisplayPrice();
  const availableStock = getSelectedVariantStock();
  const discount = product.originalPrice ? Math.round((1 - displayPrice / product.originalPrice) * 100) : 0;
  const rating = product.averageRating ? Number(product.averageRating) : 0;
  const ratingDist = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    return { stars, count, pct: reviews.length ? Math.round(count / reviews.length * 100) : 0 };
  });

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-8 text-[#86868b]">
          <Link href="/" className="hover:text-[#1d1d1f] transition-colors">Trang chủ</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-[#1d1d1f] transition-colors">{product.category?.name}</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-[#1d1d1f]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative rounded-2xl overflow-hidden mb-4 aspect-square bg-[#f5f5f7]">
              <Image
                src={product.images[selectedImg] || 'https://via.placeholder.com/600'}
                alt={product.name}
                fill
                className="object-contain"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-[#ff3b30] text-white text-xs font-bold flex items-center gap-1">
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
                    className={`rounded-xl overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-[#0071e3]' : 'border-transparent'}`}
                    style={{ width: 72, height: 72 }}
                  >
                    <Image src={img} alt="" width={72} height={72} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#f5f5f7] text-[#86868b]">
              {product.category?.name}
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold mt-3 leading-tight text-[#1d1d1f] tracking-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={16}
                    className={i <= rating ? 'fill-[#f5c518] text-[#f5c518]' : 'fill-[#e5e5e7] text-[#e5e5e7]'} />
                ))}
              </div>
              <span className="text-sm text-[#86868b]">
                {rating}/5 · {product.reviewCount} đánh giá · {product.sold} đã bán
              </span>
            </div>

            {/* Price */}
            <div className="mt-6">
              <p className="text-3xl font-bold text-[#1d1d1f]">{formatPrice(displayPrice)}</p>
              {product.originalPrice && (
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-base line-through text-[#86868b]">{formatPrice(product.originalPrice)}</p>
                  <span className="text-sm font-bold text-white px-2 py-0.5 rounded-md bg-[#ff3b30]">−{discount}%</span>
                </div>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-2 h-2 rounded-full ${availableStock > 0 ? 'bg-[#34c759]' : 'bg-[#ff3b30]'}`} />
              <span className={`text-sm ${availableStock > 0 ? 'text-[#34c759]' : 'text-[#ff3b30]'}`}>
                {availableStock > 0 ? (availableStock <= 5 ? `Chỉ còn ${availableStock} sản phẩm` : 'Còn hàng') : 'Hết hàng'}
              </span>
            </div>

            {/* Variant selectors */}
            {Object.entries(variantGroups).length > 0 && (
              <div className="mt-6 space-y-4">
                {Object.entries(variantGroups).map(([name, variants]) => (
                  <div key={name}>
                    <p className="text-sm font-medium mb-2 text-[#1d1d1f]">{name}</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map(v => {
                        const isSelected = selectedVariants[name] === v.value;
                        const isOutOfStock = v.stock <= 0;
                        return (
                          <button
                            key={v.id}
                            onClick={() => !isOutOfStock && setSelectedVariants(s => ({ ...s, [name]: v.value }))}
                            disabled={isOutOfStock}
                            className={cn(
                              'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                              isSelected
                                ? 'border-[#0071e3] bg-[#0071e3] text-white'
                                : isOutOfStock
                                  ? 'border-gray-200 bg-gray-50 text-gray-300 line-through cursor-not-allowed'
                                  : 'border-gray-200 text-[#1d1d1f] hover:border-[#0071e3] hover:bg-[#0071e3]/5',
                            )}
                          >
                            {v.value}{v.priceModifier !== 0 && ` (${v.priceModifier > 0 ? '+' : ''}${formatPrice(v.priceModifier)})`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            {availableStock > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-3 text-[#1d1d1f]">Số lượng</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#e5e5e7] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={qty}
                      onChange={e => setQty(Math.max(1, Math.min(availableStock, parseInt(e.target.value) || 1)))}
                      className="w-12 h-10 text-center text-sm font-medium bg-transparent text-[#1d1d1f] outline-none"
                    />
                    <button
                      onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                      className="w-10 h-10 flex items-center justify-center text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-sm text-[#86868b]">Còn {availableStock} sản phẩm</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleAddToCart}
                disabled={availableStock === 0}
                className={`apple-btn-primary flex-1 group/btn disabled:opacity-50 disabled:cursor-not-allowed ${availableStock === 0 ? '' : ''}`}
              >
                <ShoppingCart size={18} /> Thêm vào giỏ hàng
              </button>
              <button
                onClick={() => window.location.href = '/checkout'}
                className="flex-1 h-12 rounded-xl text-sm font-medium border border-[#e5e5e7] text-[#1d1d1f] bg-white hover:bg-[#f5f5f7] transition-all"
              >
                Mua ngay
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await toggleWishlist(product.id);
                    toast.success(wishlistIds.has(product.id) ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích!');
                  } catch { toast.error('Vui lòng đăng nhập'); }
                }}
                className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-all ${wishlistIds.has(product.id)
                    ? 'border-[#ff3b30] text-[#ff3b30] bg-[#fff5f5]'
                    : 'border-[#e5e5e7] text-[#86868b] bg-white hover:bg-[#fff5f5]'
                  }`}
                aria-label="Yêu thích"
              >
                <Heart size={18} className={wishlistIds.has(product.id) ? 'fill-[#ff3b30]' : ''} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f5f5f7]">
              {[
                { icon: Shield, text: 'Bảo hành chính hãng 12 tháng' },
                { icon: Truck, text: 'Giao hàng miễn phí nội thành' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-[#1d1d1f]">
                  <Icon size={14} className="text-[#34c759]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-0 border-b border-[#f0f0f0]">
            {(['desc', 'specs', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-[#0071e3] text-[#0071e3]' : 'border-transparent text-[#86868b]'
                  }`}
              >
                {tab === 'desc' ? 'Mô tả' : tab === 'specs' ? 'Thông số kỹ thuật' : `Đánh giá (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'desc' && (
              <p className="text-base leading-relaxed max-w-3xl text-[#86868b]" style={{ whiteSpace: 'pre-line' }}>
                {product.description}
              </p>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-xl">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specs || {}).map(([key, val], i) => (
                      <tr key={key} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f9f9fb]'}>
                        <td className="py-3 px-4 text-sm font-medium w-44 text-[#86868b]">{key}</td>
                        <td className="py-3 px-4 text-sm font-medium text-[#1d1d1f]">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rating summary */}
                <div className="p-6 rounded-2xl bg-[#f5f5f7]">
                  <div className="text-center mb-6">
                    <p className="text-5xl font-bold text-[#1d1d1f]">{rating}</p>
                    <div className="flex justify-center mt-2 gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} className={i <= rating ? 'fill-[#f5c518] text-[#f5c518]' : 'fill-[#e5e5e7] text-[#e5e5e7]'} />)}
                    </div>
                    <p className="text-sm mt-1 text-[#86868b]">{reviews.length} đánh giá</p>
                  </div>
                  <div className="space-y-2">
                    {ratingDist.map(({ stars, count, pct }) => (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-xs w-8 text-[#86868b]">{stars} ★</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#e5e5e7]">
                          <div className="h-full rounded-full bg-[#f5c518] transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs w-4 text-right text-[#86868b]">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-4">
                  {reviews.length === 0 && (
                    <p className="text-base text-center py-12 text-[#86868b]">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                  )}
                  {reviews.map(review => (
                    <div key={review.id} className="p-4 rounded-2xl border border-[#f0f0f0]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-xs font-bold">
                            {review.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1d1d1f]">{review.user?.name}</p>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} className={i <= review.rating ? 'fill-[#f5c518] text-[#f5c518]' : 'fill-[#e5e5e7] text-[#e5e5e7]'} />)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-[#86868b]">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-[#86868b]">{review.comment}</p>
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