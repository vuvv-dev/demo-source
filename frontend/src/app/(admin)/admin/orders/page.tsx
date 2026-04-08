'use client';
import { useEffect, useState } from 'react';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Order } from '@/types';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchOrders = () => {
    setLoading(true);
    ordersApi.list({ status: statusFilter || undefined, page, limit })
      .then(r => { setOrders(r.data.data); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter, page]);

  const totalPages = Math.ceil(total / limit);

  const updateStatus = async (id: string, status: string) => {
    try {
      await ordersApi.updateStatus(id, { status });
      toast.success('Cập nhật trạng thái thành công!');
      fetchOrders();
    } catch { toast.error('Cập nhật thất bại'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-[#1d1d1f]">Đơn hàng</h1><p className="text-[#86868b] text-sm">{total} đơn hàng</p></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(statusLabels).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left p-4 text-xs font-semibold text-[#86868b] uppercase">Mã đơn</th>
              <th className="text-left p-4 text-xs font-semibold text-[#86868b] uppercase">Khách hàng</th>
              <th className="text-left p-4 text-xs font-semibold text-[#86868b] uppercase">Tổng tiền</th>
              <th className="text-left p-4 text-xs font-semibold text-[#86868b] uppercase">Trạng thái</th>
              <th className="text-left p-4 text-xs font-semibold text-[#86868b] uppercase">Ngày đặt</th>
              <th className="text-left p-4 text-xs font-semibold text-[#86868b] uppercase">Cập nhật trạng thái</th>
              <th className="text-right p-4 text-xs font-semibold text-[#86868b] uppercase">Hành động</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4"><span className="text-sm font-mono font-medium text-[#1d1d1f]">{order.orderNumber}</span></td>
                  <td className="p-4"><div><p className="text-sm font-medium text-[#1d1d1f]">{order.user?.name}</p><p className="text-xs text-[#86868b]">{order.user?.email}</p></div></td>
                  <td className="p-4"><span className="text-sm font-bold text-[#1d1d1f]">{formatPrice(order.totalAmount)}</span></td>
                  <td className="p-4"><span className={cn('text-xs font-medium px-2 py-1 rounded-full', statusLabels[order.status]?.color)}>{statusLabels[order.status]?.label}</span></td>
                  <td className="p-4"><span className="text-xs text-[#86868b]">{formatDate(order.createdAt)}</span></td>
                  <td className="p-4">
                    <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                      disabled={order.status === 'delivered' || order.status === 'cancelled'}
                      className="h-8 rounded-lg border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0071e3]/20 disabled:opacity-50">
                      {Object.entries(statusLabels).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="icon" className="text-[#86868b] hover:text-[#0071e3]"><Eye className="w-4 h-4" /></Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && !loading && (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-[#86868b]">Không có đơn hàng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-[#86868b]">
              Hiển thị {(page - 1) * limit + 1}–{Math.min(page * limit, total)} trong {total} đơn hàng
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-xl w-9 h-9 border-gray-200"
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={cn('w-9 h-9 rounded-xl text-sm font-medium transition-all', p === page
                    ? 'bg-[#0071e3] text-white' : 'bg-gray-50 text-[#86868b] hover:bg-gray-100')}>
                  {p}
                </button>
              ))}
              <Button variant="outline" size="icon" className="rounded-xl w-9 h-9 border-gray-200"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
