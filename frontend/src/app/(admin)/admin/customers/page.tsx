'use client';
import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { User } from '@/types';

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.list().then(r => setUsers(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-apple-black">Khách hàng</h1><p className="text-apple-text-secondary text-sm">{users.length} khách hàng</p></div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left p-4 text-xs font-semibold text-apple-text-secondary uppercase">Khách hàng</th>
              <th className="text-left p-4 text-xs font-semibold text-apple-text-secondary uppercase">Email</th>
              <th className="text-left p-4 text-xs font-semibold text-apple-text-secondary uppercase">Điện thoại</th>
              <th className="text-left p-4 text-xs font-semibold text-apple-text-secondary uppercase">Ngày tham gia</th>
              <th className="text-left p-4 text-xs font-semibold text-apple-text-secondary uppercase">Vai trò</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-apple-blue rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-sm font-bold">{user.name[0]?.toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-apple-black">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-apple-text-secondary">{user.email}</td>
                  <td className="p-4 text-sm text-apple-text-secondary">{user.phone || '—'}</td>
                  <td className="p-4 text-sm text-apple-text-secondary">{formatDate(user.createdAt)}</td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role === 'admin' ? 'Quản trị' : 'Khách hàng'}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr><td colSpan={5} className="p-8 text-center text-sm text-apple-text-secondary">Chưa có khách hàng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
