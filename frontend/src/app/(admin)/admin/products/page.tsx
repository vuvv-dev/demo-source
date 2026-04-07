'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Product, Category } from '@/types';
import { formatPrice, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', originalPrice: '', stock: '', categoryId: '', images: '', specs: '' });
  const router = useRouter();

  const fetchProducts = () => {
    productsApi.adminList().then(r => setProducts(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    categoriesApi.list().then(r => setCategories(r.data.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = form.images.split('\n').filter(Boolean);
    const specs: Record<string, string> = {};
    form.specs.split('\n').forEach(line => {
      const [key, ...vals] = line.split(':');
      if (key && vals.length) specs[key.trim()] = vals.join(':').trim();
    });
    const data = { ...form, price: +form.price, originalPrice: form.originalPrice ? +form.originalPrice : null, stock: +form.stock, images, specs };
    try {
      if (editing) {
        await productsApi.update(editing.id, data);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await productsApi.create(data);
        toast.success('Tạo sản phẩm thành công!');
      }
      setShowForm(false); setEditing(null);
      setForm({ name: '', slug: '', description: '', price: '', originalPrice: '', stock: '', categoryId: '', images: '', specs: '' });
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      await productsApi.delete(id);
      toast.success('Xóa sản phẩm thành công!');
      fetchProducts();
    } catch { toast.error('Xóa thất bại'); }
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description,
      price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : '',
      stock: String(p.stock), categoryId: p.category?.id || '',
      images: (p.images || []).join('\n'),
      specs: Object.entries(p.specs || {}).map(([k, v]) => `${k}: ${v}`).join('\n'),
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-apple-black">Sản phẩm</h1><p className="text-apple-text-secondary text-sm">{products.length} sản phẩm</p></div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', price: '', originalPrice: '', stock: '', categoryId: '', images: '', specs: '' }); setShowForm(true); }}
          className="bg-apple-blue hover:bg-apple-blue-hover"><Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm</Button>
      </div>

      <Card>
        {loading ? <div className="p-8 text-center"><div className="h-64 bg-gray-100 rounded-xl animate-pulse mx-auto" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left p-4 text-xs font-semibold text-apple-text-secondary uppercase">Sản phẩm</th>
                <th className="text-left p-4 text-xs font-semibold text-apple-text-secondary uppercase">Danh mục</th>
                <th className="text-left p-4 text-xs font-semibold text-apple-text-secondary uppercase">Giá</th>
                <th className="text-left p-4 text-xs font-semibold text-apple-text-secondary uppercase">Tồn kho</th>
                <th className="text-left p-4 text-xs font-semibold text-apple-text-secondary uppercase">Đã bán</th>
                <th className="text-left p-4 text-xs font-semibold text-apple-text-secondary uppercase">Trạng thái</th>
                <th className="text-right p-4 text-xs font-semibold text-apple-text-secondary uppercase">Hành động</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                          {p.images[0] && <Image src={p.images[0]} alt={p.name} width={48} height={48} className="object-cover w-full h-full" />}
                        </div>
                        <div><p className="text-sm font-medium text-apple-black max-w-xs truncate">{p.name}</p><p className="text-xs text-apple-text-secondary">{p.slug}</p></div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-apple-text-secondary">{p.category?.name}</td>
                    <td className="p-4"><p className="text-sm font-bold text-apple-black">{formatPrice(p.price)}</p>{p.originalPrice && <p className="text-xs text-apple-text-secondary line-through">{formatPrice(p.originalPrice)}</p>}</td>
                    <td className="p-4"><span className={cn('text-sm font-medium', p.stock > 0 ? 'text-apple-green' : 'text-apple-red')}>{p.stock}</span></td>
                    <td className="p-4 text-sm text-apple-text-secondary">{p.sold}</td>
                    <td className="p-4"><span className={cn('text-xs font-medium px-2 py-1 rounded-full', p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{p.isActive ? 'Hoạt động' : 'Tắt'}</span></td>
                    <td className="p-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 text-apple-text-secondary hover:text-apple-blue hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-apple-text-secondary hover:text-apple-red hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100"><h2 className="text-xl font-bold text-apple-black">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-apple-black mb-1 block">Tên sản phẩm</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div><label className="text-sm font-medium text-apple-black mb-1 block">Slug</label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required /></div>
              </div>
              <div><label className="text-sm font-medium text-apple-black mb-1 block">Mô tả</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full h-24 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20" required /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-sm font-medium text-apple-black mb-1 block">Giá (VNĐ)</label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required /></div>
                <div><label className="text-sm font-medium text-apple-black mb-1 block">Giá gốc</label><Input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-apple-black mb-1 block">Tồn kho</label><Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required /></div>
              </div>
              <div><label className="text-sm font-medium text-apple-black mb-1 block">Danh mục</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20" required>
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select></div>
              <div><label className="text-sm font-medium text-apple-black mb-1 block">Hình ảnh (mỗi dòng 1 URL)</label><textarea value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} className="w-full h-20 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20" placeholder="https://..." /></div>
              <div><label className="text-sm font-medium text-apple-black mb-1 block">Thông số (key: value, mỗi dòng 1)</label><textarea value={form.specs} onChange={e => setForm(f => ({ ...f, specs: e.target.value }))} className="w-full h-24 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/20" placeholder="Chip: A18 Pro&#10;RAM: 8GB" /></div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Hủy</Button>
                <Button type="submit" className="flex-1 bg-apple-blue hover:bg-apple-blue-hover">{editing ? 'Cập nhật' : 'Tạo sản phẩm'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
