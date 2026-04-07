'use client';
import Link from 'next/link';

const footerLinks = {
  'Sản phẩm': [
    { label: 'iPhone', href: '/products?categorySlug=iphone' },
    { label: 'iPad', href: '/products?categorySlug=ipad' },
    { label: 'Mac', href: '/products?categorySlug=mac' },
    { label: 'AirPods', href: '/products?categorySlug=airpods' },
    { label: 'Apple Watch', href: '/products?categorySlug=apple-watch' },
  ],
  'Hỗ trợ': [
    { label: 'Tra cứu đơn hàng', href: '/orders' },
    { label: 'Chính sách đổi trả', href: '#' },
    { label: 'Bảo hành Apple', href: '#' },
    { label: 'Liên hệ', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: '#f5f5f7', borderTop: '1px solid #e5e5e7' }}>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: '#1d1d1f' }}>
                A
              </div>
              <span className="font-semibold text-base" style={{ color: '#1d1d1f' }}>AppleStore</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#86868b' }}>
              Cửa hàng Apple chính hãng hàng đầu Việt Nam. Sản phẩm chất lượng, bảo hành uy tín, hỗ trợ tận tình.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { label: '100%', desc: 'Chính hãng' },
                { label: '24/7', desc: 'Hỗ trợ' },
                { label: '1 năm', desc: 'Bảo hành' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-sm font-bold" style={{ color: '#0071e3' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: '#86868b' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-4" style={{ color: '#1d1d1f' }}>{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm transition-colors" style={{ color: '#86868b' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#0071e3')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#86868b')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 text-center" style={{ borderTop: '1px solid #e5e5e7' }}>
          <p className="text-xs" style={{ color: '#86868b' }}>
            © 2026 AppleStore Việt Nam. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
