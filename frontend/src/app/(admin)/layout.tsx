import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff' }}>
      <AdminSidebar />
      <main style={{ flex: 1, marginLeft: '240px', padding: '2rem', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
