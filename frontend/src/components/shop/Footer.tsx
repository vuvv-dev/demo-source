'use client';
import Link from 'next/link';
import { Heart, Apple } from 'lucide-react';

const footerSections = [
  {
    title: 'Mua Sắm và Tìm Hiểu',
    links: [
      { label: 'Cửa Hàng', href: '/products' },
      { label: 'Mac', href: '/products?categorySlug=mac' },
      { label: 'iPad', href: '/products?categorySlug=ipad' },
      { label: 'iPhone', href: '/products?categorySlug=iphone' },
      { label: 'Watch', href: '/products?categorySlug=apple-watch' },
      { label: 'AirPods', href: '/products?categorySlug=airpods' },
      { label: 'TV & Nhà', href: '#' },
      { label: 'AirTag', href: '#' },
      { label: 'Phụ Kiện', href: '/products?categorySlug=phu-kien' },
      { label: 'Thẻ Quà Tặng', href: '#' },
    ],
  },
  {
    title: 'Ví Apple',
    links: [
      { label: 'Ví', href: '#' },
    ],
    next: {
      title: 'Tài Khoản',
      links: [
        { label: 'Quản Lý Tài Khoản Apple', href: '#' },
        { label: 'Tài Khoản Apple Store', href: '#' },
        { label: 'iCloud.com', href: '#' },
      ],
    }
  },
  {
    title: 'Giải trí',
    links: [
      { label: 'Apple One', href: '#' },
      { label: 'Apple TV+', href: '#' },
      { label: 'Apple Music', href: '#' },
      { label: 'Apple Arcade', href: '#' },
      { label: 'Apple Podcasts', href: '#' },
      { label: 'Apple Books', href: '#' },
      { label: 'App Store', href: '#' },
    ],
  },
  {
    title: 'Apple Store',
    links: [
      { label: 'Ứng Dụng Apple Store', href: '#' },
      { label: 'Tài Chính', href: '#' },
      { label: 'Apple Trade In', href: '#' },
      { label: 'Trạng Thái Đơn Hàng', href: '/orders' },
      { label: 'Hỗ Trợ Mua Hàng', href: '#' },
    ],
  },
  {
    title: 'Dành Cho Doanh Nghiệp',
    links: [
      { label: 'Apple và Doanh Nghiệp', href: '#' },
      { label: 'Mua Sắm Cho Doanh Nghiệp', href: '#' },
    ],
    next: {
      title: 'Cho Giáo Dục',
      links: [
        { label: 'Apple và Giáo Dục', href: '#' },
        { label: 'Mua Hàng Cho Bậc Đại Học', href: '#' },
      ],
    }
  },
  {
    title: 'Dành Cho Chăm Sóc Sức Khỏe',
    links: [
      { label: 'Apple trong Chăm Sóc Sức Khỏe', href: '#' },
      { label: 'Sức khỏe trên Apple Watch', href: '#' },
    ],
    next: {
      title: 'Giá Trị Cốt Lõi',
      links: [
        { label: 'Trợ Năng', href: '#' },
        { label: 'Môi Trường', href: '#' },
        { label: 'Quyền Riêng Tư', href: '#' },
        { label: 'Chuỗi Cung Ứng', href: '#' },
      ],
    }
  },
  {
    title: 'Về Apple',
    links: [
      { label: 'Newsroom', href: '#' },
      { label: 'Lãnh Đạo Của Apple', href: '#' },
      { label: 'Nhà Đầu Tư', href: '#' },
      { label: 'Đạo Đức & Quy Tắc', href: '#' },
      { label: 'Sự Kiện', href: '#' },
      { label: 'Liên Hệ Apple', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#f5f5f7] text-[#1d1d1f] py-5 pt-8 print:hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Footnotes */}
        <section className="text-[12px] text-[#86868b] border-b border-[#d2d2d7] pb-4 mb-4 leading-relaxed space-y-3">
          <p>
            Apple Intelligence khả dụng ở phiên bản beta trên tất cả các kiểu máy iPhone 16, iPhone 15 Pro, iPhone 15 Pro Max, cũng như iPad và Mac trang bị chip M1 trở lên, với ngôn ngữ Siri và thiết bị được đặt thành tiếng Anh (Mỹ), như một bản cập nhật phần mềm iOS 18, iPadOS 18 và macOS Sequoia. Các ngôn ngữ và nền tảng khác sẽ được bổ sung vào năm sau.
            Dịch vụ đổi cũ lấy mới do các đối tác đổi cũ lấy mới của Apple cung cấp. Giá trị đổi cũ lấy mới chỉ là giá ước tính và giá trị thực tế có thể thấp hơn.
            Để truy cập và sử dụng tất cả các tính năng của Apple Card, bạn phải thêm Apple Card vào Ví trên iPhone hoặc iPad chạy phiên bản iOS hoặc iPadOS mới nhất.
            <br />※ Chỉ dành cho người đăng ký mới. 65.000đ/tháng sau khi hết hạn dùng thử. Ưu đãi dành cho người mới đăng ký Apple Music sử dụng thiết bị mới hợp lệ, chỉ trong khoảng thời gian có hạn. Chương trình đổi ưu đãi dành cho các thiết bị nghe hợp lệ yêu cầu phải kết nối hoặc ghép nối với một thiết bị Apple đang chạy hệ điều hành iOS hoặc iPadOS mới nhất. Chương trình đổi ưu đãi dành cho Apple Watch yêu cầu phải kết nối hoặc ghép nối với một iPhone đang chạy hệ điều hành iOS mới nhất. Ưu đãi có hiệu lực trong 3 tháng sau khi kích hoạt thiết bị hợp lệ. Chỉ áp dụng một ưu đãi cho mỗi Tài khoản Apple, bất kể số lượng thiết bị hợp lệ mà bạn mua. Gói đăng ký sẽ tự động gia hạn cho đến khi bị hủy. Có áp dụng hạn chế và các điều khoản khác.
            <br />± Apple Intelligence khả dụng ở phiên bản beta. Một số tính năng không khả dụng ở một số khu vực hoặc ngôn ngữ. Để biết tính năng và ngôn ngữ khả dụng cũng như yêu cầu hệ thống, hãy truy cập support.apple.com/121115(Mở trong cửa sổ mới).
          </p>
        </section>

        {/* Path / Directory */}
        <div className="flex items-center gap-2 text-[12px] text-[#515154] mb-6">
          <Apple size={14} className="opacity-80" />
          <span className="opacity-30">/</span>
          <span>Apple Store Trực Tuyến</span>
        </div>

        {/* Link Grid */}
        <nav className="grid grid-cols-2 md:grid-cols-5 gap-y-10 gap-x-4">
          {footerSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-8">
              <div>
                <h3 className="text-[12px] font-bold mb-2.5 text-[#1d1d1f] tracking-tight">{section.title}</h3>
                <ul className="flex flex-col gap-1.5">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link href={link.href} className="text-[12px] text-[#515154] hover:underline">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {section.next && (
                <div>
                  <h3 className="text-[12px] font-bold mb-2.5 text-[#1d1d1f] tracking-tight">{section.next.title}</h3>
                  <ul className="flex flex-col gap-1.5">
                    {section.next.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link href={link.href} className="text-[12px] text-[#515154] hover:underline">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <section className="mt-10 pt-5 border-t border-[#d2d2d7]">
          <p className="text-[12px] text-[#86868b] mb-4">
            Xem thêm cách để mua hàng: <Link href="#" className="text-[#0066cc] underline">Tìm cửa hàng bán lẻ</Link> gần bạn. Hoặc gọi 1800-1192.
          </p>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pt-5 pb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-x-7 gap-y-2">
              <p className="text-[12px] text-[#86868b]">
                Bản quyền © 2026 Apple Store. Bảo lưu mọi quyền.
              </p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {[
                  { label: 'Chính Sách Quyền Riêng Tư', href: '#' },
                  { label: 'Điều Khoản Sử Dụng', href: '#' },
                  { label: 'Bán Hàng và Hoàn Tiền', href: '#' },
                  { label: 'Pháp Lý', href: '#' },
                  { label: 'Sơ Đồ Trang Web', href: '#' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <Link href={item.href} className="text-[12px] text-[#515154] hover:underline">
                      {item.label}
                    </Link>
                    {i < 4 && <span className="h-3 w-[1px] bg-[#d2d2d7] hidden md:block" />}
                  </li>
                ))}
              </ul>
            </div>

            <Link href="#" className="text-[12px] text-[#515154] hover:underline font-medium">
              Việt Nam
            </Link>
          </div>
        </section>
      </div>
    </footer>
  );
}