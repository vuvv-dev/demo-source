'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, cn } from '@/lib/utils';
import { User } from '@/types';

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchUsers = () => {
    setLoading(true);
    usersApi.list({ page, limit })
      .then(r => { setUsers(r.data.data); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1d1d1f]">Khách hàng</h1>
        <p className="text-[#86868b] text-sm">{total} khách hàng</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-xs font-semibold text-[#86868b] uppercase">Khách hàng</th>
                <th className="text-left p-4 text-xs font-semibold text-[#86868b] uppercase">Email</th>
                <th className="text-left p-4 text-xs font-semibold text-[#86868b] uppercase">Điện thoại</th>
                <th className="text-left p-4 text-xs font-semibold text-[#86868b] uppercase">Ngày tham gia</th>
                <th className="text-left p-4 text-xs font-semibold text-[#86868b] uppercase">Vai trò</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && users.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="p-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0071e3] rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-sm font-bold">{user.name?.[0]?.toUpperCase() ?? '?'}</span>
                      </div>
                      <span className="text-sm font-medium text-[#1d1d1f]">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#86868b]">{user.email}</td>
                  <td className="p-4 text-sm text-[#86868b]">{user.phone || '—'}</td>
                  <td className="p-4 text-sm text-[#86868b]">{formatDate(user.createdAt)}</td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role === 'admin' ? 'Quản trị' : 'Khách hàng'}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr><td colSpan={5} className="p-8 text-center text-sm text-[#86868b]">Chưa có khách hàng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-[#86868b]">
              Hiển thị {(page - 1) * limit + 1}–{Math.min(page * limit, total)} trong {total} khách hàng
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-xl w-9 h-9 border-gray-200"
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={cn('w-9 h-9 rounded-xl text-sm font-medium transition-all', p === page
                    ? 'bg-[#0071e3] text-white'
                    : 'bg-gray-50 text-[#86868b] hover:bg-gray-100')}>
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
