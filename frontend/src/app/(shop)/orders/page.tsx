'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Package, ChevronRight, Search } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const statusConfig: Record<string, {
  label: string;
  bg: string;
  text: string;
  dot: string;
  desc: string;
}> = {
  pending: { label: 'Chờ xử lý', bg: 'bg-amber-50', text: 'text-orange-700', dot: 'bg-orange-400', desc: 'Đơn đang chờ được xác nhận' },
  confirmed: { label: 'Đã xác nhận', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', desc: 'Đơn đã được xác nhận, đang chuẩn bị' },
  shipping: { label: 'Đang giao', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400', desc: 'Đơn đang trên đường giao đến bạn' },
  delivered: { label: 'Đã giao', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400', desc: 'Đơn đã được giao thành công' },
  cancelled: { label: 'Đã hủy', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', desc: 'Đơn đã bị hủy' },
};

const paymentConfig: Record<string, { label: string; paid: boolean }> = {
  paid: { label: 'Đã thanh toán', paid: true },
  pending: { label: 'Chưa thanh toán', paid: false },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    ordersApi.list()
      .then(r => setOrders(r.data.data))
      .catch(() => router.push('/auth/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const cancelOrder = async (id: string) => {
    if (!confirm('Hủy đơn hàng này?')) return;
    try {
      await ordersApi.cancel(id);
      ordersApi.list().then(r => setOrders(r.data.data));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Hủy thất bại');
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const tabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xử lý' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'delivered', label: 'Đã giao' },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#0071e3] shadow-lg shadow-blue-500/20">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-[1.75rem] font-bold text-[#1d1d1f] tracking-tight leading-none">Đơn hàng</h1>
              <p className="text-[13px] text-[#86868b] mt-0.5">{orders.length} đơn hàng</p>
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden shadow-sm mb-6">
          {/* Search bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f5f5f7]">
            <Search size={16} className="text-[#86868b] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo mã đơn hàng..."
              className="flex-1 bg-transparent text-sm text-[#1d1d1f] placeholder:text-[#86868b] outline-none"
            />
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${filter === tab.key
                  ? 'border-[#0071e3] text-[#0071e3] bg-[#eff6ff]'
                  : 'border-transparent text-[#86868b] hover:text-[#1d1d1f] hover:bg-gray-50'
                  }`}
              >
                {tab.label}
                {tab.key !== 'all' && counts[tab.key] ? (
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${filter === tab.key ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'bg-gray-100 text-[#86868b]'
                    }`}>
                    {counts[tab.key]}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Order list */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden animate-pulse">
                <div className="flex items-center justify-between p-5 border-b border-[#f5f5f7]">
                  <div className="space-y-2">
                    <div className="h-3 w-28 skeleton rounded-lg" />
                    <div className="h-2.5 w-20 skeleton rounded-lg" />
                  </div>
                  <div className="h-6 w-24 skeleton rounded-full" />
                </div>
                <div className="flex gap-3 p-5">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-14 h-14 skeleton rounded-xl shrink-0" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-white border border-[#f0f0f0]">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} className="text-[#d1d5db]" />
            </div>
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-1.5">
              {search ? 'Không tìm thấy đơn hàng' : filter === 'all' ? 'Chưa có đơn hàng nào' : 'Không có đơn hàng ở trạng thái này'}
            </h2>
            <p className="text-sm text-[#86868b] mb-6">
              {search ? `Không tìm thấy đơn hàng nào cho "${search}"` : 'Hãy bắt đầu mua sắm nhé!'}
            </p>
            {search ? (
              <button onClick={() => setSearch('')} className="apple-btn-outline text-sm px-5 h-10">Xóa tìm kiếm</button>
            ) : (
              <Link href="/products">
                <button className="apple-btn-primary text-sm px-6 h-11">Mua sắm ngay</button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {filtered.map(order => {
              const st = statusConfig[order.status] || statusConfig.pending;
              const pm = paymentConfig[order.paymentStatus] || paymentConfig.pending;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 group">
                  {/* Card header */}
                  <div className="flex items-center justify-between p-5 border-b border-[#f5f5f7]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex items-center justify-center shrink-0 group-hover:bg-[#eff6ff] transition-colors">
                        <div className={`w-2 h-2 rounded-full ${st.dot}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[13px] font-semibold text-[#1d1d1f]">{order.orderNumber}</span>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                          {pm.paid && order.paymentMethod !== 'cod' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#16a34a]">
                              ✓ {pm.label}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#86868b] mt-0.5">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-[15px] font-bold text-[#1d1d1f]">{formatPrice(order.totalAmount)}</p>
                        <p className="text-[11px] text-[#86868b]">{order.items.length} sản phẩm</p>
                      </div>
                      <Link href={`/orders/${order.id}`}>
                        <button className="w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-[#86868b] group-hover:bg-[#0071e3] group-hover:text-white group-hover:shadow-md transition-all duration-200">
                          <ChevronRight size={16} />
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Product thumbnails */}
                  <div className="flex items-center gap-3 p-5 overflow-x-auto no-scrollbar">
                    {order.items.slice(0, 5).map(item => (
                      <Link key={item.id} href={`/orders/${order.id}`} className="shrink-0 group/thumb">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f5f5f7] border border-[#f0f0f0] group-hover/thumb:border-[#0071e3]/30 transition-all group-hover/thumb:shadow-md">
                          <Image
                            src={item.productImage || 'https://via.placeholder.com/60'}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/5 transition-colors" />
                        </div>
                      </Link>
                    ))}
                    {order.items.length > 5 && (
                      <div className="w-14 h-14 rounded-xl bg-[#f5f5f7] border border-[#f0f0f0] flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-semibold text-[#86868b]">+{order.items.length - 5}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 ml-auto shrink-0">
                      <p className="text-[15px] font-bold text-[#1d1d1f] sm:hidden">{formatPrice(order.totalAmount)}</p>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="h-8 px-3 rounded-lg text-[11px] font-semibold text-[#ff3b30] bg-[#fef2f2] hover:bg-red-50 hover:shadow-sm transition-all"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
