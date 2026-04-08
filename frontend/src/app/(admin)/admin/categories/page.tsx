'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { categoriesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Category } from '@/types';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image: '' });

  const fetchCategories = () => categoriesApi.list().then(r => setCategories(r.data.data));
  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await categoriesApi.update(editing.id, form); toast.success('Cập nhật thành công!'); }
      else { await categoriesApi.create(form); toast.success('Tạo thành công!'); }
      setShowForm(false); setEditing(null);
      setForm({ name: '', slug: '', description: '', image: '' });
      fetchCategories();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Thao tác thất bại'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa danh mục này?')) return;
    try { await categoriesApi.delete(id); toast.success('Xóa thành công!'); fetchCategories(); } catch { toast.error('Xóa thất bại'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-[#1d1d1f]">Danh mục</h1><p className="text-[#86868b] text-sm">{categories.length} danh mục</p></div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', image: '' }); setShowForm(true); }}
          className="bg-[#0071e3] hover:bg-[#0077ed]"><Plus className="w-4 h-4 mr-2" /> Thêm danh mục</Button>
      </div>
      <Card>
        <div className="divide-y divide-gray-50">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">🍎</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1d1d1f]">{cat.name}</p>
                <p className="text-xs text-[#86868b]">{cat.slug} • {cat.description || 'Không có mô tả'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(cat); setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image: cat.image || '' }); setShowForm(true); }}
                  className="p-2 text-[#86868b] hover:text-[#0071e3] hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(cat.id)}
                  className="p-2 text-[#86868b] hover:text-[#ff3b30] hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100"><h2 className="text-xl font-bold text-[#1d1d1f]">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="text-sm font-medium text-[#1d1d1f] mb-1 block">Tên</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium text-[#1d1d1f] mb-1 block">Slug</label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium text-[#1d1d1f] mb-1 block">Mô tả</label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label className="text-sm font-medium text-[#1d1d1f] mb-1 block">Hình ảnh URL</label><Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} /></div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Hủy</Button>
                <Button type="submit" className="flex-1 bg-[#0071e3] hover:bg-[#0077ed]">{editing ? 'Cập nhật' : 'Tạo'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
