import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Product } from '../products/product.entity';
import { ProductVariant } from '../products/product-variant.entity';
import { Category } from '../categories/category.entity';
import { Review } from '../reviews/review.entity';
import { User } from '../users/user.entity';
import { Cart } from '../cart/cart.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private defaultCustomer: User | null = null;

  // Configurable via env vars: SEED_PRODUCT_COUNT (default: 200)
  private readonly PRODUCT_COUNT = parseInt(process.env.SEED_PRODUCT_COUNT || '200', 10);
  private readonly ENABLE_AUTO_SEED = process.env.SEED_ON_STARTUP !== 'false';

  async onModuleInit() {
    if (!this.ENABLE_AUTO_SEED) {
      console.log('⏩ SEED_ON_STARTUP=false — skipping auto-seed');
      return;
    }
    await this.seed();
  }

  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductVariant) private variantRepo: Repository<ProductVariant>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
  ) { }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC ENTRY POINT
  // ─────────────────────────────────────────────────────────────────────────
  async seed() {
    console.log('🌱 Starting seed...');
    const start = Date.now();

    await this.seedUsers();
    await this.seedCategories();
    await this.seedProducts();

    const elapsed = Date.now() - start;
    const total = await this.productRepo.count();
    console.log(`✅ Seed complete in ${elapsed}ms — ${total} products in DB (target: ${this.PRODUCT_COUNT})`);
    return { success: true, total, elapsed, target: this.PRODUCT_COUNT };
  }

  async clearAll() {
    // Clear in correct FK order: reviews → variants → products → categories
    // CartItems are cascade-deleted via onDelete: CASCADE on Product FK (added to cart-item.entity)
    await this.cartRepo.createQueryBuilder().delete().execute();
    await this.reviewRepo.createQueryBuilder().delete().execute();
    await this.variantRepo.createQueryBuilder().delete().execute();
    await this.productRepo.createQueryBuilder().delete().execute();
    await this.categoryRepo.createQueryBuilder().delete().execute();
    await this.userRepo.createQueryBuilder().delete().execute();
    console.log('🗑️  All data cleared');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────────────────────────────────────
  private async seedUsers() {
    let admin = await this.userRepo.findOne({ where: { email: 'admin@apple-store.vn' } });
    if (!admin) {
      const adminHash = await bcrypt.hash('Admin@123', 10);
      admin = await this.userRepo.save({ email: 'admin@apple-store.vn', password: adminHash, name: 'Store Admin', role: 'admin', phone: '0901234567' } as any);
      await this.cartRepo.save({ user: admin } as any);
    }

    let customer = await this.userRepo.findOne({ where: { email: 'customer@test.vn' } });
    if (!customer) {
      const userHash = await bcrypt.hash('Test@123', 10);
      customer = await this.userRepo.save({ email: 'customer@test.vn', password: userHash, name: 'Nguyễn Văn A', role: 'customer', phone: '0912345678', address: '123 Nguyễn Trãi, Quận 1, TP.HCM' } as any);
      await this.cartRepo.save({ user: customer } as any);
    }
    this.defaultCustomer = customer;
    console.log(`  👤 Users seeded (Admin & Customer)`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORIES
  // ─────────────────────────────────────────────────────────────────────────
  private async seedCategories() {
    const categories = [
      {
        name: 'iPhone',
        slug: 'iphone',
        description: 'Điện thoại iPhone chính hãng Apple',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        metadata: { bannerColor: '#1d1d1f', icon: '📱' },
      },
      {
        name: 'Mac',
        slug: 'mac',
        description: 'Máy tính MacBook, iMac, Mac mini',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        metadata: { bannerColor: '#1d1d1f', icon: '💻' },
      },
      {
        name: 'iPad',
        slug: 'ipad',
        description: 'Máy tính bảng iPad',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
        metadata: { bannerColor: '#1d1d1f', icon: '📲' },
      },
      {
        name: 'Apple Watch',
        slug: 'apple-watch',
        description: 'Đồng hồ thông minh Apple Watch',
        image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
        metadata: { bannerColor: '#1d1d1f', icon: '⌚' },
      },
      {
        name: 'AirPods',
        slug: 'airpods',
        description: 'Tai nghe AirPods',
        image: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=400',
        metadata: { bannerColor: '#1d1d1f', icon: '🎧' },
      },
      {
        name: 'Phụ Kiện',
        slug: 'phu-kien',
        description: 'Phụ kiện chính hãng Apple và OEM',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
        metadata: { bannerColor: '#1d1d1f', icon: '🔌' },
      },
      {
        name: 'TV & Giải Trí',
        slug: 'tv',
        description: 'Apple TV và thiết bị giải trí',
        image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400',
        metadata: { bannerColor: '#1d1d1f', icon: '📺' },
      },
      {
        name: 'Android',
        slug: 'android',
        description: 'Điện thoại Samsung, Xiaomi, OPPO, Vivo',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
        metadata: { bannerColor: '#1428a0', icon: '📱' },
      },
      {
        name: 'Laptop',
        slug: 'laptop',
        description: 'Laptop Dell, Lenovo, HP, ASUS, Acer',
        image: 'https://images.unsplash.com/photo-1496181133206-85ce8bf82248?w=400',
        metadata: { bannerColor: '#1d1d1f', icon: '💻' },
      },
      {
        name: 'Tablet',
        slug: 'tablet',
        description: 'Samsung Galaxy Tab, Xiaomi Pad, OPPO Pad',
        image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400',
        metadata: { bannerColor: '#1d1d1f', icon: '📲' },
      },
      {
        name: 'Tai Nghe',
        slug: 'tai-nghe',
        description: 'Tai nghe Sony, Bose, JBL, Samsung, Xiaomi',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        metadata: { bannerColor: '#1d1d1f', icon: '🎧' },
      },
      {
        name: 'Loa & Âm Thanh',
        slug: 'loa-am-thanh',
        description: 'Loa Bluetooth, loa thông minh, soundbar',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
        metadata: { bannerColor: '#1d1d1f', icon: '🔊' },
      },
      {
        name: 'Camera',
        slug: 'camera',
        description: 'Máy ảnh Canon, Sony, Fujifilm, action camera',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
        metadata: { bannerColor: '#1d1d1f', icon: '📷' },
      },
      {
        name: 'Gaming',
        slug: 'gaming',
        description: 'Tay cầm, tai nghe gaming, bàn phím, chuột gaming',
        image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400',
        metadata: { bannerColor: '#7b2cbf', icon: '🎮' },
      },
      {
        name: 'Smart Home',
        slug: 'smart-home',
        description: 'Đèn thông minh, camera giám sát, router, thiết bị IoT',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        metadata: { bannerColor: '#1d1d1f', icon: '🏠' },
      },
    ];

    for (const cat of categories) {
      const existing = await this.categoryRepo.findOne({ where: { slug: cat.slug } });
      if (!existing) {
        await this.categoryRepo.save(this.categoryRepo.create(cat));
      }
    }
    console.log(`  📂 ${categories.length} categories seeded`);
  }

  private async seedProducts() {
    const cats = await this.categoryRepo.find();
    const catMap = Object.fromEntries(cats.map(c => [c.slug, c]));

    const generators = [
      { name: 'iPhone',       gen: () => this.genIPhones(catMap['iphone']) },
      { name: 'Mac',          gen: () => this.genMacs(catMap['mac']) },
      { name: 'iPad',         gen: () => this.genIPads(catMap['ipad']) },
      { name: 'Apple Watch',  gen: () => this.genWatches(catMap['apple-watch']) },
      { name: 'AirPods',      gen: () => this.genAirPods(catMap['airpods']) },
      { name: 'Phụ Kiện',     gen: () => this.genAccessories(catMap['phu-kien']) },
      { name: 'TV & Giải Trí',gen: () => this.genTV(catMap['tv']) },
    ];

    let totalSeeded = 0;
    let displayOrder = 10000; // Descending — newer series get higher numbers (shown first)
    for (const { name, gen } of generators) {
      const products = gen();
      for (const p of products) {
        await this.createProduct({ ...p, displayOrder } as any);
        displayOrder--;
        totalSeeded++;
      }
      console.log(`  📦 [${name}] seeded ${products.length} products`);
    }

    console.log(`🏗️ Total products seeded: ${totalSeeded}`);
  }

  private async createProduct(data: {
    name: string; slug: string; description: string; tagline: string;
    shortDescription: string; price: number; originalPrice?: number;
    images: string[]; stock: number; sold: number;
    specs: Record<string, string>; whatsInTheBox: string;
    category: Category; extraMetadata?: Record<string, any>;
    variants?: Partial<ProductVariant>[];
    tags?: string[];
    displayOrder?: number;
  }) {
    const existing = await this.productRepo.findOne({ where: { slug: data.slug } });
    if (existing) return existing;

    const product = await this.productRepo.save(
      this.productRepo.create({
        name: data.name,
        slug: data.slug,
        description: data.description,
        tagline: data.tagline,
        shortDescription: data.shortDescription,
        price: data.price,
        originalPrice: data.originalPrice,
        images: data.images,
        stock: data.stock,
        sold: data.sold,
        specs: data.specs,
        whatsInTheBox: data.whatsInTheBox,
        category: data.category,
        featuredImage: data.images[0],
        extraMetadata: data.extraMetadata ?? {},
        isActive: true,
        displayOrder: data.displayOrder ?? 0,
      }),
    );

    // Create variants
    if (data.variants?.length) {
      for (const v of data.variants) {
        await this.variantRepo.save(
          this.variantRepo.create({ ...v, product } as Partial<ProductVariant>),
        );
      }
    }

    // Seed reviews
    await this.seedReviews(product.id, data.sold);

    return product;
  }

  private async seedReviews(productId: string, sold: number) {
    const count = Math.min(Math.floor(sold * 0.3), 20);
    const comments = [
      'Sản phẩm tuyệt vời, giao hàng nhanh, đóng gói cẩn thận!',
      'Chất lượng rất tốt, đúng như mô tả. Sẽ ủng hộ tiếp.',
      'Mình dùng được vài tuần rồi, rất hài lòng. Đáng mua!',
      'Sản phẩm chính hãng, bảo hành đầy đủ. Cảm ơn shop!',
      'Giá hợp lý hơn nhiều nơi khác. Giao trước dự kiến 2 ngày.',
      'Đẹp, nhẹ, dùng rất mượt. Không có gì để phàn nàn.',
      'Mua làm quà tặng, người nhận rất thích. Recommend!',
      'Pin trâu, camera chụp đẹp, màn hình sáng rõ.',
      'Mình là fan Apple từ lâu, lần này mua online lần đầu — không thất vọng.',
      'Hàng mới 100%, seal nguyên vẹn. Hoàn hảo!',
    ];

    for (let i = 0; i < count; i++) {
      const rating = [4, 4, 5, 5, 5, 3, 5, 4, 5, 4][Math.floor(Math.random() * 10)];
      await this.reviewRepo.save(
        this.reviewRepo.create({
          productId,
          rating,
          comment: comments[Math.floor(Math.random() * comments.length)],
          userId: `seed-user-${i}`,
        } as any),
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRODUCT GENERATORS
  // ─────────────────────────────────────────────────────────────────────────
  private genIPhones(cat: Category) {
    return [
      // ── iPhone 16 Series ──────────────────────────────────────────────────
      {
        name: 'iPhone 16 Pro', slug: 'iphone-16-pro',
        tagline: 'Titan. Hiệu năng. Đẳng cấp.', shortDescription: 'Chip A18 Pro — Hiệu năng vượt trội',
        price: 34990000, originalPrice: 37990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max.png',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-3.png',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-4.png',
        ],
        stock: 45, sold: 312,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 16 Pro — Đỉnh cao titanium, trí tuệ nhân tạo thực thụ</h2>
    <p>Khung titanium Grade 5 siêu nhẹ bao quanh màn hình Super Retina XDR 6.3 inch với ProMotion 120Hz tự điều chỉnh — mượt mà tuyệt đối từ menu đến game 3D. Phiên bản nhỏ gọn nhất trong dòng Pro 2024, nhưng không thiếu bất kỳ tính năng nào.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip A18 Pro — AI đến từ tương lai</h3>
    <ul>
      <li>CPU 6 lõi: nhanh hơn 15% so với A17 Pro</li>
      <li>GPU 6 lõi: ray tracing tăng tốc 2x, Metal 4 full support</li>
      <li>Neural Engine 16 lõi: Apple Intelligence xử lý on-device tức thì</li>
      <li>RAM 8GB LPDDR5X: đa nhiệm không giật, giữ ứng dụng mượt mà</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Hệ thống camera Pro — Nhiếp ảnh không giới hạn</h3>
    <ul>
      <li><strong>Camera Fusion 48MP</strong> f/1.78 — sensor 1/1.28", chụp đẹp cả đêm tối</li>
      <li><strong>Camera Ultra Wide 48MP</strong> f/2.2 — macro 12mm, chụp cận cảnh từ 2cm</li>
      <li><strong>Camera Telephoto 5x</strong> 120mm, f/2.8 — zoom quang học siêu nét từ xa</li>
      <li>Video ProRes 4K 120fps với Log encoding — chất lượng điện ảnh ngay trong túi</li>
      <li>Camera Control vật lý — chụp ảnh, quay video, điều chỉnh zoom mà không cần chạm màn hình</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế và Màn hình</h3>
    <ul>
      <li>Titanium Grade 5 bốn cạnh — nhẹ hơn iPhone 14 Pro, cứng hơn thép</li>
      <li>Ceramic Shield mặt trước — bền hơn kính smartphone thông thường 4 lần</li>
      <li>Always-On Display — thời gian, thông báo hiển thị 24/7 tiết kiệm pin</li>
      <li>Dynamic Island — đảo động tương tác, hiển thị Live Activities theo thời gian thực</li>
      <li>Chống nước IP68, ngâm 6m trong 30 phút</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin và Kết nối</h3>
    <p>Pin xem video liên tục đến 27 giờ. Sạc MagSafe 25W và USB-C PD 3.0. Kết nối USB 3 tốc độ 10Gb/s — sao lưu video ProRes trong vài giây.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 16 Pro, Cáp USB-C sang USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.3" Super Retina XDR, ProMotion 120Hz',
          'Chip': 'A18 Pro',
          'RAM': '8GB',
          'Dung lượng': '256GB / 512GB / 1TB',
          'Camera': '48MP Fusion + 12MP Ultra Wide + 5x Telephoto',
          'Pin': 'Video lên đến 27 giờ',
          'Kết nối': 'USB 3 (USB-C)',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '256GB', priceModifier: 0, stock: 20 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 5000000, stock: 15 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 10000000, stock: 10 },
          { name: 'Màu sắc', value: 'Titan Tự Nhiên', colorHex: '#b8b0a8', stock: 15 },
          { name: 'Màu sắc', value: 'Titan Trắng', colorHex: '#e8e4df', stock: 15 },
          { name: 'Màu sắc', value: 'Titan Đen', colorHex: '#3a3a3c', stock: 10 },
          { name: 'Màu sắc', value: 'Titan Sa Mạc', colorHex: '#c4a882', stock: 5 },
        ],
        extraMetadata: {
          badge: 'Bán chạy',
          chip: 'A18 Pro',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 284,
          searchKeywords: ['iphone 16 pro', 'apple flagship', 'pro model', 'camera control'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          promotionalCopy: 'Titan Grade 5 — Đẳng cấp không giới hạn',
          isNew: true,
          isHot: true,
        },
      },
      {
        name: 'iPhone 16 Pro Max', slug: 'iphone-16-pro-max',
        tagline: 'Lớn hơn. Mạnh hơn.', shortDescription: 'Màn hình 6.9 inch — Pin lâu nhất từng có',
        price: 39990000, originalPrice: 43990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-3_1.png',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-4_1.png',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-9_1.png',
        ],
        stock: 30, sold: 198,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 16 Pro Max — Màn hình lớn nhất, pin lâu nhất, camera mạnh nhất</h2>
    <p>Với màn hình Super Retina XDR 6.9 inch ProMotion 120Hz lớn nhất từ trước đến nay trên iPhone, viền mỏng kỷ lục giúp thân máy nhỏ gọn hơn so với iPhone 15 Pro Max dù màn hình lớn hơn đáng kể. Đây là iPhone dành cho những ai muốn tất cả.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip A18 Pro — Sức mạnh vượt cấp</h3>
    <ul>
      <li>CPU 6 lõi nhanh hơn 15%, GPU 6 lõi với ray tracing tăng tốc 2 lần</li>
      <li>Neural Engine 16 lõi — Apple Intelligence on-device, không cần gửi dữ liệu lên cloud</li>
      <li>RAM 8GB LPDDR5X — chạy đồng thời nhiều ứng dụng nặng không giật lag</li>
      <li>Hiệu năng gaming ngang PC: hỗ trợ đầy đủ các tựa game console AAA</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera Pro Max — Studio trong túi quần</h3>
    <ul>
      <li><strong>Camera Fusion 48MP</strong> f/1.78 — sensor lớn nhất trên iPhone, chụp tối xuất sắc</li>
      <li><strong>Camera Ultra Wide 48MP</strong> — macro 12mm, chụp chi tiết nhỏ nhất</li>
      <li><strong>Telephoto 5x quang học</strong> 120mm f/2.8 — zoom siêu nét, không nhiễu hạt</li>
      <li>ProRes 4K 120fps + Log video encoding — hậu kỳ chuyên nghiệp trực tiếp trên máy</li>
      <li>Camera Control — nút vật lý điều khiển camera, chụp bằng một tay dễ dàng</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin và Sạc</h3>
    <ul>
      <li>Pin xem video đến 33 giờ — kỷ lục mọi thời đại trên iPhone</li>
      <li>Sạc MagSafe 25W, sạc không dây Qi2 15W</li>
      <li>USB 3 (USB-C) tốc độ 10Gb/s — chuyển video 1GB chỉ mất vài giây</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế Titanium</h3>
    <p>Titanium Grade 5 bốn cạnh, Ceramic Shield mặt trước bền gấp 4 lần kính thường, mặt kính sau texture mới. IP68 chống nước sâu 6m. Dynamic Island và Always-On Display.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 16 Pro Max, Cáp USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.9" Super Retina XDR, ProMotion 120Hz',
          'Chip': 'A18 Pro',
          'RAM': '8GB',
          'Dung lượng': '256GB / 512GB / 1TB',
          'Camera': '48MP Fusion + 12MP Ultra Wide + 5x Telephoto',
          'Pin': 'Video lên đến 33 giờ',
          'Kết nối': 'USB 3 (USB-C)',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '256GB', priceModifier: 0, stock: 10 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 5000000, stock: 10 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 10000000, stock: 10 },
          { name: 'Màu sắc', value: 'Titan Tự Nhiên', colorHex: '#b8b0a8', stock: 8 },
          { name: 'Màu sắc', value: 'Titan Trắng', colorHex: '#e8e4df', stock: 8 },
          { name: 'Màu sắc', value: 'Titan Đen', colorHex: '#3a3a3c', stock: 8 },
          { name: 'Màu sắc', value: 'Titan Sa Mạc', colorHex: '#c4a882', stock: 6 },
        ],
        extraMetadata: {
          badge: 'Mới',
          chip: 'A18 Pro',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 176,
          searchKeywords: ['iphone 16 pro max', 'large screen', 'max', 'camera control'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: 'Pin 33 giờ — iPhone lớn nhất lịch sử',
        },
      },
      {
        name: 'iPhone 16', slug: 'iphone-16',
        tagline: 'Hoàn toàn mới. Hoàn toàn iPhone.', shortDescription: 'Chip A18 — Camera 48MP — Nút Camera Control',
        price: 22990000, originalPrice: 24990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-1.png',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-4.png',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-6.png',
        ],
        stock: 80, sold: 540,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 16 — Chip A18, Camera 48MP, Dynamic Island thế hệ mới</h2>
    <p>iPhone 16 không chỉ là bản nâng cấp — đây là sự tái định nghĩa hoàn toàn dòng iPhone tiêu chuẩn. Chip A18 mạnh ngang ngửa Pro năm ngoái, camera 48MP lần đầu có mặt trên dòng base, và Camera Control vật lý hoàn toàn mới. iOS 18 với Apple Intelligence sẵn sàng.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip A18 — Trí tuệ nhân tạo trong lòng bàn tay</h3>
    <ul>
      <li>CPU 6 lõi (2 hiệu suất + 4 tiết kiệm) — xử lý tác vụ nặng mượt mà</li>
      <li>GPU 5 lõi với ray tracing tăng tốc phần cứng — gaming siêu mượt</li>
      <li>Neural Engine 16 lõi — chạy Apple Intelligence on-device, bảo mật tuyệt đối</li>
      <li>RAM 8GB — nhiều hơn hẳn iPhone 15, đa nhiệm không bị reload app</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera 48MP — Lần đầu trên iPhone tiêu chuẩn</h3>
    <ul>
      <li><strong>Camera Fusion 48MP</strong> f/1.6 — sensor lớn hơn 26% so với iPhone 15, ảnh sắc nét hơn hẳn</li>
      <li><strong>Camera Ultra Wide 12MP</strong> — chụp góc rộng phong cảnh, kiến trúc ấn tượng</li>
      <li>Photographic Styles thế hệ 4 — cá nhân hóa màu sắc ảnh theo phong cách riêng</li>
      <li>Video Dolby Vision 4K 60fps — quay phim chuyên nghiệp không cần máy quay</li>
      <li><strong>Camera Control</strong> — nút bấm capacitive mới, chụp ảnh một tay cực tiện</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế và Màn hình</h3>
    <ul>
      <li>Màn hình Super Retina XDR 6.1 inch OLED — sắc nét 460 ppi, màu sắc chuẩn P3</li>
      <li>Dynamic Island tương tác — Live Activities, thông báo app thông minh</li>
      <li>Ceramic Shield thế hệ 2 — bền nhất trên smartphone, IP68 chống nước 6m</li>
      <li>Khung nhôm cao cấp, 7 màu sắc trẻ trung tươi sáng</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin và Kết nối</h3>
    <p>Pin xem video 22 giờ, sạc MagSafe 25W, USB-C với tốc độ USB 2.0. Kết nối 5G tốc độ cao, Wi-Fi 7, Bluetooth 5.3, UWB chip thế hệ 2.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 16, Cáp USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.1" Super Retina XDR',
          'Chip': 'A18',
          'RAM': '8GB',
          'Dung lượng': '128GB / 256GB / 512GB',
          'Camera': '48MP Fusion + 12MP Ultra Wide',
          'Pin': 'Video lên đến 22 giờ',
          'Kết nối': 'USB-C',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 30 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 30 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 20 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 15 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 15 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 15 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 15 },
          { name: 'Màu sắc', value: 'Xanh Băng', colorHex: '#a7c7e7', stock: 10 },
          { name: 'Màu sắc', value: 'Ổ Đào', colorHex: '#ff8c69', stock: 10 },
        ],
        extraMetadata: {
          badge: 'Bán chạy',
          chip: 'A18',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 492,
          searchKeywords: ['iphone 16', 'new iphone', 'apple', 'camera control', 'ios 18'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: 'Dynamic Island — Apple Intelligence sẵn sàng',
        },
      },
      {
        name: 'iPhone 16 Plus', slug: 'iphone-16-plus',
        tagline: 'Màn hình lớn. Pin lâu.', shortDescription: '6.7 inch — Chip A18 — Camera 48MP',
        price: 28990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-1.png',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-4.png',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-6.png',
        ],
        stock: 50, sold: 220,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 16 Plus — Màn hình lớn, pin khủng, giá hợp lý</h2>
    <p>iPhone 16 Plus là sự lựa chọn hoàn hảo cho ai muốn màn hình lớn mà không cần trả thêm tiền cho tính năng Pro. Với màn hình 6.7 inch Super Retina XDR, chip A18 và Camera Control mới, đây là chiếc iPhone "tất-cả-trong-một" tốt nhất phân khúc.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip A18 — Hiệu năng Pro, giá không Pro</h3>
    <ul>
      <li>A18 với CPU 6 lõi, GPU 5 lõi, Neural Engine 16 lõi — cùng chip với iPhone 16</li>
      <li>RAM 8GB — đa nhiệm mượt mà, giữ nhiều tab Safari mà không reload</li>
      <li>Apple Intelligence on-device: viết lại văn bản, tóm tắt email, tạo ảnh sáng tạo</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera 48MP — Chụp đẹp trong mọi điều kiện</h3>
    <ul>
      <li><strong>Camera Fusion 48MP</strong> f/1.6 với sensor lớn, chụp thiếu sáng xuất sắc</li>
      <li><strong>Camera Ultra Wide 12MP</strong> — góc siêu rộng 120 độ, chụp phong cảnh ấn tượng</li>
      <li>Camera Control vật lý — thao tác camera bằng nút bấm trực quan</li>
      <li>Video Dolby Vision 4K 60fps, Cinematic Mode thế hệ 2 — video xóa phông chuyên nghiệp</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin và Màn hình</h3>
    <ul>
      <li>Pin 27 giờ xem video — một trong những iPhone có pin lâu nhất không phải Pro</li>
      <li>Màn hình Super Retina XDR 6.7 inch OLED, 460 ppi — xem phim như rạp mini</li>
      <li>Dynamic Island, Ceramic Shield thế hệ 2, IP68 chống nước 6m</li>
      <li>Sạc MagSafe 25W, USB-C, 5G tốc độ cao</li>
    </ul>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 16 Plus, Cáp USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.7" Super Retina XDR',
          'Chip': 'A18',
          'RAM': '8GB',
          'Dung lượng': '128GB / 256GB / 512GB',
          'Camera': '48MP Fusion + 12MP Ultra Wide',
          'Pin': 'Video lên đến 27 giờ',
          'Kết nối': 'USB-C',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 15 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 20 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 15 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 12 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 12 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 10 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 8 },
          { name: 'Màu sắc', value: 'Xanh Băng', colorHex: '#a7c7e7', stock: 8 },
        ],
        extraMetadata: {
          chip: 'A18',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.7,
          totalReviews: 198,
          searchKeywords: ['iphone 16 plus', 'large iphone', 'big screen'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          promotionalCopy: '6.7 inch — Giải trí không giới hạn',
        },
      },
      // ── iPhone 15 Series ─────────────────────────────────────────────────
      {
        name: 'iPhone 15 Pro', slug: 'iphone-15-pro',
        tagline: 'Titan. Hiệu năng Pro.', shortDescription: 'A17 Pro — Titanium — Camera 48MP',
        price: 29990000, originalPrice: 32990000,
        images: [
          'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqssu3e3oj7b2c.webp',
          'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqspibakw2j6c4.webp',
        ],
        stock: 40, sold: 678,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 15 Pro — Titanium. A17 Pro. Đột phá toàn diện.</h2>
    <p>iPhone 15 Pro là chiếc iPhone đầu tiên dùng titanium Grade 5 — vật liệu dùng trong tàu vũ trụ, nhẹ hơn 19% so với thép không gỉ nhưng chắc hơn nhiều. Chip A17 Pro 3nm đầu tiên trên smartphone, USB 3, và Nút Action tùy chỉnh — 3 đột phá trong một sản phẩm.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip A17 Pro — Tiên phong công nghệ 3nm</h3>
    <ul>
      <li>Chip smartphone đầu tiên trên thế giới dùng tiến trình 3nm của TSMC</li>
      <li>CPU 6 lõi: nhanh hơn 10% so với A16, xử lý tác vụ AI tức thì</li>
      <li>GPU 6 lõi với hardware ray tracing — đổ bóng thực tế trong game mobile</li>
      <li>RAM 8GB: đủ chạy các tác vụ AI nặng, xử lý video 4K ProRes trên máy</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera Pro — 48MP, 3 ống kính, ProRAW</h3>
    <ul>
      <li><strong>Camera Fusion 48MP</strong> f/1.78 — chụp ảnh RAW 48MP đầy đủ chi tiết</li>
      <li><strong>Ultra Wide 12MP</strong> f/2.2 — góc siêu rộng, chụp macro cận cảnh</li>
      <li><strong>Telephoto 3x quang học</strong> — zoom quang học thực sự, không mất chất lượng</li>
      <li>Apple ProRAW, ProRes 4K 60fps, Log video — công cụ của nhiếp ảnh gia chuyên nghiệp</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế Titanium và Nút Action</h3>
    <ul>
      <li>Titanium Grade 5 bốn cạnh — nhẹ nhất trong lịch sử iPhone Pro</li>
      <li>Nút Action thay thế công tắc im lặng — tùy chỉnh: torch, camera, focus, shortcut</li>
      <li>Cổng USB-C thay Lightning — tốc độ USB 3 10Gb/s, tương thích phổ quát</li>
      <li>Dynamic Island, Always-On Display, Ceramic Shield, IP68</li>
    </ul>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 15 Pro, Cáp USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.1" Super Retina XDR, ProMotion 120Hz',
          'Chip': 'A17 Pro',
          'RAM': '8GB',
          'Dung lượng': '128GB / 256GB / 512GB / 1TB',
          'Camera': '48MP Fusion + 12MP Ultra Wide + 3x Telephoto',
          'Pin': 'Video lên đến 23 giờ',
          'Kết nối': 'USB 3 (USB-C)',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 15 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 12 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 8 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 12000000, stock: 5 },
          { name: 'Màu sắc', value: 'Titan Tự Nhiên', colorHex: '#b8b0a8', stock: 10 },
          { name: 'Màu sắc', value: 'Titan Trắng', colorHex: '#e8e4df', stock: 10 },
          { name: 'Màu sắc', value: 'Titan Đen', colorHex: '#3a3a3c', stock: 10 },
          { name: 'Màu sắc', value: 'Titan Xanh', colorHex: '#2c4a6b', stock: 10 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'A17 Pro',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 612,
          searchKeywords: ['iphone 15 pro', 'titanium', 'a17 pro', 'action button', 'pro iphone'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'Titanium Grade 5 — Action Button tùy chỉnh',
        },
      },
      {
        name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max',
        tagline: 'Pro Max. Không giới hạn.', shortDescription: 'A17 Pro — Titanium — Camera 5x Tele',
        price: 35990000, originalPrice: 38990000,
        images: [
          'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqspibajlpsi4e.webp',
          'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqssu3e3n4mv78.webp',
        ],
        stock: 25, sold: 445,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 15 Pro Max — Camera Telephoto 5x, pin 29 giờ, titanium siêu nhẹ</h2>
    <p>iPhone 15 Pro Max nâng tầm zoom lên cấp độ hoàn toàn mới: camera Telephoto 5x quang học 120mm — lần đầu tiên trên iPhone. Kết hợp với chip A17 Pro và khung titanium Grade 5, đây là đỉnh cao nhiếp ảnh di động trong năm 2023.</p>
  </section>
  <section class="rd-camera">
    <h3>Camera Telephoto 5x — Zoom siêu nét chưa từng có</h3>
    <ul>
      <li><strong>Telephoto 5x quang học</strong> f/2.8, 120mm — tương đương ống kính 120mm chuyên nghiệp</li>
      <li><strong>Camera Fusion 48MP</strong> f/1.78 — sensor 1/1.28", chụp tối đẳng cấp</li>
      <li><strong>Ultra Wide 12MP</strong> với macro 12mm — từ cận cảnh đến toàn cảnh, không bỏ sót</li>
      <li>ProRes 4K 60fps, Apple ProRAW 48MP, tetraprism periscope lens độc quyền</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>A17 Pro và USB 3</h3>
    <ul>
      <li>A17 Pro 3nm — mạnh nhất trong năm 2023, vẫn nhanh hơn nhiều máy Android 2024</li>
      <li>USB 3 (USB-C): tốc độ 10Gb/s — sao lưu 1 phút video ProRes 4K chỉ mất 30 giây</li>
      <li>RAM 8GB — xử lý đồng thời video 4K, AI, game không giật</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin và Thiết kế</h3>
    <ul>
      <li>Pin 29 giờ xem video — lâu nhất trong lịch sử iPhone Pro Max khi ra mắt</li>
      <li>Titanium Grade 5 bốn cạnh, màn hình 6.7 inch ProMotion 120Hz Always-On</li>
      <li>Nút Action, Dynamic Island, Ceramic Shield, IP68 chống nước 6m</li>
    </ul>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 15 Pro Max, Cáp USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.7" Super Retina XDR, ProMotion 120Hz',
          'Chip': 'A17 Pro',
          'RAM': '8GB',
          'Dung lượng': '256GB / 512GB / 1TB',
          'Camera': '48MP Fusion + 12MP Ultra Wide + 5x Telephoto',
          'Pin': 'Video lên đến 29 giờ',
          'Kết nối': 'USB 3 (USB-C)',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '256GB', priceModifier: 0, stock: 10 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 5000000, stock: 8 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 10000000, stock: 7 },
          { name: 'Màu sắc', value: 'Titan Tự Nhiên', colorHex: '#b8b0a8', stock: 8 },
          { name: 'Màu sắc', value: 'Titan Trắng', colorHex: '#e8e4df', stock: 7 },
          { name: 'Màu sắc', value: 'Titan Đen', colorHex: '#3a3a3c', stock: 7 },
          { name: 'Màu sắc', value: 'Titan Xanh', colorHex: '#2c4a6b', stock: 3 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'A17 Pro',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 398,
          searchKeywords: ['iphone 15 pro max', '5x optical zoom', 'titanium', 'pro max'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: '5x Tele — Zoom siêu nét từ xa',
        },
      },
      {
        name: 'iPhone 15', slug: 'iphone-15',
        tagline: 'Tính năng Pro. Giá iPhone.', shortDescription: 'Dynamic Island — Camera 48MP — USB-C',
        price: 19990000,
        images: [
          'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqssu3e3rcc72b.webp',
          'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lqssu3e3pxrrd3.webp',
        ],
        stock: 60, sold: 890,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 15 — Dynamic Island, Camera 48MP, USB-C: bộ ba tính năng Pro lần đầu trên dòng tiêu chuẩn</h2>
    <p>iPhone 15 đánh dấu bước nhảy vọt lớn nhất trong lịch sử dòng iPhone tiêu chuẩn: Dynamic Island thay notch, camera 48MP sensor lớn, cổng USB-C thay Lightning. Ba tính năng từng chỉ có trên Pro nay đến tay tất cả mọi người.</p>
  </section>
  <section class="rd-camera">
    <h3>Camera 48MP — Lần đầu trên iPhone tiêu chuẩn</h3>
    <ul>
      <li><strong>Camera Fusion 48MP</strong> f/1.6 với Photonic Engine — ảnh ban đêm sáng và chi tiết vượt trội</li>
      <li><strong>Camera Ultra Wide 12MP</strong> — chụp toàn cảnh, kiến trúc, nhóm đông người</li>
      <li>Portrait Mode nâng cấp với chế độ Night Portrait — xóa phông đẹp cả khi thiếu sáng</li>
      <li>Video Cinematic Mode 4K 30fps, Action Mode chống rung siêu mạnh</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Dynamic Island và USB-C</h3>
    <ul>
      <li>Dynamic Island tương tác — notch biến mất, thay bằng đảo thông minh hiển thị Live Activities</li>
      <li>USB-C thay Lightning — dùng chung cáp với MacBook, iPad Pro</li>
      <li>Màn hình Super Retina XDR 6.1 inch OLED, 460 ppi, màu P3 rộng</li>
      <li>Mặt kính màu phủ toàn thân — mặt sau và viền cùng màu hài hòa</li>
      <li>Ceramic Shield, IP68 chống nước 6m, khung nhôm cao cấp</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>Chip A16 Bionic — Vẫn mạnh hơn đa số điện thoại 2024</h3>
    <p>Chip A16 Bionic từ iPhone 14 Pro với CPU 6 lõi và GPU 5 lõi. RAM 6GB. Hỗ trợ 5G, Wi-Fi 6, Bluetooth 5.3. Pin 20 giờ xem video, sạc MagSafe 15W.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 15, Cáp USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.1" Super Retina XDR',
          'Chip': 'A16 Bionic',
          'RAM': '6GB',
          'Dung lượng': '128GB / 256GB / 512GB',
          'Camera': '48MP Fusion + 12MP Ultra Wide',
          'Pin': 'Video lên đến 20 giờ',
          'Kết nối': 'USB-C',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 20 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 25 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 15 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 12 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 12 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 10 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 10 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 16 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'A16 Bionic',
          ram: '6GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 834,
          searchKeywords: ['iphone 15', 'value iphone', 'dynamic island', 'usb-c iphone'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'USB-C — Dynamic Island — Camera 48MP',
        },
      },
      {
        name: 'iPhone 15 Plus', slug: 'iphone-15-plus',
        tagline: 'Lớn. Đẹp. Đáng mua.', shortDescription: '6.7 inch — A16 Bionic — Camera 48MP',
        price: 24990000,
        images: [
          'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llm05p5nq118f5@resize_w900_nl.webp',
          'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llm05p5nomgs9c@resize_w900_nl.webp',
        ],
        stock: 35, sold: 412,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 15 Plus — Màn hình 6.7 inch Dynamic Island, camera 48MP, pin 26 giờ</h2>
    <p>iPhone 15 Plus mang những tính năng tiên tiến nhất của dòng iPhone 15 vào khung máy lớn hơn, pin lâu hơn. Màn hình 6.7 inch Dynamic Island rộng rãi hoàn hảo cho xem phim, đọc tài liệu, và làm việc năng suất.</p>
  </section>
  <section class="rd-camera">
    <h3>Camera 48MP và USB-C tiện lợi</h3>
    <ul>
      <li><strong>Camera Fusion 48MP</strong> f/1.6 — ảnh đẹp sắc nét trong mọi điều kiện ánh sáng</li>
      <li><strong>Ultra Wide 12MP</strong> — chụp phong cảnh và nhóm đông không bỏ sót ai</li>
      <li>USB-C thay Lightning — dùng chung một cáp cho tất cả thiết bị Apple</li>
      <li>Action Mode video — chống rung cực kỳ ổn định khi vận động</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Màn hình và Thiết kế</h3>
    <ul>
      <li>Dynamic Island 6.7 inch Super Retina XDR OLED, 460 ppi</li>
      <li>Mặt kính màu phủ toàn thân, 5 màu sắc tươi trẻ</li>
      <li>Ceramic Shield thế hệ mới, IP68 chống nước 6m sâu</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin 26 giờ — Tự tin cả ngày dài</h3>
    <p>Pin xem video 26 giờ — hơn iPhone 15 tới 6 giờ. Chip A16 Bionic tiết kiệm điện cực tốt. Sạc MagSafe 15W và USB-C tiện lợi. 5G, Wi-Fi 6, Bluetooth 5.3.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 15 Plus, Cáp USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.7" Super Retina XDR',
          'Chip': 'A16 Bionic',
          'RAM': '6GB',
          'Dung lượng': '128GB / 256GB / 512GB',
          'Camera': '48MP Fusion + 12MP Ultra Wide',
          'Pin': 'Video lên đến 26 giờ',
          'Kết nối': 'USB-C',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 12 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 13 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 10 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 8 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 8 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 7 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 6 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 6 },
        ],
        extraMetadata: {
          chip: 'A16 Bionic',
          ram: '6GB',
          warrantyMonths: 24,
          rating: 4.7,
          totalReviews: 367,
          searchKeywords: ['iphone 15 plus', 'large iphone 15', 'big screen'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          promotionalCopy: '6.7 inch Dynamic Island — Giải trí đỉnh cao',
        },
      },
      // ── iPhone 14 Series ─────────────────────────────────────────────────
      {
        name: 'iPhone 14 Pro', slug: 'iphone-14-pro',
        tagline: 'Pro thuần túy. Đỉnh công nghệ.', shortDescription: 'A16 Bionic — Dynamic Island — Camera 48MP',
        price: 26990000, originalPrice: 29990000,
        images: [
          'https://down-vn.img.susercontent.com/file/92a74619a0704519a0e0facafd1201d6@resize_w900_nl.webp',
        ],
        stock: 30, sold: 756,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 14 Pro — Khai sinh Dynamic Island và Always-On Display</h2>
    <p>iPhone 14 Pro là chiếc iPhone đầu tiên khai sinh hai tính năng biểu tượng: Dynamic Island thay thế notch bằng đảo tương tác thông minh, và Always-On Display hiển thị thông tin mà không cần unlock. Cùng với camera 48MP lần đầu trên Pro — đây là cột mốc lịch sử.</p>
  </section>
  <section class="rd-design">
    <h3>Dynamic Island và Always-On Display</h3>
    <ul>
      <li>Dynamic Island — "đảo" pixel tương tác, biến camera selfie thành giao diện sáng tạo</li>
      <li>Always-On Display — màn hình luôn sáng nhẹ 1Hz hiển thị giờ, thông báo, Live Activities</li>
      <li>ProMotion 120Hz LTPO tự điều chỉnh 1–120Hz — mượt và tiết kiệm pin tối ưu</li>
      <li>Khung thép không gỉ, Ceramic Shield, IP68 chống nước 6m</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera 48MP — Bước đột phá của Pro</h3>
    <ul>
      <li><strong>Camera Fusion 48MP</strong> f/1.78 — sensor lớn hơn 65% so với iPhone 13 Pro, chi tiết vượt trội</li>
      <li><strong>Ultra Wide 12MP</strong> f/2.2 — macro tự động, chụp cận cảnh cực sắc nét</li>
      <li><strong>Telephoto 3x quang học</strong> — zoom quang học thực sự, không méo màu</li>
      <li>Apple ProRAW, ProRes 4K 60fps, Photographic Styles — công cụ nhiếp ảnh chuyên nghiệp</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>Chip A16 Bionic — Độc quyền Pro</h3>
    <p>A16 Bionic 4nm chỉ có trên iPhone 14 Pro — CPU 6 lõi, GPU 5 lõi, Neural Engine 16 lõi xử lý ML nhanh 40% so với A15. RAM 6GB. Emergency SOS qua vệ tinh, Crash Detection tự động gọi cứu hộ.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 14 Pro, Cáp Lightning, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.1" Super Retina XDR, ProMotion 120Hz',
          'Chip': 'A16 Bionic',
          'RAM': '6GB',
          'Dung lượng': '128GB / 256GB / 512GB / 1TB',
          'Camera': '48MP Fusion + 12MP Ultra Wide + 3x Telephoto',
          'Pin': 'Video lên đến 23 giờ',
          'Kết nối': 'Lightning',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 10 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 8 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 6 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 12000000, stock: 6 },
          { name: 'Màu sắc', value: 'Tím Đậm', colorHex: '#6b5b95', stock: 8 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 7 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 7 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 8 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'A16 Bionic',
          ram: '6GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 698,
          searchKeywords: ['iphone 14 pro', 'dynamic island', 'always-on display', '48mp'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'Dynamic Island — Camera 48MP Pro đầu tiên',
        },
      },
      {
        name: 'iPhone 14 Pro Max', slug: 'iphone-14-pro-max',
        tagline: 'Pro Max. Ultimate.', shortDescription: 'A16 Bionic — Dynamic Island — Camera 48MP',
        price: 31990000, originalPrice: 34990000,
        images: [
          'https://down-vn.img.susercontent.com/file/sg-11134201-22100-h6132r2ufdiv03@resize_w900_nl.webp',
        ],
        stock: 20, sold: 534,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 14 Pro Max — Màn hình lớn nhất, pin 29 giờ, Always-On Display</h2>
    <p>iPhone 14 Pro Max kết hợp tất cả những gì tốt nhất của iPhone 14 Pro vào màn hình 6.7 inch rộng lớn với pin ấn tượng nhất thế hệ. Dành cho người dùng muốn trải nghiệm đỉnh cao và không muốn lo lắng về pin suốt cả ngày.</p>
  </section>
  <section class="rd-display">
    <h3>Màn hình 6.7 inch ProMotion Always-On</h3>
    <ul>
      <li>Super Retina XDR OLED 6.7 inch, ProMotion 120Hz tự điều chỉnh 1–120Hz</li>
      <li>Always-On Display lần đầu trên iPhone — luôn thấy giờ và thông báo</li>
      <li>Dynamic Island — giao diện sống động, tương tác thay thế notch truyền thống</li>
      <li>Độ sáng đến 2000 nits ngoài trời, 1600 nits HDR, 1 nit khi Always-On</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera Pro 48MP đầu tiên</h3>
    <ul>
      <li><strong>Camera Fusion 48MP</strong> f/1.78 — Pixel Binning 4-in-1, ảnh 12MP tối rõ nét</li>
      <li><strong>Telephoto 3x quang học</strong> — chụp chân dung, sự kiện từ xa không lo mờ</li>
      <li>Photographic Styles, ProRAW, ProRes 4K — bộ công cụ sáng tạo đầy đủ nhất</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin 29 giờ và An toàn</h3>
    <p>Pin xem video 29 giờ — kỷ lục iPhone khi ra mắt. A16 Bionic 4nm độc quyền Pro. Emergency SOS vệ tinh, Crash Detection — an toàn mọi lúc mọi nơi. Khung thép không gỉ, Ceramic Shield, IP68.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 14 Pro Max, Cáp Lightning, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.7" Super Retina XDR, ProMotion 120Hz',
          'Chip': 'A16 Bionic',
          'RAM': '6GB',
          'Dung lượng': '128GB / 256GB / 512GB / 1TB',
          'Camera': '48MP Fusion + 12MP Ultra Wide + 3x Telephoto',
          'Pin': 'Video lên đến 29 giờ',
          'Kết nối': 'Lightning',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 7 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 6 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 4 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 12000000, stock: 3 },
          { name: 'Màu sắc', value: 'Tím Đậm', colorHex: '#6b5b95', stock: 6 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 5 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 5 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 4 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'A16 Bionic',
          ram: '6GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 489,
          searchKeywords: ['iphone 14 pro max', 'dynamic island', '48mp camera'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'Always-On Display — Pin 29 giờ',
        },
      },
      {
        name: 'iPhone 14', slug: 'iphone-14',
        tagline: 'Mạnh mẽ. Bền bỉ.', shortDescription: 'Chip A15 Bionic — Camera 12MP — Emergency SOS',
        price: 15990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-14_2_1.jpg',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone_14_blue_pdp_image_position-3_camera_vn.png',
        ],
        stock: 40, sold: 1200,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 14 — Crash Detection, Photonic Engine, giá trị tốt nhất phân khúc tầm trung</h2>
    <p>iPhone 14 không chỉ là smartphone — đây là thiết bị bảo vệ tính mạng. Crash Detection lần đầu xuất hiện tự động phát hiện tai nạn xe hơi và gọi cứu thương. Emergency SOS qua vệ tinh kết nối ngay cả ở vùng không có sóng. Thiết kế không đổi nhưng camera được nâng cấp thực chất.</p>
  </section>
  <section class="rd-safety">
    <h3>Tính năng An toàn tiên phong</h3>
    <ul>
      <li><strong>Crash Detection</strong> — cảm biến gia tốc và áp suất phát hiện tai nạn ô tô nghiêm trọng</li>
      <li><strong>Emergency SOS qua vệ tinh</strong> — liên lạc cứu hộ khi không có sóng điện thoại</li>
      <li>Gọi khẩn cấp tự động, thông báo đến liên hệ quan trọng</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera nâng cấp thực chất với Photonic Engine</h3>
    <ul>
      <li><strong>Camera chính 12MP</strong> f/1.5 với Photonic Engine — xử lý ảnh sớm hơn giúp màu sắc và chi tiết vượt trội</li>
      <li><strong>Camera Ultra Wide 12MP</strong> — góc siêu rộng 120 độ cho phong cảnh</li>
      <li>Action Mode chống rung cực mạnh — quay video khi đang chạy bộ, leo núi</li>
      <li>Cinematic Mode 4K 30fps — xóa phông video chuyên nghiệp</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>Chip A15 Bionic và Thiết kế</h3>
    <p>A15 Bionic 5nm với GPU 5 lõi — mạnh hơn chip Android cao cấp nhất 2022. Khung nhôm hàng không vũ trụ, IP68 chống nước 6m. Màn hình Super Retina XDR OLED 6.1 inch. Ram 6GB, sạc Lightning, MagSafe 15W.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 14, Cáp Lightning, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.1" Super Retina XDR',
          'Chip': 'A15 Bionic',
          'RAM': '6GB',
          'Dung lượng': '128GB / 256GB / 512GB',
          'Camera': '12MP Fusion + 12MP Ultra Wide',
          'Pin': 'Video lên đến 20 giờ',
          'Kết nối': 'Lightning',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 15 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 15 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 10 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 10 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 10 },
          { name: 'Màu sắc', value: 'Xanh', colorHex: '#a7c7e7', stock: 10 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 10 },
          { name: 'Màu sắc', value: 'Đỏ', colorHex: '#e53935', stock: 5 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'A15 Bionic',
          ram: '6GB',
          warrantyMonths: 24,
          rating: 4.7,
          totalReviews: 1120,
          searchKeywords: ['iphone 14', 'crash detection', 'emergency sos', 'photonic engine'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'Crash Detection — An toàn trên mọi chuyến đi',
        },
      },
      {
        name: 'iPhone 14 Plus', slug: 'iphone-14-plus',
        tagline: 'Lớn. Nhẹ. Pin trâu.', shortDescription: '6.7 inch — A15 Bionic — Camera 12MP',
        price: 19990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-14_2_1.jpg',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone_14_blue_pdp_image_position-5_colors__vn.png',
        ],
        stock: 30, sold: 678,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 14 Plus — Màn hình 6.7 inch, pin trâu nhất lịch sử dòng Plus, giá tốt</h2>
    <p>iPhone 14 Plus lần đầu đưa màn hình 6.7 inch đến tầm giá không-Pro. Pin trâu hơn cả iPhone 14 Pro Max thời điểm ra mắt — 26 giờ xem video. Lựa chọn hoàn hảo cho ai muốn màn hình lớn và pin bền bỉ mà không cần bỏ tiền Pro.</p>
  </section>
  <section class="rd-battery">
    <h3>Pin 26 giờ — Vua pin dòng không Pro</h3>
    <ul>
      <li>26 giờ xem video — nhiều hơn iPhone 14 đến 6 giờ</li>
      <li>A15 Bionic GPU 5 lõi tiết kiệm điện tối ưu</li>
      <li>Sạc MagSafe 15W, sạc Qi, sạc Lightning — đa dạng lựa chọn</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera Photonic Engine</h3>
    <ul>
      <li><strong>Camera chính 12MP</strong> f/1.5 với Photonic Engine — ảnh đẹp hơn hẳn thế hệ trước</li>
      <li><strong>Camera Ultra Wide 12MP</strong> — góc 120 độ chụp phong cảnh rộng</li>
      <li>Crash Detection và Emergency SOS vệ tinh — an toàn luôn được bảo đảm</li>
      <li>Cinematic Mode 4K 30fps, Action Mode chống rung</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Màn hình và Thiết kế</h3>
    <p>Màn hình Super Retina XDR OLED 6.7 inch sắc nét, khung nhôm cao cấp màu phù hợp mặt sau, IP68 chống nước 6m. Ceramic Shield. 5 màu sắc đẹp, nặng chỉ 203g nhẹ hơn nhiều điện thoại 6.7 inch khác.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 14 Plus, Cáp Lightning, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.7" Super Retina XDR',
          'Chip': 'A15 Bionic',
          'RAM': '6GB',
          'Dung lượng': '128GB / 256GB / 512GB',
          'Camera': '12MP Fusion + 12MP Ultra Wide',
          'Pin': 'Video lên đến 26 giờ',
          'Kết nối': 'Lightning',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 10 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 12 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 8 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 8 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 8 },
          { name: 'Màu sắc', value: 'Xanh', colorHex: '#a7c7e7', stock: 7 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 7 },
        ],
        extraMetadata: {
          chip: 'A15 Bionic',
          ram: '6GB',
          warrantyMonths: 24,
          rating: 4.7,
          totalReviews: 612,
          searchKeywords: ['iphone 14 plus', 'large screen', 'big iphone'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          promotionalCopy: 'Pin 26 giờ — iPhone lớn không cần Pro',
        },
      },
      // ── iPhone SE Series ─────────────────────────────────────────────────
      {
        name: 'iPhone SE (2022)', slug: 'iphone-se-2022',
        tagline: 'Nhỏ gọn. Mạnh mẽ. Giá rẻ.', shortDescription: 'A15 Bionic — Touch ID — 5G',
        price: 9990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/1/_/1_359_1.png',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/2/_/2_337_1.png',
        ],
        stock: 60, sold: 2340,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone SE (2022) — Chip A15 Bionic, 5G, giá chỉ từ 9.9 triệu</h2>
    <p>iPhone SE 2022 là chiếc iPhone mạnh nhất theo đồng tiền bỏ ra. Chip A15 Bionic — cùng chip với iPhone 13 Pro — trong thân máy 4.7 inch nhỏ gọn quen thuộc. Kết nối 5G siêu nhanh, Touch ID bảo mật, giá cực kỳ phải chăng.</p>
  </section>
  <section class="rd-performance">
    <h3>A15 Bionic — Chip iPhone 13 Pro, giá iPhone tầm thấp</h3>
    <ul>
      <li>A15 Bionic 5nm — CPU 6 lõi, GPU 4 lõi: nhanh hơn hầu hết smartphone Android cao cấp</li>
      <li>Neural Engine 16 lõi — xử lý AI, nhận diện ảnh tức thì</li>
      <li>RAM 4GB — đủ cho mọi tác vụ thường ngày mượt mà</li>
      <li>Hiệu năng mạnh hơn nhiều so với điện thoại Android cùng giá</li>
    </ul>
  </section>
  <section class="rd-connectivity">
    <h3>5G và Bảo mật Touch ID</h3>
    <ul>
      <li>5G kết nối — lướt web, stream 4K, tải file tốc độ cao</li>
      <li>Touch ID trên nút Home — bảo mật quen thuộc, nhanh và chính xác</li>
      <li>Wi-Fi 6 (802.11ax), Bluetooth 5.0, NFC</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế 4.7 inch nhỏ gọn</h3>
    <ul>
      <li>Màn hình Retina HD LCD 4.7 inch — nhỏ gọn, dễ dùng một tay</li>
      <li>Ceramic Shield mặt trước, kính màu mặt sau, IP67 chống nước</li>
      <li>3 màu sắc: Trắng, Đen, Đỏ Product(RED)</li>
      <li>Camera 12MP f/1.8 với Smart HDR 4 — chụp đẹp bất ngờ với camera đơn</li>
    </ul>
  </section>
</div>`,
        whatsInTheBox: 'iPhone SE (2022), Cáp Lightning, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '4.7" Retina HD (LCD)',
          'Chip': 'A15 Bionic',
          'RAM': '4GB',
          'Dung lượng': '64GB / 128GB / 256GB',
          'Camera': '12MP Wide',
          'Pin': 'Video lên đến 15 giờ',
          'Kết nối': 'Lightning, 5G',
          'Chống nước': 'IP67',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '64GB', priceModifier: 0, stock: 20 },
          { name: 'Dung lượng', value: '128GB', priceModifier: 3000000, stock: 25 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 6000000, stock: 15 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 15 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 15 },
          { name: 'Màu sắc', value: 'Đỏ', colorHex: '#e53935', stock: 10 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'A15 Bionic',
          ram: '4GB',
          warrantyMonths: 24,
          rating: 4.6,
          totalReviews: 2180,
          searchKeywords: ['iphone se 2022', 'budget iphone', 'touch id', '5g iphone', 'small iphone'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          promotionalCopy: 'A15 Bionic — Touch ID — 5G — Giá chỉ từ 9.9 triệu',
        },
      },
      // ── iPhone 13 Series ─────────────────────────────────────────────────
      {
        name: 'iPhone 13', slug: 'iphone-13',
        tagline: 'Đỉnh của sự mạnh mẽ.', shortDescription: 'A15 Bionic — Camera kép — Cinematic Mode',
        price: 13990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-13_2_2.jpg',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone_13_pdp_position-4_design__vn.png',
        ],
        stock: 35, sold: 3200,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 13 — A15 Bionic, Cinematic Mode, camera kép nâng cấp toàn diện</h2>
    <p>iPhone 13 mang đến bước tiến lớn nhất trong lịch sử dòng iPhone tiêu chuẩn: chip A15 Bionic mạnh nhất năm, camera kép với sensor lớn hơn thu sáng tốt hơn 47%, và Cinematic Mode quay video xóa phông như điện ảnh. Màn hình sáng hơn 28% so với iPhone 12.</p>
  </section>
  <section class="rd-camera">
    <h3>Camera kép nâng cấp thực chất</h3>
    <ul>
      <li><strong>Camera Wide 12MP</strong> f/1.6 — sensor lớn hơn 47%, thu sáng tốt hơn 47%</li>
      <li><strong>Camera Ultra Wide 12MP</strong> f/2.4 — góc siêu rộng 120 độ</li>
      <li>Photonic Engine xử lý ảnh thông minh — màu tự nhiên, chi tiết không mất</li>
      <li><strong>Cinematic Mode</strong> quay video 1080p với xóa phông tự động và rack focus thông minh</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>A15 Bionic — Chip mạnh nhất thế giới năm 2021</h3>
    <ul>
      <li>CPU 6 lõi (2 hiệu suất + 4 tiết kiệm), GPU 4 lõi</li>
      <li>Neural Engine 16 lõi — máy học nhanh hơn, nhận diện ảnh tức thì</li>
      <li>RAM 4GB — đủ cho mọi tác vụ thường ngày</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin và Màn hình</h3>
    <p>Pin 19 giờ xem video — nhiều hơn 2.5 giờ so với iPhone 12. Màn hình Super Retina XDR OLED 6.1 inch sáng hơn 28%, IP68 chống nước 6m, MagSafe 15W, 5G tốc độ cao. Thiết kế Ceramic Shield bền bỉ.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 13, Cáp Lightning, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.1" Super Retina XDR',
          'Chip': 'A15 Bionic',
          'RAM': '4GB',
          'Dung lượng': '128GB / 256GB / 512GB',
          'Camera': '12MP Wide + 12MP Ultra Wide',
          'Pin': 'Video lên đến 19 giờ',
          'Kết nối': 'Lightning',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 12 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 13 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 10 },
          { name: 'Màu sắc', value: 'Xanh', colorHex: '#a7c7e7', stock: 8 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 7 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 7 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 7 },
          { name: 'Màu sắc', value: 'Đỏ', colorHex: '#e53935', stock: 6 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'A15 Bionic',
          ram: '4GB',
          warrantyMonths: 24,
          rating: 4.7,
          totalReviews: 2940,
          searchKeywords: ['iphone 13', 'cinematic mode', 'a15 bionic', 'dual camera'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'Cinematic Mode — Quay video như điện ảnh',
        },
      },
      {
        name: 'iPhone 13 Pro', slug: 'iphone-13-pro',
        tagline: 'Pro. Siêu năng lực.', shortDescription: 'A15 Bionic — ProMotion 120Hz — Macro',
        price: 22990000, originalPrice: 25990000,
        images: [
          'https://cdn2.cellphones.com.vn/x/media/catalog/product/i/p/iphone-13-pro-cu-dep_1_.png',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmFSCpwyysHdGcWGCn7SoM5XZe7T9zBkSiyg&s',
        ],
        stock: 20, sold: 1890,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 13 Pro — ProMotion 120Hz đầu tiên, Macro, A15 Pro 5 lõi GPU</h2>
    <p>iPhone 13 Pro đánh dấu hai cột mốc lớn: ProMotion 120Hz tần số quét thích ứng lần đầu tiên trên iPhone, và chế độ chụp Macro 12mm chụp cận cảnh từ 2cm. Camera Triple 12MP với Night mode trên cả ba ống kính — nhiếp ảnh chuyên nghiệp thực sự.</p>
  </section>
  <section class="rd-camera">
    <h3>Camera Triple Pro — Macro và Night mode toàn diện</h3>
    <ul>
      <li><strong>Camera Wide 12MP</strong> f/1.5 — sensor lớn hơn 65%, thu sáng vượt trội</li>
      <li><strong>Camera Macro 12mm</strong> — chụp cận cảnh từ 2cm, chi tiết không tưởng</li>
      <li><strong>Camera Telephoto 3x quang học</strong> 77mm f/2.8 — zoom siêu nét không hao chất lượng</li>
      <li>Photographic Styles cá nhân hóa, ProRAW, ProRes 4K — bộ công cụ đầy đủ nhất</li>
    </ul>
  </section>
  <section class="rd-display">
    <h3>ProMotion 120Hz — Mượt mà không đối thủ</h3>
    <ul>
      <li>LTPO tự điều chỉnh 10–120Hz — cử chỉ mượt mà, cuộn trang như lụa</li>
      <li>Super Retina XDR OLED 6.1 inch, 2000 nits peak brightness</li>
      <li>Khung thép không gỉ, Ceramic Shield, IP68</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>A15 Bionic GPU 5 lõi độc quyền Pro</h3>
    <p>GPU 5 lõi chỉ có trên 13 Pro — mạnh hơn 20% GPU 4 lõi của iPhone 13. RAM 6GB. Pin 22 giờ, sạc MagSafe, 5G. Cinematic Mode, kết nối LIDAR không có trên 13 thường.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 13 Pro, Cáp Lightning, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.1" Super Retina XDR, ProMotion 120Hz',
          'Chip': 'A15 Bionic',
          'RAM': '6GB',
          'Dung lượng': '128GB / 256GB / 512GB / 1TB',
          'Camera': '12MP Wide + 12MP Ultra Wide + 3x Telephoto',
          'Pin': 'Video lên đến 22 giờ',
          'Kết nối': 'Lightning',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 6 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 6 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 4 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 12000000, stock: 4 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 6 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 5 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 4 },
          { name: 'Màu sắc', value: 'Xanh Sierra', colorHex: '#5c8ab8', stock: 5 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'A15 Bionic',
          ram: '6GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 1720,
          searchKeywords: ['iphone 13 pro', 'promotion 120hz', 'macro photography', 'pro camera'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'ProMotion 120Hz — Mượt mà từng pixel',
        },
      },
      {
        name: 'iPhone 13 Pro Max', slug: 'iphone-13-pro-max',
        tagline: 'Pro Max. Không đối thủ.', shortDescription: 'A15 Bionic — 6.7" — Pin 28 giờ',
        price: 27990000,
        images: [
          'https://cdn2.cellphones.com.vn/x/media/catalog/product/i/p/iphone-13-pro-max-128gb-cu-dep.png',
          'https://www.techone.vn/wp-content/uploads/2021/09/33-500x500.jpg',
        ],
        stock: 15, sold: 1450,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 13 Pro Max — Pin 28 giờ kỷ lục, ProMotion 120Hz, camera Pro Triple</h2>
    <p>iPhone 13 Pro Max giữ kỷ lục pin lâu nhất lịch sử iPhone khi ra mắt: 28 giờ xem video liên tục. Kết hợp màn hình ProMotion 120Hz 6.7 inch lớn nhất và hệ thống camera Pro Triple mạnh nhất — đây là "vua" iPhone năm 2021.</p>
  </section>
  <section class="rd-battery">
    <h3>Pin 28 giờ — Kỷ lục iPhone 2021</h3>
    <ul>
      <li>28 giờ xem video — nhiều hơn 2.5 giờ so với iPhone 12 Pro Max</li>
      <li>A15 Bionic 5nm tiết kiệm điện cực tốt, quản lý thermal thông minh</li>
      <li>Sạc MagSafe 15W, Qi 7.5W, Lightning — linh hoạt mọi tình huống</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera Triple Pro đỉnh cao</h3>
    <ul>
      <li><strong>Wide 12MP</strong> f/1.5 — sensor lớn hơn 65% so với 12 Pro Max</li>
      <li><strong>Macro 12mm</strong> — khám phá thế giới vi mô từ cự ly 2cm</li>
      <li><strong>Telephoto 3x</strong> 77mm — tiêu cự vàng chụp chân dung đẹp nhất</li>
      <li>ProRAW, ProRes 4K 30fps, Cinematic Mode xóa phông video</li>
    </ul>
  </section>
  <section class="rd-display">
    <h3>Màn hình 6.7 inch ProMotion</h3>
    <p>Super Retina XDR OLED 6.7 inch, ProMotion 120Hz LTPO tự điều chỉnh. Khung thép không gỉ cao cấp, Ceramic Shield, IP68 chống nước 6m. RAM 6GB. 5G tốc độ cao.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 13 Pro Max, Cáp Lightning, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.7" Super Retina XDR, ProMotion 120Hz',
          'Chip': 'A15 Bionic',
          'RAM': '6GB',
          'Dung lượng': '128GB / 256GB / 512GB / 1TB',
          'Camera': '12MP Wide + 12MP Ultra Wide + 3x Telephoto',
          'Pin': 'Video lên đến 28 giờ',
          'Kết nối': 'Lightning',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 5 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 5 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 3 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 12000000, stock: 2 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 5 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 4 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 3 },
          { name: 'Màu sắc', value: 'Xanh Sierra', colorHex: '#5c8ab8', stock: 3 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'A15 Bionic',
          ram: '6GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 1320,
          searchKeywords: ['iphone 13 pro max', '28 hour battery', 'promotion', 'pro max'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'Pin 28 giờ — Không lo hết pin',
        },
      },
      {
        name: 'iPhone 13 mini', slug: 'iphone-13-mini',
        tagline: 'Nhỏ. Đáng yêu. Mạnh mẽ.', shortDescription: '5.4 inch — A15 Bionic — Cinematic Mode',
        price: 11990000,
        images: [
          'https://cdn.phuckhangmobile.com/image/iphone-13-hong-900-24965j.jpg',
        ],
        stock: 25, sold: 980,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 13 mini — Nhỏ gọn nhất, mạnh mẽ nhất phân khúc compact</h2>
    <p>iPhone 13 mini là đỉnh cao của thiết kế nhỏ gọn: màn hình Super Retina XDR OLED 5.4 inch trong thân máy còn nhỏ hơn iPhone SE, nhưng sức mạnh chip A15 Bionic và camera kép ngang iPhone 13 đầy đủ. Hoàn hảo cho ai thích smartphone một tay.</p>
  </section>
  <section class="rd-design">
    <h3>Thiết kế nhỏ gọn chưa từng có</h3>
    <ul>
      <li>Thân máy nhỏ hơn iPhone SE 2022 nhưng màn hình lớn hơn (5.4 inch vs 4.7 inch)</li>
      <li>OLED Super Retina XDR — sắc nét, màu sắc sống động, đen tuyệt đối</li>
      <li>Nặng chỉ 140g — nhẹ nhất trong mọi iPhone OLED</li>
      <li>Ceramic Shield, IP68 chống nước 6m, khung nhôm 5 lõi</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera kép đầy đủ — Không hi sinh tính năng</h3>
    <ul>
      <li><strong>Camera Wide 12MP</strong> f/1.6 — sensor lớn hơn 47%, Night mode mạnh mẽ</li>
      <li><strong>Camera Ultra Wide 12MP</strong> — chụp toàn cảnh không bỏ sót</li>
      <li>Cinematic Mode, Photographic Styles — đầy đủ như iPhone 13</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>A15 Bionic trong thân máy nhỏ</h3>
    <p>A15 Bionic CPU 6 lõi, GPU 4 lõi — cùng chip với iPhone 13. RAM 4GB. Pin 17 giờ — cải thiện đáng kể so với 12 mini. MagSafe 12W, 5G, Bluetooth 5.0.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 13 mini, Cáp Lightning, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '5.4" Super Retina XDR',
          'Chip': 'A15 Bionic',
          'RAM': '4GB',
          'Dung lượng': '128GB / 256GB / 512GB',
          'Camera': '12MP Wide + 12MP Ultra Wide',
          'Pin': 'Video lên đến 17 giờ',
          'Kết nối': 'Lightning',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 10 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 8 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 7 },
          { name: 'Màu sắc', value: 'Xanh', colorHex: '#a7c7e7', stock: 7 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 6 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 6 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 6 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'A15 Bionic',
          ram: '4GB',
          warrantyMonths: 24,
          rating: 4.6,
          totalReviews: 890,
          searchKeywords: ['iphone 13 mini', 'small iphone', 'compact', 'mini phone'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          promotionalCopy: '5.4 inch — Nhỏ trong lòng bàn tay, lớn trong hiệu năng',
        },
      },
      // ── iPhone 12 Series ─────────────────────────────────────────────────
      {
        name: 'iPhone 12', slug: 'iphone-12',
        tagline: '5G. A14 Bionic. Super Retina XDR.', shortDescription: 'A14 — 5G — Camera kép — MagSafe',
        price: 11990000,
        images: [
          'https://bizweb.dktcdn.net/thumb/grande/100/517/334/products/12thg-c0fe4f3f-f80e-4698-97fc-89fb7ede9a2e.jpg?v=1716563651773',
        ],
        stock: 30, sold: 4560,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 12 — 5G đầu tiên, OLED Super Retina XDR, A14 Bionic 5nm, MagSafe</h2>
    <p>iPhone 12 viết lại lịch sử với 4 cột mốc cùng lúc: 5G lần đầu tiên trên iPhone, OLED Super Retina XDR thay màn hình LCD, chip A14 Bionic 5nm đầu tiên trên smartphone, và hệ thống gắn nam châm MagSafe hoàn toàn mới. Thiết kế flat edge iconic trở lại sau nhiều năm vắng bóng.</p>
  </section>
  <section class="rd-design">
    <h3>Thiết kế Flat Edge tái sinh và MagSafe</h3>
    <ul>
      <li>Cạnh phẳng nhôm 100% tái chế — thiết kế biểu tượng trở lại sau iPhone 4</li>
      <li>MagSafe — 18 nam châm sắp xếp chính xác, gắn phụ kiện và sạc tức thì</li>
      <li>Ceramic Shield — kính mặt trước bền hơn 4 lần, tỷ lệ vỡ giảm đáng kể</li>
      <li>IP68 chống nước 6m trong 30 phút, màn hình OLED 6.1 inch Super Retina XDR</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>A14 Bionic — Chip smartphone 5nm đầu tiên thế giới</h3>
    <ul>
      <li>Tiến trình 5nm TSMC — hiệu năng tăng 16%, tiết kiệm điện hơn 30%</li>
      <li>CPU 6 lõi, GPU 4 lõi, Neural Engine 16 lõi — xử lý AI mọi tác vụ</li>
      <li>5G Sub-6GHz và mmWave (tùy thị trường) — tốc độ tải lên đến gigabit</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera kép 12MP</h3>
    <p>Camera Wide 12MP f/1.6 và Ultra Wide 12MP f/2.4. Night mode, Smart HDR 3, Deep Fusion. Quay video 4K 60fps, Dolby Vision, Time-lapse với stabilization. Pin 17 giờ, sạc MagSafe 15W.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 12, Cáp Lightning, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.1" Super Retina XDR (OLED)',
          'Chip': 'A14 Bionic',
          'RAM': '4GB',
          'Dung lượng': '64GB / 128GB / 256GB',
          'Camera': '12MP Wide + 12MP Ultra Wide',
          'Pin': 'Video lên đến 17 giờ',
          'Kết nối': 'Lightning, 5G',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '64GB', priceModifier: 0, stock: 10 },
          { name: 'Dung lượng', value: '128GB', priceModifier: 3000000, stock: 10 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 6000000, stock: 10 },
          { name: 'Màu sắc', value: 'Xanh', colorHex: '#a7c7e7', stock: 7 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 6 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 6 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 5 },
          { name: 'Màu sắc', value: 'Xanh Lơ', colorHex: '#4a90d9', stock: 6 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'A14 Bionic',
          ram: '4GB',
          warrantyMonths: 24,
          rating: 4.6,
          totalReviews: 4120,
          searchKeywords: ['iphone 12', '5g iphone', 'magsafe', 'a14 bionic'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: '5G — MagSafe — A14 Bionic 5nm',
        },
      },
      {
        name: 'iPhone 12 Pro', slug: 'iphone-12-pro',
        tagline: 'Pro. 5G. LiDAR.', shortDescription: 'A14 — LiDAR — Camera 3x — MagSafe',
        price: 18990000,
        images: [
          'https://cdn.tgdd.vn/Products/Images/42/213032/iphone-12-pro-xanh-duong-new-600x600-2-600x600.jpg',
        ],
        stock: 20, sold: 2340,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 12 Pro — LiDAR Scanner, ProRAW, Telephoto 2.5x, Apple ProRes</h2>
    <p>iPhone 12 Pro là chiếc iPhone đầu tiên trang bị LiDAR Scanner — cảm biến ánh sáng laser đo chiều sâu cực chính xác, mở ra khả năng AR và chụp Portrait tức thì ngay cả trong bóng tối hoàn toàn. Apple ProRAW cho phép chụp RAW với tất cả tính năng computational photography.</p>
  </section>
  <section class="rd-camera">
    <h3>Camera Triple Pro + LiDAR — Đột phá chụp ảnh</h3>
    <ul>
      <li><strong>Camera Wide 12MP</strong> f/1.6 với sensor shift OIS — ảnh ban đêm sắc nét, không rung</li>
      <li><strong>Camera Ultra Wide 12MP</strong> f/2.4 — chụp góc 120 độ ấn tượng</li>
      <li><strong>Camera Telephoto 2.5x</strong> 65mm f/2.0 — zoom chân dung chuyên nghiệp</li>
      <li><strong>LiDAR Scanner</strong> — AR siêu mượt, Night Portrait tức thì, đo phòng chính xác</li>
      <li>Apple ProRAW — lần đầu có RAW với Deep Fusion, Smart HDR, Night Mode đầy đủ</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Khung thép không gỉ và MagSafe Pro</h3>
    <ul>
      <li>Khung thép không gỉ cao cấp — sang trọng, cứng cáp hơn nhôm</li>
      <li>Màn hình Super Retina XDR OLED 6.1 inch, ProMotion không có</li>
      <li>MagSafe 15W, 5G, Ceramic Shield, IP68 chống nước 6m</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>A14 Bionic với GPU 4 lõi</h3>
    <p>A14 Bionic 5nm GPU 4 lõi, RAM 6GB — đủ mạnh cho mọi workflow sáng tạo. Video 4K 60fps Dolby Vision, Apple ProRes (không có trên base iPhone 12). Pin 17 giờ, sạc nhanh 20W.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 12 Pro, Cáp USB-C sang Lightning, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.1" Super Retina XDR (OLED)',
          'Chip': 'A14 Bionic',
          'RAM': '6GB',
          'Dung lượng': '128GB / 256GB / 512GB',
          'Camera': '12MP Wide + 12MP Ultra Wide + 2.5x Telephoto',
          'Pin': 'Video lên đến 17 giờ',
          'Kết nối': 'Lightning, 5G',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 8 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 6 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 6 },
          { name: 'Màu sắc', value: 'Xanh Thái Bình Dương', colorHex: '#4a6fa5', stock: 6 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 5 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 5 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 4 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'A14 Bionic',
          ram: '6GB',
          warrantyMonths: 24,
          rating: 4.7,
          totalReviews: 2100,
          searchKeywords: ['iphone 12 pro', 'lidar', 'apple proraw', 'telephoto'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'LiDAR — AR vượt trội, Night Mode cực đỉnh',
        },
      },
      {
        name: 'iPhone 12 Pro Max', slug: 'iphone-12-pro-max',
        tagline: 'Pro Max. Màn hình lớn nhất.', shortDescription: '6.7" — A14 — Camera 2.5x — Sensor Shift',
        price: 23990000,
        images: [
          'https://tpmobile.vn/wp-content/uploads/2021/01/12promax-trang-tpmobile.png',
        ],
        stock: 15, sold: 1670,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 12 Pro Max — Sensor-Shift OIS đầu tiên, màn hình 6.7 inch lớn nhất lịch sử</h2>
    <p>iPhone 12 Pro Max lần đầu tiên mang công nghệ Sensor-Shift OIS vào smartphone — chống rung bằng cách di chuyển cảm biến thay vì ống kính, ổn định hơn gấp 5 lần, cho ảnh và video sắc nét ngay cả khi vận động. Cùng với màn hình 6.7 inch lớn nhất từng có trên iPhone.</p>
  </section>
  <section class="rd-camera">
    <h3>Camera Wide với Sensor-Shift OIS — Ổn định như gimbal</h3>
    <ul>
      <li><strong>Camera Wide 12MP</strong> f/1.6 với Sensor-Shift OIS — rung tay không ảnh hưởng, video mượt như quay gimbal</li>
      <li><strong>Camera Ultra Wide 12MP</strong> f/2.4 với LiDAR Night Portrait</li>
      <li><strong>Camera Telephoto 2.5x</strong> 65mm f/2.2 — zoom chân dung nịnh da</li>
      <li>Apple ProRAW, ProRes không có (chỉ từ 13 Pro), LiDAR Scanner đo chiều sâu</li>
    </ul>
  </section>
  <section class="rd-display">
    <h3>Màn hình 6.7 inch đỉnh cao</h3>
    <ul>
      <li>Super Retina XDR OLED 6.7 inch — màn hình lớn nhất trên iPhone 2020</li>
      <li>460 ppi, màu P3 rộng, True Tone, HDR Dolby Vision</li>
      <li>Khung thép không gỉ, IP68 chống nước 6m sâu</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin 20 giờ và Kết nối</h3>
    <p>Pin 20 giờ xem video — nhiều hơn 3.5 giờ so với iPhone 12 Pro. A14 Bionic 5nm tiết kiệm điện tối ưu. MagSafe 15W, 5G, Wi-Fi 6. RAM 6GB để xử lý ảnh ProRAW và video 4K.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 12 Pro Max, Cáp USB-C sang Lightning, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.7" Super Retina XDR (OLED)',
          'Chip': 'A14 Bionic',
          'RAM': '6GB',
          'Dung lượng': '128GB / 256GB / 512GB',
          'Camera': '12MP Wide (Sensor Shift) + 12MP Ultra Wide + 2.5x Telephoto',
          'Pin': 'Video lên đến 20 giờ',
          'Kết nối': 'Lightning, 5G',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 5 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 5 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 5 },
          { name: 'Màu sắc', value: 'Xanh Thái Bình Dương', colorHex: '#4a6fa5', stock: 5 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 4 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 4 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 2 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'A14 Bionic',
          ram: '6GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 1520,
          searchKeywords: ['iphone 12 pro max', 'sensor shift', '6.7 inch', 'large screen'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'Sensor Shift OIS — Ổn định như gimbal',
        },
      },
      {
        name: 'iPhone 12 mini', slug: 'iphone-12-mini',
        tagline: 'Nhỏ gọn. 5G. A14.', shortDescription: '5.4 inch — A14 — 5G — MagSafe',
        price: 9990000,
        images: [
          'https://cdn2.cellphones.com.vn/x/media/catalog/product/i/p/iphone-12-mini-xanh-la-15-200x200_10.jpg',
          'https://product.hstatic.net/1000129940/product/iphone-12-mini-128gb-white_1b47e9f26a8b468d80c21359db6fedd7_master.jpg',
        ],
        stock: 25, sold: 2100,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 12 mini — 5G nhỏ nhất, nhẹ nhất, OLED 5.4 inch trong lòng bàn tay</h2>
    <p>iPhone 12 mini là câu trả lời cho những ai muốn 5G, OLED và chip A14 Bionic nhưng không muốn mang theo smartphone lớn. Thân máy chỉ 133mm chiều cao — nhỏ hơn iPhone SE 2020 — nhưng màn hình lớn hơn và mạnh hơn nhiều.</p>
  </section>
  <section class="rd-design">
    <h3>Nhỏ nhất, nhẹ nhất trong dòng iPhone OLED</h3>
    <ul>
      <li>Chiều cao 131.5mm — vừa vặn trong mọi chiếc túi, dễ dàng dùng một tay</li>
      <li>Nặng chỉ 133g — nhẹ nhất trong mọi iPhone 5G OLED</li>
      <li>Màn hình Super Retina XDR OLED 5.4 inch, 476 ppi — mật độ điểm ảnh cao nhất iPhone</li>
      <li>Flat edge nhôm, Ceramic Shield, IP68 chống nước 6m</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>A14 Bionic + 5G trong thân nhỏ</h3>
    <ul>
      <li>A14 Bionic 5nm — cùng chip với các iPhone 12 khác, không thỏa hiệp hiệu năng</li>
      <li>5G Sub-6GHz — tốc độ cao, streaming 4K không giật</li>
      <li>MagSafe 12W (nhỏ hơn 15W do thân nhiệt nhỏ hơn), Qi 7.5W</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera kép đầy đủ</h3>
    <p>Camera Wide 12MP f/1.6 và Ultra Wide 12MP f/2.4 — không hi sinh tính năng camera vì kích thước. Night mode, Smart HDR 3, Deep Fusion, Video 4K 60fps Dolby Vision. Pin 15 giờ.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 12 mini, Cáp Lightning, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '5.4" Super Retina XDR (OLED)',
          'Chip': 'A14 Bionic',
          'RAM': '4GB',
          'Dung lượng': '64GB / 128GB / 256GB',
          'Camera': '12MP Wide + 12MP Ultra Wide',
          'Pin': 'Video lên đến 15 giờ',
          'Kết nối': 'Lightning, 5G',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '64GB', priceModifier: 0, stock: 8 },
          { name: 'Dung lượng', value: '128GB', priceModifier: 3000000, stock: 10 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 6000000, stock: 7 },
          { name: 'Màu sắc', value: 'Xanh', colorHex: '#a7c7e7', stock: 6 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 6 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 5 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 5 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'A14 Bionic',
          ram: '4GB',
          warrantyMonths: 24,
          rating: 4.5,
          totalReviews: 1890,
          searchKeywords: ['iphone 12 mini', 'small 5g iphone', 'compact phone', 'mini'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          promotionalCopy: '5.4 inch 5G — Nhỏ nhất, mạnh nhất',
        },
      },
      // ── iPhone 11 / XR / SE (Gen 1) ──────────────────────────────────────
      {
        name: 'iPhone 11', slug: 'iphone-11',
        tagline: 'Dual Camera. Face ID. Giá tốt.', shortDescription: 'A13 Bionic — Camera kép — Face ID',
        price: 8990000,
        images: [
          'https://cdn.tgdd.vn/Products/Images/42/153856/iphone-11-trang-600x600.jpg',
          'https://24hstore.vn/images/products/2025/05/27/large/iphone-11-cu-98-64gb.jpg',
        ],
        stock: 40, sold: 5670,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 11 — Night Mode đầu tiên, Face ID, A13 Bionic, giá hợp lý nhất</h2>
    <p>iPhone 11 khai sinh Night Mode — tính năng chụp ảnh đêm bằng AI mà sau này trở thành tiêu chuẩn của mọi smartphone. Camera kép Ultra Wide lần đầu tiên, Face ID nhanh hơn 30%, A13 Bionic mạnh nhất năm 2019. Đây là nền tảng của iPhone hiện đại.</p>
  </section>
  <section class="rd-camera">
    <h3>Night Mode và Camera Ultra Wide — Hai tính năng đầu tiên</h3>
    <ul>
      <li><strong>Camera Wide 12MP</strong> f/1.8 với Night Mode — chụp đêm sáng như ban ngày</li>
      <li><strong>Camera Ultra Wide 12MP</strong> f/2.4 — lần đầu tiên trên iPhone, góc 120 độ</li>
      <li>Smart HDR, Deep Fusion — ảnh chi tiết, tự nhiên trong mọi điều kiện</li>
      <li>Video 4K 60fps, Slow-motion 1080p 240fps — quay chuyên nghiệp</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>A13 Bionic — Chip mạnh nhất 2019</h3>
    <ul>
      <li>CPU 6 lõi, GPU 4 lõi — mạnh hơn 20% so với A12 Bionic</li>
      <li>Neural Engine 8 lõi — xử lý AR và AI nhanh hơn bao giờ hết</li>
      <li>Face ID thế hệ 2 — nhận dạng khuôn mặt trong 0.3 giây</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế và Pin</h3>
    <p>Màn hình Liquid Retina LCD 6.1 inch, khung nhôm 6-series, IP68. Pin 17 giờ — nhiều hơn 1 giờ so với iPhone XS. 6 màu sắc tươi sáng độc đáo. Touch ID không có — Face ID hoàn toàn. Sạc Lightning 18W.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 11, Cáp Lightning, Tai nghe EarPods, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.1" Liquid Retina HD (LCD)',
          'Chip': 'A13 Bionic',
          'RAM': '4GB',
          'Dung lượng': '64GB / 128GB / 256GB',
          'Camera': '12MP Wide + 12MP Ultra Wide',
          'Pin': 'Video lên đến 17 giờ',
          'Kết nối': 'Lightning',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '64GB', priceModifier: 0, stock: 14 },
          { name: 'Dung lượng', value: '128GB', priceModifier: 3000000, stock: 15 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 6000000, stock: 11 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 8 },
          { name: 'Màu sắc', value: 'Xanh Lơ', colorHex: '#4a90d9', stock: 8 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 7 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 7 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 5 },
          { name: 'Màu sắc', value: 'Đỏ', colorHex: '#e53935', stock: 5 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'A13 Bionic',
          ram: '4GB',
          warrantyMonths: 12,
          rating: 4.5,
          totalReviews: 5210,
          searchKeywords: ['iphone 11', 'night mode', 'dual camera', 'face id', 'budget iphone'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'Night Mode đầu tiên — Chụp đêm sáng rõ',
        },
      },
      {
        name: 'iPhone XR', slug: 'iphone-xr',
        tagline: 'Face ID. Màn hình lớn. Màu sắc.', shortDescription: 'A12 Bionic — Face ID — 6.1 inch LCD',
        price: 6990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone_xr_red-back_09122018_carousel.jpg.large_8_1_3.jpg',
        ],
        stock: 50, sold: 8900,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone XR — Smartphone bán chạy nhất thế giới 2018–2019, Face ID, 6 màu sắc</h2>
    <p>iPhone XR trở thành smartphone bán chạy nhất thế giới hai năm liền — không phải ngẫu nhiên. Màn hình Liquid Retina lớn nhất, Face ID an toàn, A12 Bionic mạnh mẽ và pin trâu hơn iPhone X và XS. Sáu màu sắc tươi sáng cho phép cá nhân hóa phong cách. Giá trị tốt nhất trong lịch sử iPhone.</p>
  </section>
  <section class="rd-design">
    <h3>6 màu sắc và Liquid Retina</h3>
    <ul>
      <li>Màn hình Liquid Retina LCD 6.1 inch — tấm LCD sắc nét nhất từng có trên smartphone</li>
      <li>6 màu sắc: Đen, Trắng, Xanh, San hô, Vàng, Đỏ — cá tính đa dạng</li>
      <li>Khung nhôm cùng màu mặt sau — thiết kế đồng bộ hoàn hảo</li>
      <li>IP67 chống nước 1m, Ceramic Shield mặt trước</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>A12 Bionic và Face ID</h3>
    <ul>
      <li>A12 Bionic 7nm — chip đầu tiên trong ngành dùng tiến trình 7nm</li>
      <li>Face ID khuôn mặt 3D — bảo mật cao hơn Touch ID, không thể giả mạo</li>
      <li>Neural Engine 8 lõi — AR ứng dụng, nhận diện ảnh thời gian thực</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera đơn 12MP xuất sắc</h3>
    <p>Camera Wide 12MP f/1.8 với Smart HDR, Portrait Mode, Depth Control. Night Mode không có nhưng kết quả chụp tối vẫn rất tốt nhờ OIS. Video 4K 60fps. Pin 16 giờ — nhiều hơn iPhone X tới 1.5 giờ.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone XR, Cáp Lightning, Tai nghe EarPods, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.1" Liquid Retina HD (LCD)',
          'Chip': 'A12 Bionic',
          'RAM': '3GB',
          'Dung lượng': '64GB / 128GB / 256GB',
          'Camera': '12MP Wide',
          'Pin': 'Video lên đến 16 giờ',
          'Kết nối': 'Lightning',
          'Chống nước': 'IP67',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '64GB', priceModifier: 0, stock: 18 },
          { name: 'Dung lượng', value: '128GB', priceModifier: 3000000, stock: 20 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 6000000, stock: 12 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 8 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 8 },
          { name: 'Màu sắc', value: 'Xanh Lơ', colorHex: '#4a90d9', stock: 7 },
          { name: 'Màu sắc', value: 'San hô', colorHex: '#ff7f6e', stock: 7 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 6 },
          { name: 'Màu sắc', value: 'Đỏ', colorHex: '#e53935', stock: 6 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'A12 Bionic',
          ram: '3GB',
          warrantyMonths: 12,
          rating: 4.4,
          totalReviews: 8120,
          searchKeywords: ['iphone xr', 'face id', 'colorful iphone', 'budget iphone'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          promotionalCopy: '6 màu sắc — Chọn phong cách riêng',
        },
      },
      // ── iPhone 17 Series ─────────────────────────────────────────────────
      {
        name: 'iPhone 17', slug: 'iphone-17',
        tagline: 'Hoàn toàn mới. Hoàn toàn thông minh.', shortDescription: 'A19 — Dynamic Island — Camera 48MP — USB-C',
        price: 22990000,
        images: [
          'https://cdn.tgdd.vn/Products/Images/42/342667/iphone-17-tim-thumb-0-600x600.jpg',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-17-256gb-5.jpg',
        ],
        stock: 60, sold: 0,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 17 — Chip A19, Camera 48MP nâng cấp, Apple Intelligence thế hệ mới</h2>
    <p>iPhone 17 đánh dấu bước tiến đột phá của dòng iPhone tiêu chuẩn với chip A19 hoàn toàn mới và hệ thống camera được nâng cấp toàn diện. Dynamic Island quen thuộc, cổng USB-C, và RAM 8GB đảm bảo hiệu năng mượt mà cho Apple Intelligence trong nhiều năm tới.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip A19 — Nền tảng AI thế hệ mới</h3>
    <ul>
      <li>A19 tiến trình 3nm thế hệ 3 — hiệu năng CPU tăng 20%, tiết kiệm điện hơn 30%</li>
      <li>Neural Engine thế hệ mới — Apple Intelligence xử lý on-device nhanh và bảo mật</li>
      <li>RAM 8GB LPDDR5X — đủ mạnh chạy đồng thời nhiều tác vụ AI phức tạp</li>
      <li>GPU thế hệ mới hỗ trợ hardware ray tracing, gaming AAA mượt mà</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera 48MP nâng cấp — Chụp đẹp hơn, thông minh hơn</h3>
    <ul>
      <li><strong>Camera Fusion 48MP</strong> f/1.6 — sensor mới với thu sáng tốt hơn 25%</li>
      <li><strong>Camera Ultra Wide 12MP</strong> — góc 120 độ siêu rộng cho phong cảnh</li>
      <li>Photographic Styles thế hệ 5 — AI hiểu phong cách của bạn và áp dụng nhất quán</li>
      <li>Video 4K 120fps, Dolby Vision, Log encoding trực tiếp trên máy</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế và Tính năng</h3>
    <p>Màn hình Super Retina XDR 6.1 inch OLED, Dynamic Island, Ceramic Shield thế hệ 3. Mặt kính sau frosted mờ chống bám vân tay. IP68, USB-C, MagSafe 30W sạc nhanh gấp đôi. Pin 22 giờ xem video.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 17, Cáp USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.1" Super Retina XDR',
          'Chip': 'Apple A19',
          'RAM': '8GB',
          'Dung lượng': '128GB / 256GB / 512GB / 1TB',
          'Camera': '48MP Fusion + 12MP Ultra Wide',
          'Pin': 'Video lên đến 22 giờ',
          'Kết nối': 'USB-C',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 20 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 4000000, stock: 20 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 8000000, stock: 15 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 12000000, stock: 5 },
          { name: 'Màu sắc', value: 'Xanh Mước', colorHex: '#8fbc8f', stock: 15 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 15 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 15 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 15 },
        ],
        extraMetadata: {
          badge: 'Mới',
          chip: 'Apple A19',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 0,
          searchKeywords: ['iphone 17', 'new iphone 2025', 'apple a19', 'dynamic island'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: 'A19 chip — Thông minh hơn bao giờ hết',
        },
      },
      {
        name: 'iPhone 17 Air', slug: 'iphone-17-air',
        tagline: 'Mỏng. Nhẹ. Đột phá.', shortDescription: 'A19 — 6.6" — Chỉ 5.6mm — Camera đơn 48MP',
        price: 29990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:100/plain/https://cellphones.com.vn/media/wysiwyg/Phone/Apple/iPhone-Air/iphone-air-30.jpg',
        ],
        stock: 40, sold: 0,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 17 Air — Chỉ 5.6mm, iPhone mỏng nhất lịch sử Apple</h2>
    <p>iPhone 17 Air phá vỡ mọi kỷ lục về thiết kế: chỉ 5.6mm mỏng — mỏng hơn một chiếc bút chì — trong khi vẫn giữ đầy đủ hiệu năng A19 và camera 48MP. Màn hình OLED 6.6 inch tràn viền, khung titanium-nhôm hybrid, và công nghệ pin stacked-cell cho thời lượng vượt kỳ vọng.</p>
  </section>
  <section class="rd-design">
    <h3>Thiết kế 5.6mm — Kỷ lục mọi thời đại</h3>
    <ul>
      <li>Chỉ 5.6mm mỏng — iPhone mỏng nhất từ trước đến nay, mỏng hơn Galaxy Z Fold 5 đóng lại</li>
      <li>Khung titanium-nhôm hybrid — nhẹ như nhôm, cứng như titanium</li>
      <li>Màn hình OLED 6.6 inch tràn viền với viền bezels siêu mỏng mọi phía</li>
      <li>Camera đơn 48MP bố cục nằm ngang độc đáo — thiết kế nhận diện ngay lập tức</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>A19 và Pin Stacked-Cell</h3>
    <ul>
      <li>Chip A19 3nm thế hệ 3 — hiệu năng đầy đủ, không thỏa hiệp vì mỏng</li>
      <li>RAM 8GB — Apple Intelligence on-device, đa nhiệm không gián đoạn</li>
      <li>Pin stacked-cell — tích trữ nhiều năng lượng hơn trong không gian mỏng, 20 giờ xem video</li>
    </ul>
  </section>
  <section class="rd-connectivity">
    <h3>Kết nối và Bảo mật</h3>
    <ul>
      <li>Chỉ eSIM — không SIM vật lý, gọn hơn, bảo mật hơn</li>
      <li>Face ID dưới màn hình — selfie camera ẩn, màn hình toàn phần thực sự</li>
      <li>USB-C, Wi-Fi 7, Bluetooth 5.4, UWB, IP68</li>
      <li>MagSafe thế hệ mới, sạc không dây tích hợp trong thiết kế cực mỏng</li>
    </ul>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 17 Air, Cáp USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.6" Super Retina XDR OLED',
          'Chip': 'Apple A19',
          'RAM': '8GB',
          'Dung lượng': '256GB / 512GB / 1TB',
          'Camera': '48MP Fusion (đơn)',
          'Pin': 'Video lên đến 20 giờ',
          'Kết nối': 'USB-C, eSIM',
          'Chống nước': 'IP68',
          'Độ dày': '5.6mm',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '256GB', priceModifier: 0, stock: 15 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 4000000, stock: 15 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 8000000, stock: 10 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 20 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 15 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 10 },
        ],
        extraMetadata: {
          badge: 'Mới',
          chip: 'Apple A19',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 0,
          searchKeywords: ['iphone 17 air', 'iphone slim', 'thin iphone', 'ultrathin', 'iphone 17 thin'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: '5.6mm — iPhone mỏng nhất lịch sử',
        },
      },
      {
        name: 'iPhone 17 Pro', slug: 'iphone-17-pro',
        tagline: 'Pro. Thông minh. Vượt trội.', shortDescription: 'A19 Pro — Titanium — Camera 48MP ba ống kính',
        price: 34990000, originalPrice: 37990000,
        images: [
          'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/iphone_17_pro_max_silver_1_7b25d56e26.png',
          'https://hugotech.vn/wp-content/uploads/iPhone-17-Pro-bac-1-600x600.jpg',
        ],
        stock: 45, sold: 0,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 17 Pro — A19 Pro, Face ID dưới màn hình, Camera Control, hệ thống camera ba ống kính 48MP</h2>
    <p>iPhone 17 Pro định nghĩa lại Pro là gì: Face ID ẩn hoàn toàn dưới màn hình, chip A19 Pro 3nm với Neural Engine mạnh nhất từ trước đến nay, và hệ thống camera triple 48MP không thỏa hiệp. Camera Control vật lý cho phép điều khiển camera chuyên nghiệp mà không cần chạm màn hình.</p>
  </section>
  <section class="rd-design">
    <h3>Face ID dưới màn hình — Màn hình toàn phần thực sự</h3>
    <ul>
      <li>Face ID ẩn hoàn toàn dưới OLED — không notch, không Dynamic Island, không đục lỗ</li>
      <li>Super Retina XDR 6.3 inch ProMotion 120Hz Always-On — viền siêu mỏng đồng đều</li>
      <li>Khung titanium Grade 5 tinh chế — nhẹ và cứng hơn thép không gỉ</li>
      <li>Camera Control vật lý capacitive — chụp ảnh, quay video, zoom bằng nút riêng</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera Triple 48MP — Studio di động chuyên nghiệp</h3>
    <ul>
      <li><strong>Camera Fusion 48MP</strong> f/1.78 — sensor lớn nhất trên iPhone Pro 6.3 inch</li>
      <li><strong>Camera Ultra Wide 48MP</strong> f/2.2 — macro 12mm, chi tiết vi mô siêu nét</li>
      <li><strong>Camera Telephoto 5x</strong> 120mm f/2.8 — periscope zoom quang học thực sự</li>
      <li>ProRes 4K 120fps, Log video, ProRAW 48MP — workflow hậu kỳ chuyên nghiệp</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>A19 Pro — Neural Engine thế hệ mới</h3>
    <p>A19 Pro 3nm thế hệ 3, CPU 6 lõi, GPU 6 lõi ray tracing, Neural Engine 16+ lõi. RAM 12GB LPDDR5X — chạy đồng thời model AI phức tạp và workflow Pro. USB 3 (USB-C) 10Gb/s, Wi-Fi 7, Pin 27 giờ, sạc MagSafe 30W.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 17 Pro, Cáp USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.3" Super Retina XDR, ProMotion 120Hz',
          'Chip': 'Apple A19 Pro',
          'RAM': '12GB',
          'Dung lượng': '256GB / 512GB / 1TB / 2TB',
          'Camera': '48MP Fusion + 48MP Ultra Wide + 5x Telephoto',
          'Pin': 'Video lên đến 27 giờ',
          'Kết nối': 'USB 3 (USB-C)',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '256GB', priceModifier: 0, stock: 15 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 5000000, stock: 12 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 10000000, stock: 10 },
          { name: 'Dung lượng', value: '2TB', priceModifier: 15000000, stock: 8 },
          { name: 'Màu sắc', value: 'Titan Tự Nhiên', colorHex: '#b8b0a8', stock: 12 },
          { name: 'Màu sắc', value: 'Titan Đen', colorHex: '#3a3a3c', stock: 10 },
          { name: 'Màu sắc', value: 'Titan Trắng', colorHex: '#e8e4df', stock: 10 },
          { name: 'Màu sắc', value: 'Titan Xám', colorHex: '#9a9a9a', stock: 8 },
        ],
        extraMetadata: {
          badge: 'Mới',
          chip: 'Apple A19 Pro',
          ram: '12GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 0,
          searchKeywords: ['iphone 17 pro', 'apple a19 pro', 'pro titanium', '48mp camera', 'camera control'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: 'A19 Pro — Neural Engine thế hệ mới',
        },
      },
      {
        name: 'iPhone 17 Pro Max', slug: 'iphone-17-pro-max',
        tagline: 'Pro Max. Tất cả trong tầm tay.', shortDescription: 'A19 Pro — 6.9" — Camera 48MP — Pin 33 giờ',
        price: 39990000, originalPrice: 43990000,
        images: [
          'https://cdn2.cellphones.com.vn/x/media/catalog/product/i/p/iphone-17-pro-max_3_1_1_1_1_1_1.jpg',
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-17-pro-max-5.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKZmXSO0gENTzxq9zD7r6d0P7FOLsU2EjRGw&s',
        ],
        stock: 30, sold: 0,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPhone 17 Pro Max — Màn hình 6.9 inch, pin 33 giờ, camera 48MP triple — tất cả trong một</h2>
    <p>iPhone 17 Pro Max là đỉnh cao tuyệt đối của công nghệ di động: màn hình Super Retina XDR 6.9 inch lớn nhất lịch sử iPhone, pin 33 giờ xem video kỷ lục, camera triple 48MP với zoom quang học 5x từ 120mm, và Face ID ẩn hoàn toàn dưới màn hình. Không có gì tốt hơn trong thế giới smartphone.</p>
  </section>
  <section class="rd-display">
    <h3>Màn hình 6.9 inch — Lớn nhất, đẹp nhất</h3>
    <ul>
      <li>Super Retina XDR OLED 6.9 inch ProMotion 120Hz Always-On — viền siêu mỏng 1.15mm</li>
      <li>2868 x 1320 pixels, 460 ppi, HDR Dolby Vision, ProMotion LTPO 1–120Hz</li>
      <li>Độ sáng 3000 nits đỉnh HDR — nhìn rõ dưới nắng chói chang</li>
      <li>Face ID dưới màn hình — không đục lỗ, không notch, màn hình toàn phần</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera Triple 48MP — Đỉnh cao chụp ảnh di động</h3>
    <ul>
      <li><strong>Fusion 48MP</strong> f/1.78 — sensor lớn nhất, chụp tối xuất sắc</li>
      <li><strong>Ultra Wide 48MP</strong> f/2.2 — macro 12mm siêu chi tiết</li>
      <li><strong>Telephoto 5x periscope</strong> 120mm f/2.8 — zoom như máy ảnh chuyên nghiệp</li>
      <li>ProRes 4K 120fps, Log encoding, ProRAW 48MP, Camera Control vật lý</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin 33 giờ và Hiệu năng</h3>
    <ul>
      <li>33 giờ xem video — kỷ lục toàn bộ lịch sử iPhone</li>
      <li>A19 Pro 3nm thế hệ 3, RAM 12GB LPDDR5X — mạnh nhất mọi thời đại</li>
      <li>GPU 6 lõi ray tracing hardware, sạc MagSafe 30W, USB 3 10Gb/s, Wi-Fi 7, IP68</li>
    </ul>
  </section>
</div>`,
        whatsInTheBox: 'iPhone 17 Pro Max, Cáp USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.9" Super Retina XDR, ProMotion 120Hz',
          'Chip': 'Apple A19 Pro',
          'RAM': '12GB',
          'Dung lượng': '256GB / 512GB / 1TB / 2TB',
          'Camera': '48MP Fusion + 48MP Ultra Wide + 5x Telephoto',
          'Pin': 'Video lên đến 33 giờ',
          'Kết nối': 'USB 3 (USB-C)',
          'Chống nước': 'IP68',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '256GB', priceModifier: 0, stock: 10 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 5000000, stock: 8 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 10000000, stock: 6 },
          { name: 'Dung lượng', value: '2TB', priceModifier: 15000000, stock: 6 },
          { name: 'Màu sắc', value: 'Titan Tự Nhiên', colorHex: '#b8b0a8', stock: 8 },
          { name: 'Màu sắc', value: 'Titan Đen', colorHex: '#3a3a3c', stock: 8 },
          { name: 'Màu sắc', value: 'Titan Trắng', colorHex: '#e8e4df', stock: 7 },
          { name: 'Màu sắc', value: 'Titan Xám', colorHex: '#9a9a9a', stock: 7 },
        ],
        extraMetadata: {
          badge: 'Mới',
          chip: 'Apple A19 Pro',
          ram: '12GB',
          warrantyMonths: 24,
          rating: 5.0,
          totalReviews: 0,
          searchKeywords: ['iphone 17 pro max', 'apple a19 pro', 'largest iphone', 'max battery', '6.9 inch'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: 'Pin 33 giờ — iPhone lớn nhất, mạnh nhất',
        },
      },
    ];
  }

  private genMacs(cat: Category) {
    return [
      // ── MacBook Air ──────────────────────────────────────────────────────
      {
        name: 'MacBook Air M4 13"', slug: 'macbook-air-13-m4',
        tagline: 'Nhẹ. Nhanh. Không quạt.', shortDescription: 'Chip M4 — Mỏng 1.13cm — Pin 18 giờ',
        price: 27990000, originalPrice: 29990000,
        images: [
          'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/335364/macbook-air-13-inch-m4-1-638769628628676456-750x500.jpg',
        ],
        stock: 35, sold: 256,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>MacBook Air M4 13" — Chip M4, im lặng tuyệt đối, pin 18 giờ, mỏng 1.13cm</h2>
    <p>MacBook Air M4 là laptop hoàn hảo nhất Apple từng tạo ra: chip M4 10 lõi CPU mạnh mẽ trong thiết kế không quạt tản nhiệt, nặng chỉ 1.24kg, mỏng 1.13cm. Một chiếc máy làm việc suốt cả ngày mà không cần cắm sạc — pin 18 giờ và Apple Intelligence sẵn sàng.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip M4 — Hiệu năng Pro, thiết kế Air</h3>
    <ul>
      <li>CPU 10 lõi (4 hiệu suất + 6 tiết kiệm) — nhanh hơn 28% so với M3</li>
      <li>GPU 10 lõi — đồ họa mượt mà, xuất video 4K nhanh, game macOS không giật</li>
      <li>Neural Engine 38 lõi — Apple Intelligence on-device tức thì, bảo mật tuyệt đối</li>
      <li>RAM 16GB lên đến 32GB — đa nhiệm không giới hạn, chạy model AI cục bộ</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế không quạt, im lặng tuyệt đối</h3>
    <ul>
      <li>Không quạt tản nhiệt — làm việc trong thư viện, phòng họp, không tiếng động</li>
      <li>Mỏng 1.13cm, nặng 1.24kg — nhẹ hơn nhiều ultrabook Windows cùng phân khúc</li>
      <li>Hỗ trợ hai màn hình ngoài đồng thời khi dùng với dock — lần đầu tiên trên Air</li>
      <li>4 màu sắc: Đen Midnight, Bạc, Xanh Mướp, Tím — đẹp và bền bỉ</li>
    </ul>
  </section>
  <section class="rd-connectivity">
    <h3>Màn hình và Kết nối</h3>
    <p>Liquid Retina 13.6 inch 2560x1664 500 nits, True Tone, P3 Wide Color. MagSafe 3, 2x Thunderbolt/USB 4 (40Gb/s), Jack 3.5mm. Wi-Fi 6E, Bluetooth 5.3. Webcam 12MP Center Stage. Bàn phím Touch ID, trackpad Force Touch.</p>
  </section>
</div>`,
        whatsInTheBox: 'MacBook Air M4, Adapter USB-C 35W, Cáp USB-C sang MagSafe 3 (2m)',
        specs: {
          'Chip': 'Apple M4 (10-core CPU, 10-core GPU)',
          'RAM': '16GB / 24GB',
          'SSD': '256GB / 512GB / 1TB / 2TB',
          'Màn hình': '13.6" Liquid Retina (2560×1664)',
          'Pin': 'Lên đến 18 giờ',
          'Cổng': 'MagSafe 3, 2× Thunderbolt/USB 4, Jack 3.5mm',
          'Wi-Fi': 'Wi-Fi 6E',
          'Trọng lượng': '1.24 kg',
        },
        category: cat,
        variants: [
          { name: 'RAM', value: '16GB', priceModifier: 0, stock: 15 },
          { name: 'RAM', value: '24GB', priceModifier: 4000000, stock: 10 },
          { name: 'SSD', value: '256GB', priceModifier: 0, stock: 10 },
          { name: 'SSD', value: '512GB', priceModifier: 4000000, stock: 10 },
          { name: 'SSD', value: '1TB', priceModifier: 8000000, stock: 8 },
          { name: 'Màu sắc', value: 'Đen Midnight', colorHex: '#1d1d1f', stock: 12 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 10 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 8 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 5 },
        ],
        extraMetadata: {
          badge: 'Mới',
          chip: 'Apple M4',
          ram: '16GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 234,
          searchKeywords: ['macbook air m4', 'apple m4', 'thin laptop', 'fanless', 'lightweight'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: 'M4 chip — Silent. Swift. Stunning.',
        },
      },
      {
        name: 'MacBook Air M4 15"', slug: 'macbook-air-15-m4',
        tagline: 'Lớn hơn. Nhẹ hơn bao giờ hết.', shortDescription: 'Màn hình 15.3 inch — Chip M4 — Không quạt',
        price: 32990000,
        images: [
          'https://cdn.tgdd.vn/Products/Images/44/335372/s16/macbook-air-15-inch-m4-thumb-vang-650x650.png',
        ],
        stock: 20, sold: 145,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>MacBook Air M4 15" — Màn hình 15.3 inch, 6 loa Spatial Audio, nhẹ nhất thế giới cho 15 inch</h2>
    <p>MacBook Air 15 inch M4 mang đến không gian làm việc rộng rãi trong thiết kế mỏng nhẹ không tưởng cho một laptop 15 inch. Chỉ 1.51kg — nhẹ hơn nhiều laptop 13 inch Windows cao cấp. 6 loa Spatial Audio và màn hình Liquid Retina 15.3 inch tạo nên trải nghiệm giải trí đẳng cấp.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip M4 đầy đủ — Không quạt, không ồn</h3>
    <ul>
      <li>CPU 10 lõi, GPU 10 lõi — hiệu năng đủ cho mọi workflow sáng tạo</li>
      <li>Neural Engine 38 lõi — Apple Intelligence, xử lý ảnh AI tức thì</li>
      <li>RAM 16GB–32GB unified memory — đa nhiệm thoải mái cả ngày</li>
      <li>Tản nhiệt passive — im lặng hoàn toàn, không giảm hiệu năng</li>
    </ul>
  </section>
  <section class="rd-audio">
    <h3>6 loa Spatial Audio — Xem phim như rạp chiếu</h3>
    <ul>
      <li>6 tấm loa Spatial Audio với Dolby Atmos — âm thanh 3D vây quanh từ laptop</li>
      <li>Hai tweeter riêng biệt cho âm thanh trong trẻo, bốn woofer cho bass sâu</li>
      <li>Webcam 12MP Center Stage — video call tự động theo dõi khuôn mặt</li>
    </ul>
  </section>
  <section class="rd-display">
    <h3>Màn hình 15.3 inch và Pin</h3>
    <p>Liquid Retina 15.3 inch 2880x1864, True Tone, P3 Wide, 500 nits. Pin 18 giờ, MagSafe 3, 2x Thunderbolt 4, Jack 3.5mm, Wi-Fi 6E. Nặng 1.51kg — nhẹ nhất thế giới cho laptop 15 inch.</p>
  </section>
</div>`,
        whatsInTheBox: 'MacBook Air 15" M4, Adapter USB-C 35W, Cáp MagSafe 3',
        specs: {
          'Chip': 'Apple M4 (10-core CPU, 10-core GPU)',
          'RAM': '16GB / 24GB',
          'SSD': '256GB / 512GB / 1TB',
          'Màn hình': '15.3" Liquid Retina (2880×1864)',
          'Pin': 'Lên đến 18 giờ',
          'Cổng': 'MagSafe 3, 2× Thunderbolt/USB 4, Jack 3.5mm',
          'Loa': '6 loa Spatial Audio',
          'Trọng lượng': '1.51 kg',
        },
        category: cat,
        variants: [
          { name: 'RAM', value: '16GB', priceModifier: 0, stock: 8 },
          { name: 'RAM', value: '24GB', priceModifier: 4000000, stock: 6 },
          { name: 'SSD', value: '256GB', priceModifier: 0, stock: 7 },
          { name: 'SSD', value: '512GB', priceModifier: 4000000, stock: 7 },
          { name: 'SSD', value: '1TB', priceModifier: 8000000, stock: 6 },
          { name: 'Màu sắc', value: 'Đen Midnight', colorHex: '#1d1d1f', stock: 7 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 7 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 6 },
        ],
        extraMetadata: {
          chip: 'Apple M4',
          ram: '16GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 132,
          searchKeywords: ['macbook air 15 m4', 'large screen macbook air', '15 inch laptop'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: '6 loa Spatial Audio — Âm thanh đắm chìm',
        },
      },
      {
        name: 'MacBook Air M3 13"', slug: 'macbook-air-13-m3',
        tagline: 'M3. Im lặng. Mạnh mẽ.', shortDescription: 'Chip M3 — 3nm — Liquid Retina',
        price: 23990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:100/plain/https://cellphones.com.vn/media/wysiwyg/laptop/macbook/Air/M3-2024/macbook-air-m3-13-inch-2024-16gb-256gb-6_1.jpg',
        ],
        stock: 40, sold: 890,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>MacBook Air M3 13" — Chip 3nm đầu tiên trên laptop, ray tracing, Wi-Fi 6E</h2>
    <p>MacBook Air M3 mang đến bước nhảy vọt công nghệ quan trọng: chip M3 3nm đầu tiên trên laptop thế giới với GPU hỗ trợ ray tracing tăng tốc phần cứng — đổ bóng thực tế trong game và ứng dụng 3D. Hiệu năng CPU tăng 35% so với M1 Air trong cùng thiết kế không quạt tản nhiệt.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip M3 3nm — Công nghệ tiên phong</h3>
    <ul>
      <li>Tiến trình 3nm TSMC N3E — mật độ transistor cao hơn, tiết kiệm điện hơn 40% so với 5nm</li>
      <li>CPU 8 lõi — nhanh hơn 35% so với M1 MacBook Air</li>
      <li>GPU 10 lõi với hardware ray tracing — đổ bóng, phản chiếu thực tế trong game macOS</li>
      <li>RAM 8GB–24GB, SSD 256GB–2TB — cấu hình linh hoạt theo nhu cầu</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế im lặng quen thuộc</h3>
    <ul>
      <li>Không quạt tản nhiệt — im lặng hoàn toàn, nhiệt độ ổn định trong mọi tác vụ</li>
      <li>Nặng 1.24kg, mỏng 1.13cm — thiết kế mỏng nhẹ như Air truyền thống</li>
      <li>Wi-Fi 6E — tốc độ không dây nhanh hơn Wi-Fi 6 thường đến 3 lần</li>
      <li>4 màu: Đen Midnight, Bạc, Xám, Vàng — đa dạng phong cách</li>
    </ul>
  </section>
  <section class="rd-display">
    <h3>Màn hình và Pin</h3>
    <p>Liquid Retina 13.6 inch 2560x1664, 500 nits, True Tone, P3. Pin 18 giờ, MagSafe 3, 2x Thunderbolt 4, Jack 3.5mm. Webcam 1080p FaceTime HD, Touch ID, trackpad Force Touch. Apple Intelligence ready.</p>
  </section>
</div>`,
        whatsInTheBox: 'MacBook Air M3 13", Adapter USB-C 30W, Cáp MagSafe 3',
        specs: {
          'Chip': 'Apple M3 (8-core CPU, 10-core GPU)',
          'RAM': '8GB / 16GB / 24GB',
          'SSD': '256GB / 512GB / 1TB',
          'Màn hình': '13.6" Liquid Retina (2560×1664)',
          'Pin': 'Lên đến 18 giờ',
          'Cổng': 'MagSafe 3, 2× Thunderbolt/USB 4, Jack 3.5mm',
          'Wi-Fi': 'Wi-Fi 6E',
          'Trọng lượng': '1.24 kg',
        },
        category: cat,
        variants: [
          { name: 'RAM', value: '8GB', priceModifier: 0, stock: 10 },
          { name: 'RAM', value: '16GB', priceModifier: 4000000, stock: 15 },
          { name: 'RAM', value: '24GB', priceModifier: 8000000, stock: 8 },
          { name: 'SSD', value: '256GB', priceModifier: 0, stock: 12 },
          { name: 'SSD', value: '512GB', priceModifier: 4000000, stock: 10 },
          { name: 'SSD', value: '1TB', priceModifier: 8000000, stock: 8 },
          { name: 'Màu sắc', value: 'Đen Midnight', colorHex: '#1d1d1f', stock: 12 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 10 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 8 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 5 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'Apple M3',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 812,
          searchKeywords: ['macbook air m3', 'm3 chip', '3nm laptop', 'fanless mac'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'M3 3nm — Ray tracing tăng tốc 2×',
        },
      },
      // ── MacBook Pro ─────────────────────────────────────────────────────
      {
        name: 'MacBook Pro 14" M4 Pro', slug: 'macbook-pro-14-m4-pro',
        tagline: 'Chuyên nghiệp. Hiệu năng đỉnh cao.', shortDescription: 'M4 Pro — 48GB RAM — Liquid Retina XDR 120Hz',
        price: 52990000, originalPrice: 57990000,
        images: [
          'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/mbp14-m4-2024.png',
        ],
        stock: 25, sold: 98,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>MacBook Pro 14" M4 Pro — Thunderbolt 5, ProMotion 120Hz, 20 giờ pin cho chuyên gia</h2>
    <p>MacBook Pro 14 inch M4 Pro là laptop chuyên nghiệp toàn năng nhất cho developer, video editor và 3D artist. Chip M4 Pro 12 lõi CPU, Thunderbolt 5 tốc độ 120Gb/s, màn hình Liquid Retina XDR 120Hz lên đến 1600 nits HDR. Làm bất kỳ thứ gì, nhanh hơn bao giờ hết.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip M4 Pro — Mạnh cho mọi workflow</h3>
    <ul>
      <li>CPU 12 lõi (8 hiệu suất + 4 tiết kiệm) — compile, render nhanh hơn 20% so với M3 Pro</li>
      <li>GPU 16 lõi — 3D rendering, game macOS, video xuất 4K ProRes cực nhanh</li>
      <li>RAM 24GB–48GB unified memory — chạy Docker, Xcode, Final Cut Pro cùng lúc không giật</li>
      <li>SSD tốc độ 7GB/s — mở project 100GB trong vài giây</li>
    </ul>
  </section>
  <section class="rd-connectivity">
    <h3>Thunderbolt 5 — Kết nối thế hệ mới</h3>
    <ul>
      <li>3x Thunderbolt 5 (120Gb/s) — kết nối 8K display, RAID NVMe, eGPU</li>
      <li>HDMI 2.1 (4K 240Hz hoặc 8K 60Hz), SD card UHS-II, Jack 3.5mm hi-fi</li>
      <li>MagSafe 3 96W sạc nhanh, Wi-Fi 6E, Bluetooth 5.3</li>
    </ul>
  </section>
  <section class="rd-display">
    <h3>Màn hình XDR và Pin</h3>
    <p>Liquid Retina XDR 14.2 inch ProMotion 120Hz, 1000 nits thường, 1600 nits HDR peak. Webcam 12MP Center Stage, 6 loa Spatial Audio, 3 micro array. Pin 20 giờ, nặng 1.60kg.</p>
  </section>
</div>`,
        whatsInTheBox: 'MacBook Pro 14", Adapter USB-C 96W, Cáp MagSafe 3',
        specs: {
          'Chip': 'Apple M4 Pro (12-core CPU, 16-core GPU)',
          'RAM': '24GB / 48GB',
          'SSD': '512GB / 1TB / 2TB / 4TB',
          'Màn hình': '14.2" Liquid Retina XDR, ProMotion 120Hz',
          'Pin': 'Lên đến 20 giờ',
          'Cổng': 'MagSafe 3, 3× Thunderbolt 5, HDMI, SD',
          'Camera': '12MP Center Stage',
          'Trọng lượng': '1.60 kg',
        },
        category: cat,
        variants: [
          { name: 'RAM', value: '24GB', priceModifier: 0, stock: 10 },
          { name: 'RAM', value: '48GB', priceModifier: 8000000, stock: 8 },
          { name: 'SSD', value: '512GB', priceModifier: 0, stock: 8 },
          { name: 'SSD', value: '1TB', priceModifier: 6000000, stock: 7 },
          { name: 'SSD', value: '2TB', priceModifier: 12000000, stock: 5 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 12 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 13 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'Apple M4 Pro',
          ram: '24GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 89,
          searchKeywords: ['macbook pro 14 m4 pro', 'pro laptop', 'thunderbolt 5', 'video editing'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: 'Thunderbolt 5 — Kết nối mọi thứ',
        },
      },
      {
        name: 'MacBook Pro 16" M4 Max', slug: 'macbook-pro-16-m4-max',
        tagline: 'Máy Mac mạnh nhất từng có.', shortDescription: 'M4 Max — 128GB RAM — Quản lý bộ nhớ 512GB/s',
        price: 89990000, originalPrice: 99990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_1__6_142.png',
        ],
        stock: 12, sold: 45,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>MacBook Pro 16" M4 Max — 128GB RAM, GPU 40 lõi, workstation di động mạnh nhất thế giới</h2>
    <p>MacBook Pro 16 inch M4 Max không phải laptop — đây là workstation di động. Chip M4 Max với 16 lõi CPU và GPU 40 lõi mang hiệu năng render 3D, machine learning và video 8K vào thiết kế 2.14kg. 128GB unified memory với băng thông bộ nhớ 512GB/s — nhanh hơn nhiều server truyền thống.</p>
  </section>
  <section class="rd-performance">
    <h3>M4 Max — Sức mạnh không giới hạn</h3>
    <ul>
      <li>CPU 16 lõi (12 hiệu suất + 4 tiết kiệm) — nhanh hơn 4x so với MacBook Pro Intel M1 generation</li>
      <li>GPU 40 lõi — render 3D, VFX, game AAA: tốc độ ngang workstation trạm desktop chuyên dụng</li>
      <li>128GB unified memory — chạy đồng thời multiple 4K streams, large ML models</li>
      <li>Băng thông bộ nhớ 512GB/s — xử lý dữ liệu lớn không bị bottleneck</li>
    </ul>
  </section>
  <section class="rd-media">
    <h3>Media Production đỉnh cao</h3>
    <ul>
      <li>Xuất ProRes 4K 60fps trong Final Cut Pro — nhanh hơn 6x so với xuất qua phần mềm</li>
      <li>Training model AI PyTorch, TensorFlow trực tiếp trên máy — không cần cloud</li>
      <li>Video 8K timeline trong Final Cut Pro không giật, không cần proxy</li>
      <li>3x Thunderbolt 5 (120Gb/s), HDMI 2.1, SD card UHS-II, MagSafe 3 140W</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin 24 giờ và Màn hình</h3>
    <p>Pin 24 giờ xem video — lâu nhất trên Mac laptop từ trước đến nay. Liquid Retina XDR 16.2 inch ProMotion 120Hz, 1600 nits HDR. 6 loa Spatial Audio, 3 micro beamforming. Wi-Fi 6E, nặng 2.14kg.</p>
  </section>
</div>`,
        whatsInTheBox: 'MacBook Pro 16", Adapter USB-C 140W, Cáp MagSafe 3',
        specs: {
          'Chip': 'Apple M4 Max (16-core CPU, 40-core GPU)',
          'RAM': '64GB / 128GB',
          'SSD': '1TB / 2TB / 4TB / 8TB',
          'Màn hình': '16.2" Liquid Retina XDR, ProMotion 120Hz',
          'Pin': 'Lên đến 24 giờ',
          'Cổng': 'MagSafe 3, 3× Thunderbolt 5, HDMI, SD',
          'Trọng lượng': '2.14 kg',
        },
        category: cat,
        variants: [
          { name: 'RAM', value: '64GB', priceModifier: 0, stock: 5 },
          { name: 'RAM', value: '128GB', priceModifier: 16000000, stock: 3 },
          { name: 'SSD', value: '1TB', priceModifier: 0, stock: 5 },
          { name: 'SSD', value: '2TB', priceModifier: 6000000, stock: 4 },
          { name: 'SSD', value: '4TB', priceModifier: 12000000, stock: 3 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 6 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 6 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'Apple M4 Max',
          ram: '64GB',
          warrantyMonths: 24,
          rating: 5.0,
          totalReviews: 41,
          searchKeywords: ['macbook pro 16 m4 max', 'workstation laptop', 'machine learning', '8k video'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: '24 giờ pin — Không đối thủ',
        },
      },
      {
        name: 'MacBook Pro 14" M3 Pro', slug: 'macbook-pro-14-m3-pro',
        tagline: 'Pro cho mọi người.', shortDescription: 'Chip M3 Pro — 18GB RAM — Liquid Retina XDR',
        price: 39990000,
        images: [
          'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2023/10/Apple-MacBook-Pro-M2-Pro-and-M2-Max-hero-230117_Full-Bleed-Image.jpg.xlarge.jpg',
        ],
        stock: 30, sold: 189,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>MacBook Pro 14" M3 Pro — Chip 3nm đầu tiên Pro, ray tracing, giá tốt nhất dòng Pro</h2>
    <p>MacBook Pro 14 inch M3 Pro là điểm vào hoàn hảo của dòng Pro: chip M3 Pro 3nm với GPU 14 lõi hỗ trợ ray tracing phần cứng lần đầu tiên trên MacBook Pro, ProMotion 120Hz, cổng HDMI và SD card. Hiệu năng mạnh hơn M2 Pro 20% với giá tốt nhất phân khúc.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip M3 Pro — 3nm, ray tracing đầu tiên</h3>
    <ul>
      <li>CPU 11 lõi (5 hiệu suất + 6 tiết kiệm) — compile, build project nhanh</li>
      <li>GPU 14 lõi với hardware ray tracing — đổ bóng thực tế, phản chiếu vật thể 3D</li>
      <li>RAM 18GB unified — SSD streaming hỗ trợ xử lý file lớn hơn RAM</li>
      <li>Tiết kiệm điện hơn 20% so với M2 Pro nhờ tiến trình 3nm</li>
    </ul>
  </section>
  <section class="rd-connectivity">
    <h3>Cổng kết nối đầy đủ</h3>
    <ul>
      <li>2x Thunderbolt 4 (40Gb/s), HDMI 2.1 (4K 144Hz), SD card UHS-II</li>
      <li>Jack 3.5mm hi-fi với headphone impedance detection</li>
      <li>MagSafe 3 96W, Wi-Fi 6E, Bluetooth 5.3</li>
    </ul>
  </section>
  <section class="rd-display">
    <h3>Màn hình XDR và Pin</h3>
    <p>Liquid Retina XDR 14.2 inch ProMotion 120Hz, 1000 nits thường, 1600 nits HDR. Webcam 1080p Center Stage, 6 loa Spatial Audio. Pin 17 giờ, nặng 1.55kg. Màu Xám và Bạc.</p>
  </section>
</div>`,
        whatsInTheBox: 'MacBook Pro 14" M3 Pro, Adapter USB-C 96W, Cáp MagSafe 3',
        specs: {
          'Chip': 'Apple M3 Pro (11-core CPU, 14-core GPU)',
          'RAM': '18GB',
          'SSD': '512GB / 1TB',
          'Màn hình': '14.2" Liquid Retina XDR, ProMotion 120Hz',
          'Pin': 'Lên đến 17 giờ',
          'Cổng': 'MagSafe 3, 2× Thunderbolt/USB 4, HDMI, SD',
          'Trọng lượng': '1.55 kg',
        },
        category: cat,
        variants: [
          { name: 'SSD', value: '512GB', priceModifier: 0, stock: 15 },
          { name: 'SSD', value: '1TB', priceModifier: 6000000, stock: 15 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 15 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 15 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'Apple M3 Pro',
          ram: '18GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 167,
          searchKeywords: ['macbook pro 14 m3 pro', 'm3 pro laptop', '3nm chip', 'ray tracing'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'M3 3nm — Ray tracing hardware-accelerated',
        },
      },
      
      {
        name: 'Mac mini M2', slug: 'mac-mini-m2',
        tagline: 'M2. Nhỏ. Mạnh. Đáng sở hữu.', shortDescription: 'Chip M2 — 8 lõi — HDMI + Ethernet',
        price: 14990000,
        images: [
          'https://cdn2.cellphones.com.vn/x/media/catalog/product/m/a/mac-mini-1_1_3_1.jpg',
        ],
        stock: 35, sold: 890,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Mac mini M2 — Desktop Mac mạnh nhất tầm giá, nhỏ gọn 19.7cm, đủ cổng kết nối</h2>
    <p>Mac mini M2 là cách tiết kiệm nhất để sở hữu sức mạnh Apple Silicon. Chỉ 14.99 triệu đã có chip M2 8 lõi CPU mạnh hơn Intel Core i9 MacBook Pro 2020, cùng với HDMI, Ethernet 10Gb, Thunderbolt 4. Mang màn hình và bàn phím của bạn, Mac mini làm phần còn lại.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip M2 — Mạnh hơn nhiều chip Intel cao cấp</h3>
    <ul>
      <li>CPU 8 lõi (4 hiệu suất + 4 tiết kiệm) — nhanh hơn 18% so với M1</li>
      <li>GPU 10 lõi — xử lý đồ họa, video editing, game macOS mượt mà</li>
      <li>Neural Engine 16 lõi — Apple Intelligence, nhận dạng ảnh tức thì</li>
      <li>RAM 8GB–24GB unified — linh hoạt theo workflow</li>
    </ul>
  </section>
  <section class="rd-connectivity">
    <h3>Kết nối phong phú nhất trong dòng Mac desktop nhỏ</h3>
    <ul>
      <li>2x Thunderbolt 4 (40Gb/s) — kết nối màn hình 6K, SSD ngoài tốc độ cao</li>
      <li>2x USB-A, 1x HDMI 2.0 (4K 60Hz), Ethernet 10Gb — đủ mọi nhu cầu</li>
      <li>Wi-Fi 6E, Bluetooth 5.3 — kết nối không dây tốc độ cao</li>
      <li>Jack 3.5mm hi-fi cho headphone impedance cao</li>
    </ul>
  </section>
  <section class="rd-value">
    <h3>Giá trị tốt nhất trong dòng Mac</h3>
    <p>Mac mini M2 tiêu thụ chỉ 7W khi tải nhẹ — tiết kiệm điện hơn MacBook Air. Kích thước 19.7 x 19.7 x 3.6cm — đặt sau màn hình không chiếm diện tích. Tương thích macOS 15 Sequoia và Apple Intelligence đầy đủ.</p>
  </section>
</div>`,
        whatsInTheBox: 'Mac mini M2, Dây nguồn',
        specs: {
          'Chip': 'Apple M2 (8-core CPU, 10-core GPU)',
          'RAM': '8GB / 16GB / 24GB',
          'SSD': '256GB / 512GB / 1TB / 2TB',
          'Cổng': '2× Thunderbolt 4, 2× USB-A, HDMI, Ethernet 10Gb',
          'Kết nối': 'Wi-Fi 6E, Bluetooth 5.3',
          'Trọng lượng': '1.18 kg',
        },
        category: cat,
        variants: [
          { name: 'RAM', value: '8GB', priceModifier: 0, stock: 12 },
          { name: 'RAM', value: '16GB', priceModifier: 4000000, stock: 10 },
          { name: 'RAM', value: '24GB', priceModifier: 8000000, stock: 6 },
          { name: 'SSD', value: '256GB', priceModifier: 0, stock: 10 },
          { name: 'SSD', value: '512GB', priceModifier: 4000000, stock: 8 },
          { name: 'SSD', value: '1TB', priceModifier: 8000000, stock: 6 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'Apple M2',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 820,
          searchKeywords: ['mac mini m2', 'budget mac', 'home desktop', 'mac desktop'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'Giá từ 14.99 triệu — Mac desktop giá rẻ nhất',
        },
      },
      // ── Mac Studio ───────────────────────────────────────────────────────
      {
        name: 'Mac Studio M4 Max', slug: 'mac-studio-m4-max',
        tagline: 'Siêu năng lực. Siêu nhỏ gọn.', shortDescription: 'M4 Max — 128GB RAM — 8 cổng Thunderbolt',
        price: 69990000,
        images: [
          'https://cdn-media.sforum.vn/storage/app/media/haianh/icemag/danh-gia-apple-mac-studio-m4-max-1.jpg',
        ],
        stock: 15, sold: 67,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Mac Studio M4 Max — Workstation 19.7cm, 12 cổng kết nối, 128GB RAM</h2>
    <p>Mac Studio M4 Max mang hiệu năng workstation đỉnh cao vào hộp máy chỉ 19.7cm vuông. Chip M4 Max với 16 lõi CPU và GPU 40 lõi, 128GB unified memory — không thiết bị di động nào chạy nổi những gì Mac Studio làm, nhưng Mac Studio lại lên đến 12 cổng kết nối không thiết bị nào sánh được.</p>
  </section>
  <section class="rd-performance">
    <h3>M4 Max — Sức mạnh workstation trong 2.14kg</h3>
    <ul>
      <li>CPU 16 lõi — biên dịch code, render video, training AI nhanh hơn PC workstation nhiều lần</li>
      <li>GPU 40 lõi — render 3D real-time, game AAA 120fps, ProRes 8K playback tức thì</li>
      <li>128GB unified memory với băng thông 512GB/s — không bị bottleneck dù xử lý nhiều stream</li>
      <li>Neural Engine 38 lõi — suy luận model ML nhanh hơn 2x so với M2 Ultra</li>
    </ul>
  </section>
  <section class="rd-connectivity">
    <h3>12 cổng kết nối — Hub thiên đường</h3>
    <ul>
      <li>Mặt trước: 2x Thunderbolt 5 (120Gb/s), 1x USB-A, SD card UHS-II</li>
      <li>Mặt sau: 4x Thunderbolt 5, 2x USB-A, HDMI 2.1 (8K), 10Gb Ethernet</li>
      <li>Kết nối cùng lúc: 5 màn hình 6K, 2 màn hình 4K — thao tác như trung tâm điều hành</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế Nhỏ Gọn, Làm Lạnh Tiên Tiến</h3>
    <p>Quạt ly tâm dual impeller hút không khí từ dưới lên, đẩy ra hai bên — làm lạnh hiệu quả không cần hộp máy to lớn. Chỉ 19.7cm vuông đặt trên bàn. Wi-Fi 6E, Bluetooth 5.3. macOS Sequoia với Apple Intelligence.</p>
  </section>
</div>`,
        whatsInTheBox: 'Mac Studio, Dây nguồn',
        specs: {
          'Chip': 'Apple M4 Max (16-core CPU, 40-core GPU)',
          'RAM': '64GB / 128GB',
          'SSD': '1TB / 2TB / 4TB / 8TB',
          'Cổng trước': '2× USB-C (Thunderbolt 5), 1× USB-A, SD',
          'Cổng sau': '4× Thunderbolt 5, 2× USB-A, HDMI, 10Gb Ethernet',
          'Trọng lượng': '2.14 kg',
        },
        category: cat,
        variants: [
          { name: 'RAM', value: '64GB', priceModifier: 0, stock: 6 },
          { name: 'RAM', value: '128GB', priceModifier: 16000000, stock: 4 },
          { name: 'SSD', value: '1TB', priceModifier: 0, stock: 5 },
          { name: 'SSD', value: '2TB', priceModifier: 6000000, stock: 5 },
          { name: 'SSD', value: '4TB', priceModifier: 12000000, stock: 5 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'Apple M4 Max',
          ram: '64GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 61,
          searchKeywords: ['mac studio', 'pro desktop', 'creator workstation', 'thunderbolt 5'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          promotionalCopy: '12 cổng kết nối — Mọi thứ bạn cần',
        },
      },
      {
        name: 'Mac Studio M2 Ultra', slug: 'mac-studio-m2-ultra',
        tagline: 'M2 Ultra. Sức mạnh không giới hạn.', shortDescription: 'M2 Ultra — 192GB RAM — 6 cổng Thunderbolt',
        price: 84990000,
        images: [
          'https://www.macstoreuk.com/wp-content/uploads/2022/03/mac-studio-scaled.jpg',
        ],
        stock: 10, sold: 45,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Mac Studio M2 Ultra — 192GB RAM, 24 lõi CPU, 76 lõi GPU — Desktop mạnh nhất Apple</h2>
    <p>Mac Studio M2 Ultra là đỉnh cao tuyệt đối của Mac desktop: chip M2 Ultra với 24 lõi CPU và 76 lõi GPU được tạo ra bằng cách ghép hai chip M2 Max lại bằng công nghệ UltraFusion. 192GB unified memory — đủ để load dataset AI khổng lồ, render cảnh 3D phức tạp, và xử lý video 8K multi-stream đồng thời.</p>
  </section>
  <section class="rd-performance">
    <h3>M2 Ultra — Chip desktop mạnh nhất Apple từng tạo</h3>
    <ul>
      <li>24 lõi CPU (16 hiệu suất + 8 tiết kiệm) — không workflow nào có thể làm chậm máy</li>
      <li>76 lõi GPU — render 3D, VFX production, game AAA tất cả ở mức chưa từng thấy trên desktop nhỏ</li>
      <li>192GB unified memory, băng thông 800GB/s — ngang workstation trị giá hàng trăm triệu</li>
      <li>32 lõi Neural Engine — training model ML on-device, suy luận AI không cần cloud</li>
    </ul>
  </section>
  <section class="rd-usecases">
    <h3>Dành cho ai cần nhiều hơn nữa</h3>
    <ul>
      <li>Nhà làm phim: timeline 8K ProRes RAW không proxy, color grading real-time</li>
      <li>Nhà nghiên cứu AI/ML: chạy LLM 70B parameter on-device</li>
      <li>Kiến trúc sư/3D: render Unreal Engine 5 Lumen/Nanite không cần render farm</li>
      <li>Music producer: hàng trăm track plugin nặng đồng thời không glitch</li>
    </ul>
  </section>
  <section class="rd-connectivity">
    <h3>Kết nối và Thiết kế</h3>
    <p>6x Thunderbolt 4, 2x USB-A, HDMI 2.1, 10Gb Ethernet. Kết nối 5 màn hình 6K cùng lúc. Quạt ly tâm dual impeller. Wi-Fi 6E, Bluetooth 5.3. 19.7cm vuông, cao 9.5cm — nhỏ hơn nhiều workstation tower.</p>
  </section>
</div>`,
        whatsInTheBox: 'Mac Studio M2 Ultra, Dây nguồn',
        specs: {
          'Chip': 'Apple M2 Ultra (24-core CPU, 76-core GPU)',
          'RAM': '64GB / 128GB / 192GB',
          'SSD': '1TB / 2TB / 4TB / 8TB',
          'Cổng trước': '2× USB-C (Thunderbolt 5), 1× USB-A, SD',
          'Cổng sau': '4× Thunderbolt 5, 2× USB-A, HDMI, 10Gb Ethernet',
          'Trọng lượng': '3.62 kg',
        },
        category: cat,
        variants: [
          { name: 'RAM', value: '64GB', priceModifier: 0, stock: 3 },
          { name: 'RAM', value: '128GB', priceModifier: 16000000, stock: 3 },
          { name: 'RAM', value: '192GB', priceModifier: 32000000, stock: 2 },
          { name: 'SSD', value: '1TB', priceModifier: 0, stock: 3 },
          { name: 'SSD', value: '2TB', priceModifier: 6000000, stock: 3 },
          { name: 'SSD', value: '4TB', priceModifier: 12000000, stock: 2 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'Apple M2 Ultra',
          ram: '64GB',
          warrantyMonths: 24,
          rating: 5.0,
          totalReviews: 40,
          searchKeywords: ['mac studio m2 ultra', 'ultra chip', '192gb ram', 'professional video'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'M2 Ultra — Desktop powerhouse thực sự',
        },
      },
            {
        name: 'iMac 24" M4', slug: 'imac-24-m4',
        tagline: 'Làm nhiều hơn. Màu sắc hơn.', shortDescription: 'M4 — Màn hình 4.5K — 7 màu sắc',
        price: 28990000, originalPrice: 30990000,
        images: [
          'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331483/imac-24-inch-m4-xanh-duong-1-638659895087803389-750x500.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF0b8Pfo-NOG7Wlnpx6wO9MAlCtYBl4SJN6A&s',
        ],
        stock: 22, sold: 134,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iMac 24" M4 — All-in-One đẹp nhất thế giới, 4.5K Retina, 7 màu sắc</h2>
    <p>iMac 24 inch M4 không chỉ là máy tính — đây là tác phẩm nghệ thuật cho bàn làm việc. Thiết kế siêu mỏng 11.5mm tích hợp chip M4 8 lõi, màn hình Retina 4.5K rộng lớn, 6 loa Spatial Audio, camera 12MP Center Stage, và Magic Keyboard cùng Magic Mouse matching màu. Bật lên là dùng ngay.</p>
  </section>
  <section class="rd-design">
    <h3>Thiết kế 7 màu — Nghệ thuật văn phòng</h3>
    <ul>
      <li>7 màu sắc tươi sáng: Xanh Mướp, Xanh Băng, Hồng, Cam, Vàng, Tím, Bạc</li>
      <li>Mặt sau màu sắc, mặt trước Trắng — matching với Magic Keyboard và Magic Mouse</li>
      <li>Chỉ 11.5mm mỏng — mỏng hơn nhiều laptop, đứng trên chân đế nhôm sang trọng</li>
      <li>Không dây lộn xộn — một dây nguồn duy nhất với nam châm gắn vào chân đế</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>Chip M4 — Mạnh hơn 2x so với Intel iMac 2021</h3>
    <ul>
      <li>CPU 8 lõi (4 hiệu suất + 4 tiết kiệm) nhanh hơn Intel i7 trong iMac cũ đến 2 lần</li>
      <li>GPU 8–10 lõi — 3D, video editing, thiết kế đồ họa không giật</li>
      <li>Neural Engine 38 lõi — Apple Intelligence, nhận dạng ảnh, viết lại văn bản AI</li>
    </ul>
  </section>
  <section class="rd-multimedia">
    <h3>Màn hình và Đa Phương Tiện</h3>
    <p>Retina 4.5K 24 inch (4480x2520) — 218 ppi, 500 nits, True Tone, P3 Wide Color, 1 tỷ màu. Camera 12MP Center Stage tự theo dõi khuôn mặt trong video call. 6 loa Spatial Audio với Dolby Atmos. 3 micro array. Ram 16GB, SSD 256GB–1TB.</p>
  </section>
</div>`,
        whatsInTheBox: 'iMac 24", Magic Keyboard, Magic Mouse, Adapter USB-C, Dây nguồn',
        specs: {
          'Chip': 'Apple M4 (8-core CPU, 8-core GPU)',
          'RAM': '16GB / 24GB',
          'SSD': '256GB / 512GB / 1TB',
          'Màn hình': '24" Retina 4.5K (4480×2520)',
          'Camera': '12MP Center Stage',
          'Loa': '6 loa Spatial Audio',
          'Trọng lượng': '4.44 kg',
        },
        category: cat,
        variants: [
          { name: 'RAM', value: '16GB', priceModifier: 0, stock: 8 },
          { name: 'RAM', value: '24GB', priceModifier: 4000000, stock: 6 },
          { name: 'SSD', value: '256GB', priceModifier: 0, stock: 8 },
          { name: 'SSD', value: '512GB', priceModifier: 4000000, stock: 8 },
          { name: 'SSD', value: '1TB', priceModifier: 8000000, stock: 6 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 4 },
          { name: 'Màu sắc', value: 'Xanh Băng', colorHex: '#a7c7e7', stock: 4 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 4 },
          { name: 'Màu sắc', value: 'Cam', colorHex: '#ff8c69', stock: 4 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 4 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 4 },
        ],
        extraMetadata: {
          badge: 'Mới',
          chip: 'Apple M4',
          ram: '16GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 122,
          searchKeywords: ['imac 24 m4', 'all in one', '4.5k display', 'apple desktop'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: '7 màu sắc — Chọn phong cách của bạn',
        },
      },
      {
        name: 'iMac 24" M3', slug: 'imac-24-m3',
        tagline: 'M3. Tất cả trong một.', shortDescription: 'M3 chip — 4.5K — 7 màu — Camera 1080p',
        price: 25990000,
        images: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJ8xmgUcNEJ_ufuCh_z28NZfuisceuiRTYFQ&s',
        ],
        stock: 28, sold: 567,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iMac 24" M3 — Chip 3nm đầu tiên trên All-in-One, camera 1080p, ray tracing</h2>
    <p>iMac 24 inch M3 là bước tiến lớn trong dòng iMac: chip M3 3nm đầu tiên với GPU 10 lõi hỗ trợ ray tracing phần cứng, nâng cấp camera lên 1080p FaceTime HD chất lượng rõ ràng hơn, và Touch ID tích hợp ngay trên Magic Keyboard. Màn hình 4.5K Retina vẫn là tốt nhất phân khúc All-in-One.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip M3 3nm — Ray tracing phần cứng</h3>
    <ul>
      <li>CPU 8 lõi (4 hiệu suất + 4 tiết kiệm) nhanh hơn 35% so với M1 iMac</li>
      <li>GPU 10 lõi với hardware ray tracing — đổ bóng thực tế, phản chiếu 3D mượt mà</li>
      <li>RAM 8GB–24GB unified — cấu hình linh hoạt cho mọi nhu cầu</li>
      <li>Neural Engine 16 lõi — Apple Intelligence, máy học on-device</li>
    </ul>
  </section>
  <section class="rd-camera">
    <h3>Camera 1080p FaceTime HD</h3>
    <ul>
      <li>Webcam 1080p FaceTime HD — chất lượng video call rõ ràng, sắc nét hơn trước</li>
      <li>Center Stage tự động theo dõi và zoom theo khuôn mặt trong video call</li>
      <li>3 micro array với directional beamforming — loại bỏ tiếng ồn xung quanh</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế 7 màu và Magic Keyboard Touch ID</h3>
    <p>7 màu sắc tươi tắn, thiết kế 11.5mm mỏng. Magic Keyboard với Touch ID — đăng nhập bằng vân tay, Apple Pay tức thì. 6 loa Spatial Audio Dolby Atmos. Màn hình Retina 4.5K 500 nits, P3 Wide Color. SSD 256GB–1TB, RAM 8GB–24GB.</p>
  </section>
</div>`,
        whatsInTheBox: 'iMac 24" M3, Magic Keyboard với Touch ID, Magic Mouse, Dây nguồn',
        specs: {
          'Chip': 'Apple M3 (8-core CPU, 10-core GPU)',
          'RAM': '8GB / 16GB / 24GB',
          'SSD': '256GB / 512GB / 1TB',
          'Màn hình': '24" Retina 4.5K (4480×2520)',
          'Camera': '1080p FaceTime HD',
          'Loa': '6 loa Spatial Audio',
          'Trọng lượng': '4.48 kg',
        },
        category: cat,
        variants: [
          { name: 'RAM', value: '8GB', priceModifier: 0, stock: 8 },
          { name: 'RAM', value: '16GB', priceModifier: 4000000, stock: 8 },
          { name: 'RAM', value: '24GB', priceModifier: 8000000, stock: 6 },
          { name: 'SSD', value: '256GB', priceModifier: 0, stock: 10 },
          { name: 'SSD', value: '512GB', priceModifier: 4000000, stock: 8 },
          { name: 'SSD', value: '1TB', priceModifier: 8000000, stock: 6 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 5 },
          { name: 'Màu sắc', value: 'Xanh Băng', colorHex: '#a7c7e7', stock: 5 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 5 },
          { name: 'Màu sắc', value: 'Cam', colorHex: '#ff8c69', stock: 5 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 4 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'Apple M3',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 520,
          searchKeywords: ['imac 24 m3', 'all-in-one mac', '4.5k retina', 'colorful imac'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: '7 màu — Một iMac cho mọi cá tính',
        },
      },
    ];
  }

  private genIPads(cat: Category) {
    return [
      // ── iPad Pro M4 ─────────────────────────────────────────────────────
      {
        name: 'iPad Pro 13" M4', slug: 'ipad-pro-13-m4',
        tagline: 'Mỏng nhất Apple từng tạo.', shortDescription: 'Chip M4 — OLED Tandem — 5.1mm',
        price: 35990000, originalPrice: 38990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/ipad-pro-m4-13-inch_3_.png',
          'https://cdn.tgdd.vn/Products/Images/522/325517/ipad-pro-13-inch-m4-wifi-sliver-1-750x500.jpg',
        ],
        stock: 30, sold: 156,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPad Pro 13" M4 — OLED Tandem siêu sáng, mỏng 5.1mm, chip M4 đầy đủ</h2>
    <p>iPad Pro 13 inch M4 phá vỡ mọi kỳ vọng: màn hình OLED Tandem Ultra Retina XDR 1600 nits HDR sáng gấp đôi iPad Pro trước, trong thân máy chỉ 5.1mm mỏng và nhẹ 579g — mỏng hơn iPhone 6. Chip M4 không thỏa hiệp, hỗ trợ Apple Pencil Pro và Magic Keyboard Thin thế hệ mới.</p>
  </section>
  <section class="rd-display">
    <h3>OLED Tandem — Công nghệ màn hình iPad tốt nhất</h3>
    <ul>
      <li>OLED Tandem: hai lớp OLED ghép lại — sáng gấp đôi, tuổi thọ gấp đôi OLED thường</li>
      <li>1000 nits thường, 1600 nits HDR peak — nhìn rõ dưới nắng mạnh</li>
      <li>Ultra Retina XDR 2752x2064, ProMotion 120Hz, True Tone, P3 Wide</li>
      <li>Đen tuyệt đối của OLED, tỉ lệ tương phản vô hạn — hình ảnh như thật</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>Chip M4 — Laptop Pro trong tablet</h3>
    <ul>
      <li>CPU 9 lõi, GPU 10 lõi — hiệu năng ngang MacBook Pro M3 không quạt</li>
      <li>RAM 8GB–16GB, Neural Engine 38 lõi — Apple Intelligence đầy đủ</li>
      <li>USB-C Thunderbolt 3 (40Gb/s) — kết nối màn hình 6K, SSD ngoài tốc độ cao</li>
    </ul>
  </section>
  <section class="rd-accessories">
    <h3>Apple Pencil Pro và Magic Keyboard Thin</h3>
    <p>Hỗ trợ Apple Pencil Pro (haptic feedback, barrel roll) và Magic Keyboard Thin mới mỏng hơn 50%, trackpad lớn hơn. Wi-Fi 6E, Bluetooth 5.3, Face ID ngang dọc, camera 12MP Wide + 10MP Ultra Wide + LiDAR. Chống nước không chứng nhận chính thức.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPad Pro 13" M4, Cáp USB-C (1m), Adapter USB-C 20W',
        specs: {
          'Màn hình': '13" Ultra Retina Tandem OLED, 120Hz',
          'Chip': 'Apple M4 (9-core CPU, 10-core GPU)',
          'RAM': '8GB / 16GB',
          'Dung lượng': '256GB / 512GB / 1TB / 2TB',
          'Camera': '12MP Wide + 10MP Ultra Wide, LiDAR',
          'Pin': 'Lên đến 10 giờ',
          'Kết nối': 'USB-C (Thunderbolt 3)',
          'Trọng lượng': '579g',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '256GB', priceModifier: 0, stock: 10 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 5000000, stock: 8 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 10000000, stock: 6 },
          { name: 'Dung lượng', value: '2TB', priceModifier: 20000000, stock: 4 },
          { name: 'Kết nối', value: 'Wi-Fi', priceModifier: 0, stock: 15 },
          { name: 'Kết nối', value: 'Wi-Fi + 5G', priceModifier: 5000000, stock: 15 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 15 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 15 },
        ],
        extraMetadata: {
          badge: 'Mới',
          chip: 'Apple M4',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 142,
          searchKeywords: ['ipad pro 13 m4', 'oled ipad', 'pro tablet', 'thunderbolt ipad'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: 'OLED Tandem — Sáng hơn bất kỳ iPad nào',
        },
      },
      {
        name: 'iPad Pro 11" M4', slug: 'ipad-pro-11-m4',
        tagline: 'Pro. Trong lòng bàn tay.', shortDescription: 'Chip M4 — OLED — 5.3mm mỏng',
        price: 29990000,
        images: [
          'https://bizweb.dktcdn.net/100/459/953/products/ipad-pro-m4-11inch-space-black.jpg?v=1715160285600',
        ],
        stock: 35, sold: 210,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPad Pro 11" M4 — Nhỏ gọn 5.3mm, OLED Tandem, hiệu năng M4 đầy đủ</h2>
    <p>iPad Pro 11 inch M4 chứng minh rằng nhỏ gọn không có nghĩa là kém mạnh. Cùng chip M4, cùng OLED Tandem 1600 nits với phiên bản 13 inch — nhưng nhẹ hơn 135g, mỏng hơn 0.2mm. Nhẹ 444g là điều không tưởng cho một tablet Pro đầy đủ tính năng.</p>
  </section>
  <section class="rd-display">
    <h3>OLED Tandem 11 inch — Không nhỏ hơn chất lượng</h3>
    <ul>
      <li>Ultra Retina XDR OLED Tandem 11 inch, 2388x1668, 264 ppi</li>
      <li>1600 nits HDR peak — cùng độ sáng với phiên bản 13 inch</li>
      <li>ProMotion 120Hz, True Tone, P3 Wide Color — mượt mà và màu sắc chuẩn xác</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>Chip M4 — Đầy đủ, không thỏa hiệp</h3>
    <ul>
      <li>CPU 9 lõi, GPU 10 lõi — cùng chip với iPad Pro 13 inch M4</li>
      <li>RAM 8GB–16GB — xử lý Final Cut for iPad, LumaFusion, Procreate Dreams mượt mà</li>
      <li>USB-C Thunderbolt 3 40Gb/s, Face ID ngang dọc</li>
    </ul>
  </section>
  <section class="rd-portable">
    <h3>Nhỏ gọn, cơ động</h3>
    <p>444g — nhẹ hơn cả nhiều máy tính bảng Android 10 inch. Mỏng 5.3mm, vừa trong cặp mỏng hoặc tay cầm dễ dàng. Hỗ trợ Apple Pencil Pro, Magic Keyboard Thin. Wi-Fi 6E, 5G, Bluetooth 5.3.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPad Pro 11" M4, Cáp USB-C, Adapter 20W',
        specs: {
          'Màn hình': '11" Ultra Retina Tandem OLED, 120Hz',
          'Chip': 'Apple M4 (9-core CPU, 10-core GPU)',
          'RAM': '8GB / 16GB',
          'Dung lượng': '256GB / 512GB / 1TB / 2TB',
          'Camera': '12MP Wide + 10MP Ultra Wide',
          'Pin': 'Lên đến 10 giờ',
          'Kết nối': 'USB-C (Thunderbolt 3)',
          'Trọng lượng': '444g',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '256GB', priceModifier: 0, stock: 12 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 5000000, stock: 10 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 10000000, stock: 6 },
          { name: 'Dung lượng', value: '2TB', priceModifier: 20000000, stock: 4 },
          { name: 'Kết nối', value: 'Wi-Fi', priceModifier: 0, stock: 18 },
          { name: 'Kết nối', value: 'Wi-Fi + 5G', priceModifier: 5000000, stock: 17 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 18 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 17 },
        ],
        extraMetadata: {
          badge: 'Mới',
          chip: 'Apple M4',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.9,
          totalReviews: 192,
          searchKeywords: ['ipad pro 11 m4', 'pro tablet', 'compact ipad pro'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: '444g — Pro power trong lòng bàn tay',
        },
      },
      // ── iPad Pro M2 ─────────────────────────────────────────────────────
      {
        name: 'iPad Pro 12.9" M2', slug: 'ipad-pro-129-m2',
        tagline: 'M2. Pro. Liquid Retina XDR.', shortDescription: 'Chip M2 — 12.9" XDR — 120Hz',
        price: 29990000, originalPrice: 32990000,
        images: [
          'https://bachlongstore.vn/vnt_upload/product/10_2023/654790.png',
        ],
        stock: 25, sold: 456,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPad Pro 12.9" M2 — mini-LED Liquid Retina XDR, Thunderbolt 4, ProRes video</h2>
    <p>iPad Pro 12.9 inch M2 là cột mốc quan trọng với tấm nền mini-LED đầu tiên trên iPad: hơn 10.000 LED nhỏ chia thành 2596 vùng dimming cục bộ, tạo ra độ tương phản và độ sáng chưa từng có trên tablet. Apple Pencil hover — nhận ra bút từ 12mm trước khi chạm màn hình.</p>
  </section>
  <section class="rd-display">
    <h3>Liquid Retina XDR mini-LED — Màn hình tablet tốt nhất trước OLED</h3>
    <ul>
      <li>mini-LED với 10.000+ đèn LED nhỏ — black như OLED, sáng như LCD tốt nhất</li>
      <li>2596 vùng dimming cục bộ — tương phản 1.000.000:1, sáng 1600 nits HDR</li>
      <li>ProMotion 120Hz, True Tone, P3 Wide Color — đẹp như màn hình studio</li>
    </ul>
  </section>
  <section class="rd-pencil">
    <h3>Apple Pencil Hover — Sáng tạo tiên đoán trước</h3>
    <ul>
      <li>Apple Pencil 2 hover từ 12mm — ứng dụng nhận biết bút đang đến trước khi chạm</li>
      <li>Procreate hiển thị màu cọ trước, Notes chèn ký tự trống — tăng tốc sáng tạo</li>
      <li>Thunderbolt 4 (40Gb/s) — kết nối màn hình 6K Pro Display XDR</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>Chip M2 và Video Pro</h3>
    <p>M2 8 lõi CPU, GPU 10 lõi, RAM 8GB–16GB. Quay ProRes video trực tiếp trên iPad — lần đầu tiên trên tablet. Camera 12MP Wide + 10MP Ultra Wide + LiDAR. Hỗ trợ Apple Pencil 2 và Magic Keyboard. Nặng 682g.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPad Pro 12.9" M2, Cáp USB-C, Adapter 20W',
        specs: {
          'Màn hình': '12.9" Liquid Retina XDR, mini-LED, 120Hz',
          'Chip': 'Apple M2 (8-core CPU, 10-core GPU)',
          'RAM': '8GB / 16GB',
          'Dung lượng': '128GB / 256GB / 512GB / 1TB / 2TB',
          'Camera': '12MP Wide + 10MP Ultra Wide, LiDAR',
          'Pin': 'Lên đến 10 giờ',
          'Kết nối': 'USB-C (Thunderbolt 4)',
          'Trọng lượng': '682g',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 6 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 3000000, stock: 6 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 6000000, stock: 5 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 10000000, stock: 4 },
          { name: 'Dung lượng', value: '2TB', priceModifier: 20000000, stock: 2 },
          { name: 'Kết nối', value: 'Wi-Fi', priceModifier: 0, stock: 12 },
          { name: 'Kết nối', value: 'Wi-Fi + 5G', priceModifier: 5000000, stock: 12 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'Apple M2',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 420,
          searchKeywords: ['ipad pro 12.9 m2', 'mini-led ipad', 'professional tablet'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'mini-LED XDR — HDR như rạp chiếu phim',
        },
      },
      {
        name: 'iPad Pro 11" M2', slug: 'ipad-pro-11-m2',
        tagline: 'M2 Pro. Nhỏ gọn Pro.', shortDescription: 'Chip M2 — 11" Liquid Retina — ProMotion',
        price: 23990000,
        images: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfMdZMTRpfM7uOt6Pj3hf7oMHTRrTOAzxIrw&s',
        ],
        stock: 30, sold: 345,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPad Pro 11" M2 — ProMotion 120Hz, Apple Pencil Hover, Thunderbolt 4 — Pro nhỏ gọn</h2>
    <p>iPad Pro 11 inch M2 là lựa chọn cho người muốn tất cả sức mạnh iPad Pro nhưng trong thân máy nhỏ gọn dễ mang. Chip M2 8 lõi 3nm cùng GPU 10 lõi hardware ray tracing — lần đầu tiên trên iPad. Apple Pencil hover — bút cách màn hình 12mm vẫn nhận diện, hiển thị preview trước khi chạm.</p>
  </section>
  <section class="rd-pencil">
    <h3>Apple Pencil Hover — Tính năng đột phá</h3>
    <ul>
      <li>Apple Pencil 2 hover 12mm — thấy nét vẽ xuất hiện trước khi bút chạm màn hình</li>
      <li>Procreate, Affinity Designer, Noteshelf — trải nghiệm sáng tạo chuyên nghiệp</li>
      <li>Cảm biến áp suất, độ nghiêng — vẽ nét mượt mà như bút trên giấy</li>
      <li>Sạc không dây gắn nam châm trên cạnh iPad</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>Chip M2 3nm và Kết nối</h3>
    <ul>
      <li>M2 CPU 8 lõi, GPU 10 lõi hardware ray tracing — nhanh hơn 40% so với M1 iPad Pro</li>
      <li>Thunderbolt 4 / USB 4 (40Gb/s) — kết nối màn hình 6K Pro Display XDR</li>
      <li>Wi-Fi 6E (6GHz), Bluetooth 5.3 — kết nối nhanh nhất trên iPad thời điểm ra mắt</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Màn hình và Thiết kế</h3>
    <p>Liquid Retina 11 inch 2388x1668, ProMotion 120Hz tự điều chỉnh. Face ID. LiDAR Scanner đo chiều sâu AR. 12MP Wide + 10MP Ultra Wide + TrueDepth 12MP. Nhẹ 466g, 5.9mm. Magic Keyboard tùy chọn.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPad Pro 11" M2, Cáp USB-C, Adapter 20W',
        specs: {
          'Màn hình': '11" Liquid Retina, ProMotion 120Hz',
          'Chip': 'Apple M2 (8-core CPU, 10-core GPU)',
          'RAM': '8GB / 16GB',
          'Dung lượng': '128GB / 256GB / 512GB / 1TB / 2TB',
          'Camera': '12MP Wide + 10MP Ultra Wide',
          'Pin': 'Lên đến 10 giờ',
          'Kết nối': 'USB-C (Thunderbolt 4)',
          'Trọng lượng': '466g',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 10 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 3000000, stock: 8 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 6000000, stock: 6 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 10000000, stock: 4 },
          { name: 'Kết nối', value: 'Wi-Fi', priceModifier: 0, stock: 15 },
          { name: 'Kết nối', value: 'Wi-Fi + 5G', priceModifier: 5000000, stock: 15 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 15 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 15 },
        ],
        extraMetadata: {
          badge: 'Pro',
          chip: 'Apple M2',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 315,
          searchKeywords: ['ipad pro 11 m2', 'pencil hover', 'pro motion'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'Apple Pencil Hover — Sáng tạo không giới hạn',
        },
      },
      // ── iPad Air M3 / M2 ────────────────────────────────────────────────
      {
        name: 'iPad Air 13" M3', slug: 'ipad-air-13-m3',
        tagline: 'Mạnh mẽ. Nhẹ. Đa năng.', shortDescription: 'Chip M3 — 13 inch — Hỗ trợ Apple Pencil',
        price: 21990000,
        images: [
          'https://cdn2.cellphones.com.vn/x/media/catalog/product/i/p/ipad-air-m3-11-inch_2__3.jpg',
        ],
        stock: 28, sold: 98,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPad Air 13" M3 — Màn hình lớn 13 inch, chip M3, Apple Pencil Pro với giá Air</h2>
    <p>iPad Air 13 inch M3 là sự lựa chọn hoàn hảo khi bạn muốn màn hình lớn cho sáng tạo và năng suất nhưng không cần đến mức OLED của iPad Pro. Chip M3 mạnh mẽ, hỗ trợ Apple Pencil Pro và Magic Keyboard — đầy đủ công cụ sáng tạo với mức giá Air.</p>
  </section>
  <section class="rd-display">
    <h3>Màn hình Liquid Retina 13 inch</h3>
    <ul>
      <li>Liquid Retina 13 inch 2732x2048 — không gian làm việc rộng, vẽ tranh Procreate thoải mái</li>
      <li>500 nits, True Tone, P3 Wide Color, chống phản chiếu</li>
      <li>Thiết kế tràn viền với Touch ID tích hợp nút nguồn — màn hình toàn phần</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>Chip M3 — Sức mạnh vượt expectations</h3>
    <ul>
      <li>CPU 8 lõi, GPU 9 lõi với hardware ray tracing</li>
      <li>Neural Engine 16 lõi — Apple Intelligence, xử lý ảnh AI tức thì</li>
      <li>RAM 8GB — đủ mạnh cho Procreate, LumaFusion, GarageBand Pro</li>
    </ul>
  </section>
  <section class="rd-accessories">
    <h3>Apple Pencil Pro và Magic Keyboard</h3>
    <p>Hỗ trợ Apple Pencil Pro (haptic feedback, barrel roll) và Magic Keyboard cho iPad Air 13 inch. Camera 12MP Wide, FaceTime 12MP, USB-C (3.2 Gen 2). Nặng 617g, 6.1mm mỏng. Wi-Fi 6E, 5G tùy chọn.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPad Air 13", Cáp USB-C, Adapter 20W',
        specs: {
          'Màn hình': '13" Liquid Retina',
          'Chip': 'Apple M3 (8-core CPU, 9-core GPU)',
          'RAM': '8GB',
          'Dung lượng': '128GB / 256GB / 512GB / 1TB',
          'Camera': '12MP Wide',
          'Pin': 'Lên đến 10 giờ',
          'Kết nối': 'USB-C',
          'Trọng lượng': '617g',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 10 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 3000000, stock: 10 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 6000000, stock: 6 },
          { name: 'Dung lượng', value: '1TB', priceModifier: 10000000, stock: 4 },
          { name: 'Màu sắc', value: 'Xanh Băng', colorHex: '#a7c7e7', stock: 6 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 6 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 6 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 6 },
          { name: 'Kết nối', value: 'Wi-Fi', priceModifier: 0, stock: 14 },
          { name: 'Kết nối', value: 'Wi-Fi + 5G', priceModifier: 5000000, stock: 14 },
        ],
        extraMetadata: {
          badge: 'Mới',
          chip: 'Apple M3',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 89,
          searchKeywords: ['ipad air 13 m3', 'large ipad air', 'm3 ipad'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: '617g — Pro performance, Air lightness',
        },
      },
      {
        name: 'iPad Air 11" M3', slug: 'ipad-air-11-m3',
        tagline: 'Mạnh. Nhẹ. Hoàn hảo.', shortDescription: '11 inch — Chip M3 — Apple Pencil Pro',
        price: 17990000,
        images: [
          'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/522/335267/ipad-air-m3-11-inch-wifi-starlight-1-638771976884999774-750x500.jpg',
        ],
        stock: 32, sold: 145,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPad Air 11" M3 — Nhỏ gọn, hiệu năng M3, Apple Pencil Pro tích hợp hoàn hảo</h2>
    <p>iPad Air 11 inch M3 là chiếc iPad cân bằng hoàn hảo giữa kích thước và sức mạnh. Nhỏ gọn dễ mang theo nhưng chip M3 đủ mạnh cho mọi workflow sáng tạo. Hỗ trợ đầy đủ Apple Pencil Pro và Magic Keyboard — cặp đôi hoàn hảo cho học sinh, sinh viên và freelancer.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip M3 — Đủ mạnh cho mọi tác vụ</h3>
    <ul>
      <li>CPU 8 lõi, GPU 9 lõi — nhanh hơn 60% so với M1 Air iPad</li>
      <li>Hardware ray tracing — 3D, AR mượt mà, trò chơi đẹp hơn</li>
      <li>RAM 8GB, Neural Engine 16 lõi — Apple Intelligence on-device</li>
    </ul>
  </section>
  <section class="rd-display">
    <h3>Màn hình 11 inch Liquid Retina</h3>
    <ul>
      <li>Liquid Retina 11 inch 2360x1640, 264 ppi — sắc nét cho mọi nội dung</li>
      <li>500 nits, True Tone, chống phản chiếu — dùng trong nhà hoặc ngoài trời</li>
      <li>Touch ID trên nút nguồn — bảo mật thuận tiện</li>
    </ul>
  </section>
  <section class="rd-accessories">
    <h3>Apple Pencil Pro và Tính năng</h3>
    <p>Hỗ trợ Apple Pencil Pro với haptic, barrel roll, Find My. Magic Keyboard for iPad Air 11. Camera 12MP Wide, FaceTime 12MP Center Stage, USB-C 10Gb/s. Nhẹ 462g, 6.1mm mỏng. Wi-Fi 6E, 5G tùy chọn. 4 màu sắc pastel.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPad Air 11", Cáp USB-C, Adapter 20W',
        specs: {
          'Màn hình': '11" Liquid Retina',
          'Chip': 'Apple M3 (8-core CPU, 9-core GPU)',
          'RAM': '8GB',
          'Dung lượng': '128GB / 256GB / 512GB',
          'Camera': '12MP Wide',
          'Pin': 'Lên đến 10 giờ',
          'Kết nối': 'USB-C',
          'Trọng lượng': '462g',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 10 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 3000000, stock: 10 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 6000000, stock: 6 },
          { name: 'Màu sắc', value: 'Xanh Băng', colorHex: '#a7c7e7', stock: 8 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 8 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 8 },
          { name: 'Kết nối', value: 'Wi-Fi', priceModifier: 0, stock: 16 },
          { name: 'Kết nối', value: 'Wi-Fi + 5G', priceModifier: 5000000, stock: 16 },
        ],
        extraMetadata: {
          chip: 'Apple M3',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 132,
          searchKeywords: ['ipad air 11 m3', 'compact ipad air', 'pencil pro'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: '462g — Nhẹ nhưng không yếu',
        },
      },
      {
        name: 'iPad Air 11" M1', slug: 'ipad-air-11-m1',
        tagline: 'Air. M1. Mọi thứ bạn cần.', shortDescription: 'Chip M1 — 11 inch — Hỗ trợ Pencil 2',
        price: 14990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/1/_/1_1__1_1.png',
        ],
        stock: 30, sold: 890,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPad Air 11" M1 — Chip Apple Silicon đầu tiên trên iPad Air, giá trị tốt nhất</h2>
    <p>iPad Air M1 là bước nhảy lịch sử: lần đầu tiên chip Apple Silicon (cùng dòng với MacBook) xuất hiện trên iPad Air. Hiệu năng tăng 60% so với A14, hỗ trợ USB-C và 5G. Giá trị tốt nhất trong dòng iPad Air cho học tập và sáng tạo.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip M1 — Apple Silicon đầu tiên trên iPad Air</h3>
    <ul>
      <li>CPU 8 lõi, GPU 8 lõi — cùng kiến trúc với MacBook Air M1 thế hệ đầu</li>
      <li>Nhanh hơn 60% so với A14 Bionic, nhanh hơn 60% bất kỳ Chromebook nào</li>
      <li>Neural Engine 16 lõi — xử lý nhận dạng ảnh, văn bản tức thì</li>
      <li>RAM 8GB — đa nhiệm mượt mà, chạy Procreate và Stage Manager</li>
    </ul>
  </section>
  <section class="rd-display">
    <h3>Màn hình và Phụ kiện</h3>
    <ul>
      <li>Liquid Retina 10.9 inch 2360x1640, 264 ppi — sắc nét không gian rộng</li>
      <li>Hỗ trợ Apple Pencil 2 và Magic Keyboard — bộ đôi năng suất hoàn hảo</li>
      <li>Touch ID tích hợp nút nguồn, 5 màu sắc pastel</li>
    </ul>
  </section>
  <section class="rd-connectivity">
    <h3>Kết nối USB-C và 5G</h3>
    <p>USB-C (5Gb/s), Wi-Fi 6, Bluetooth 5.0. 5G tùy chọn. Camera 12MP Wide, FaceTime 12MP Center Stage. Nặng 461g, mỏng 6.1mm. Pin 10 giờ. macOS không có nhưng iPadOS Stage Manager giả lập đa nhiệm.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPad Air 11" M1, Cáp USB-C, Adapter 20W',
        specs: {
          'Màn hình': '10.9" Liquid Retina',
          'Chip': 'Apple M1 (8-core CPU, 8-core GPU)',
          'RAM': '8GB',
          'Dung lượng': '64GB / 256GB',
          'Camera': '12MP Wide',
          'Pin': 'Lên đến 10 giờ',
          'Kết nối': 'USB-C',
          'Trọng lượng': '461g',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '64GB', priceModifier: 0, stock: 10 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 3000000, stock: 12 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 7 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 7 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 6 },
          { name: 'Màu sắc', value: 'Xanh Băng', colorHex: '#a7c7e7', stock: 6 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 6 },
          { name: 'Kết nối', value: 'Wi-Fi', priceModifier: 0, stock: 15 },
          { name: 'Kết nối', value: 'Wi-Fi + 5G', priceModifier: 5000000, stock: 15 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'Apple M1',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.7,
          totalReviews: 820,
          searchKeywords: ['ipad air m1', 'budget ipad air', 'apple m1 tablet'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'M1 chip — Từ MacBook vào iPad',
        },
      },
      // ── iPad mini ───────────────────────────────────────────────────────
      {
        name: 'iPad mini A17 Pro', slug: 'ipad-mini-a17-pro',
        tagline: 'Nhỏ gọn. Đầy sức mạnh.', shortDescription: 'Chip A17 Pro — 8.3 inch — Apple Pencil USB-C',
        price: 14990000,
        images: [
          'https://shopdunk.com/images/thumbs/0055506_ipad-mini-a17-pro-wi-fi-128gb.jpeg',
        ],
        stock: 25, sold: 167,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPad mini A17 Pro — Chip iPhone Pro trong thân máy 8.3 inch, Apple Pencil Pro</h2>
    <p>iPad mini 7 với chip A17 Pro là một bất ngờ lớn: cùng chip với iPhone 15 Pro — GPU 6 lõi ray tracing, Neural Engine 16 lõi — trong thân máy chỉ 8.3 inch, nặng 297g. Lần đầu tiên iPad mini hỗ trợ Apple Pencil Pro với haptic feedback và barrel roll. Nhỏ nhất, mạnh nhất, di động nhất.</p>
  </section>
  <section class="rd-performance">
    <h3>A17 Pro — Chip iPhone 15 Pro trong iPad</h3>
    <ul>
      <li>CPU 6 lõi (2 hiệu suất + 4 tiết kiệm) — mạnh hơn A15 Bionic (iPad mini 6) đến 30%</li>
      <li>GPU 6 lõi với hardware ray tracing — game 3D, AR mượt mà trong tay</li>
      <li>Neural Engine 16 lõi — Apple Intelligence sẵn sàng on-device</li>
      <li>RAM 8GB — đa nhiệm Stage Manager mượt mà</li>
    </ul>
  </section>
  <section class="rd-pencil">
    <h3>Apple Pencil Pro — Đổi mới sáng tạo trên mini</h3>
    <ul>
      <li>Apple Pencil Pro với haptic feedback tùy chỉnh — cảm giác như cọ vẽ thực</li>
      <li>Barrel roll — xoay bút để chuyển công cụ trong Procreate, GoodNotes</li>
      <li>Find My tích hợp — không bao giờ mất bút</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế và Di động</h3>
    <p>Liquid Retina 8.3 inch 2266x1488, 326 ppi — mật độ pixel cao nhất iPad. USB-C 5Gb/s, Touch ID tích hợp nút nguồn, Wi-Fi 6E, 5G tùy chọn. Nhẹ 297g, 6.3mm mỏng. 4 màu sắc. Camera 12MP Wide, FaceTime 12MP Center Stage.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPad mini, Cáp USB-C, Adapter 20W',
        specs: {
          'Màn hình': '8.3" Liquid Retina',
          'Chip': 'Apple A17 Pro',
          'RAM': '8GB',
          'Dung lượng': '128GB / 256GB / 512GB',
          'Camera': '12MP Wide',
          'Pin': 'Lên đến 10 giờ',
          'Kết nối': 'USB-C',
          'Trọng lượng': '297g',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 10 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 3000000, stock: 8 },
          { name: 'Dung lượng', value: '512GB', priceModifier: 6000000, stock: 5 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 7 },
          { name: 'Màu sắc', value: 'Xanh Băng', colorHex: '#a7c7e7', stock: 6 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 6 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 6 },
          { name: 'Kết nối', value: 'Wi-Fi', priceModifier: 0, stock: 13 },
          { name: 'Kết nối', value: 'Wi-Fi + 5G', priceModifier: 5000000, stock: 12 },
        ],
        extraMetadata: {
          badge: 'Mới',
          chip: 'Apple A17 Pro',
          ram: '8GB',
          warrantyMonths: 24,
          rating: 4.8,
          totalReviews: 153,
          searchKeywords: ['ipad mini a17 pro', 'small tablet', 'portable', 'compact ipad'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isNew: true,
          isHot: true,
          promotionalCopy: '297g — Nhỏ trong túi, lớn trong hiệu năng',
        },
      },
      {
        name: 'iPad mini 6', slug: 'ipad-mini-6',
        tagline: 'Mini. Màn hình lớn bất ngờ.', shortDescription: 'A15 Bionic — 8.3" — USB-C — Pencil',
        price: 11990000,
        images: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWTKimsditYklErb-EICyLByJRNli2PTHtPg&s',
        ],
        stock: 35, sold: 1230,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPad mini 6 — Thiết kế tràn viền đầu tiên trên mini, chip A15 Bionic, USB-C</h2>
    <p>iPad mini 6 là cuộc cách mạng thiết kế: tràn viền tròng lý không notch thay thế thiết kế cũ sau 5 năm. Touch ID ẩn trong nút nguồn, USB-C thay Lightning, chip A15 Bionic từ iPhone 13 Pro. Tất cả trong 293g và 6.3mm — vẫn là iPad mini nhỏ gọn truyền thống.</p>
  </section>
  <section class="rd-design">
    <h3>Thiết kế tràn viền — Cuộc cách mạng mini</h3>
    <ul>
      <li>Màn hình 8.3 inch Liquid Retina tràn viền — lớn hơn 19% so với mini 5 (7.9 inch)</li>
      <li>Touch ID ẩn trong nút nguồn mặt trên — bảo mật không cần Face ID</li>
      <li>Không notch, không nút Home — thiết kế All-Screen giống iPad Air</li>
      <li>USB-C thay Lightning — dùng chung dây với MacBook, iPad Pro</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>Chip A15 Bionic — Hiệu năng Pro</h3>
    <ul>
      <li>CPU 6 lõi, GPU 5 lõi — cùng chip với iPhone 13 Pro (GPU 5 lõi)</li>
      <li>Neural Engine 16 lõi — xử lý AR, nhận dạng ảnh, ngôn ngữ</li>
      <li>Hỗ trợ Apple Pencil 2 — sạc không dây, gắn nam châm vào cạnh</li>
    </ul>
  </section>
  <section class="rd-connectivity">
    <h3>Kết nối và Sử dụng</h3>
    <p>Wi-Fi 6, Bluetooth 5.0, 5G tùy chọn. Camera 12MP Wide, FaceTime 12MP Center Stage. Màn hình 8.3 inch 326 ppi — mật độ pixel cao nhất iPad. Nhẹ 293g, 6.3mm. Pin 10 giờ. 4 màu sắc.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPad mini 6, Cáp USB-C, Adapter 20W',
        specs: {
          'Màn hình': '8.3" Liquid Retina',
          'Chip': 'Apple A15 Bionic',
          'RAM': '4GB',
          'Dung lượng': '64GB / 256GB',
          'Camera': '12MP Wide',
          'Pin': 'Lên đến 10 giờ',
          'Kết nối': 'USB-C',
          'Trọng lượng': '293g',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '64GB', priceModifier: 0, stock: 12 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 3000000, stock: 12 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 8 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 7 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 7 },
          { name: 'Màu sắc', value: 'Xanh Băng', colorHex: '#a7c7e7', stock: 6 },
          { name: 'Kết nối', value: 'Wi-Fi', priceModifier: 0, stock: 18 },
          { name: 'Kết nối', value: 'Wi-Fi + 5G', priceModifier: 5000000, stock: 17 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'Apple A15 Bionic',
          ram: '4GB',
          warrantyMonths: 24,
          rating: 4.7,
          totalReviews: 1120,
          searchKeywords: ['ipad mini 6', 'small tablet', 'compact', 'purple ipad mini'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: '8.3 inch trong lòng bàn tay',
        },
      },
      // ── iPad Gen 10 ─────────────────────────────────────────────────────
      {
        name: 'iPad 10', slug: 'ipad-10',
        tagline: 'Màu sắc. Màn hình lớn. Mạnh mẽ.', shortDescription: 'A14 Bionic — 10.9" — USB-C',
        price: 11990000,
        images: [
          'https://cdn2.fptshop.com.vn/unsafe/828x0/filters:format(webp):quality(75)/2022_11_29_638053168020402739_Pad%20Gen%2010th%20Wifi%20(2).jpg',
        ],
        stock: 50, sold: 2340,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPad thế hệ 10 — Thiết kế mới hoàn toàn, màu sắc tươi sáng, USB-C, giá phổ thông</h2>
    <p>iPad thế hệ 10 là cuộc đại tu lớn nhất iPad cơ bản: thiết kế tràn viền tròng lý mới hoàn toàn với 4 màu sắc tươi sáng, USB-C thay Lightning, chip A14 Bionic mạnh hơn 60%, và camera selfie chuyển sang cạnh ngang để dùng landscape trong video call. Tất cả với giá dưới 12 triệu.</p>
  </section>
  <section class="rd-design">
    <h3>Thiết kế mới hoàn toàn — Màu sắc tươi sáng</h3>
    <ul>
      <li>Thiết kế tràn viền All-Screen mới — loại bỏ nút Home, Touch ID vào nút nguồn</li>
      <li>4 màu sắc tươi sáng: Xanh, Hồng, Vàng, Bạc — iPad đẹp nhất phân khúc giá rẻ</li>
      <li>USB-C thay Lightning — dùng chung dây với MacBook, iPhone 15 trở lên</li>
      <li>Camera FaceTime chuyển sang cạnh landscape — video call mà không bị camera lệch</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>Chip A14 Bionic — Nhanh hơn 60%</h3>
    <ul>
      <li>A14 Bionic 5nm CPU 6 lõi — nhanh hơn 60% so với iPad thế hệ 9</li>
      <li>Hỗ trợ Apple Pencil Gen 1 (USB-C adapter) và Smart Connector keyboard</li>
      <li>Wi-Fi 6 — tốc độ không dây nhanh hơn</li>
    </ul>
  </section>
  <section class="rd-value">
    <h3>Giá trị và Kết nối</h3>
    <p>Màn hình Liquid Retina 10.9 inch 2360x1640. Camera 12MP Wide, FaceTime 12MP Center Stage. Nặng 477g, 7.0mm. Pin 10 giờ. Tùy chọn 5G. Hoàn hảo cho học sinh, sinh viên, người dùng phổ thông.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPad 10, Cáp USB-C, Adapter 20W',
        specs: {
          'Màn hình': '10.9" Liquid Retina',
          'Chip': 'Apple A14 Bionic',
          'RAM': '4GB',
          'Dung lượng': '64GB / 256GB',
          'Camera': '12MP Wide',
          'Pin': 'Lên đến 10 giờ',
          'Kết nối': 'USB-C',
          'Trọng lượng': '477g',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '64GB', priceModifier: 0, stock: 18 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 3000000, stock: 18 },
          { name: 'Màu sắc', value: 'Xanh', colorHex: '#a7c7e7', stock: 10 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 10 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 10 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 10 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 10 },
          { name: 'Kết nối', value: 'Wi-Fi', priceModifier: 0, stock: 25 },
          { name: 'Kết nối', value: 'Wi-Fi + 5G', priceModifier: 5000000, stock: 25 },
        ],
        extraMetadata: {
          badge: 'Bán chạy',
          chip: 'Apple A14 Bionic',
          ram: '4GB',
          warrantyMonths: 24,
          rating: 4.7,
          totalReviews: 2180,
          searchKeywords: ['ipad 10', 'colorful ipad', '10.9 inch', 'a14 bionic'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: '5 màu sắc — Chọn màu yêu thích',
        },
      },
      {
        name: 'iPad 9', slug: 'ipad-9',
        tagline: 'Học tập. Giải trí. Sáng tạo.', shortDescription: 'A13 Bionic — 10.2" — Touch ID — Pencil',
        price: 8990000,
        images: [
          'https://a-smart.vn/uploads/product/330/i/ipad-gen-9-2021-10-2inch-64gb-wifi-new.jpg',
        ],
        stock: 40, sold: 4560,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>iPad thế hệ 9 — iPad bán chạy nhất mọi thời đại, giá tốt nhất dòng iPad</h2>
    <p>iPad thế hệ 9 là chiếc iPad bán chạy nhất lịch sử Apple — và không khó để hiểu tại sao. Giá chỉ từ 9.99 triệu nhưng có chip A13 Bionic mạnh hơn hầu hết laptop Chromebook, màn hình 10.2 inch True Tone, và hỗ trợ Apple Pencil Gen 1. Lựa chọn đầu tiên cho học sinh, sinh viên mọi lứa tuổi.</p>
  </section>
  <section class="rd-performance">
    <h3>Chip A13 Bionic — Mạnh hơn nhiều laptop giá rẻ</h3>
    <ul>
      <li>A13 Bionic 7nm — CPU 6 lõi, GPU 4 lõi, Neural Engine 8 lõi</li>
      <li>Nhanh hơn 20% so với iPad thế hệ 8, mạnh hơn mọi Chromebook cùng giá</li>
      <li>True Tone hiển thị — màn hình điều chỉnh màu sắc theo ánh sáng xung quanh</li>
    </ul>
  </section>
  <section class="rd-value">
    <h3>Giá trị không gì sánh bằng</h3>
    <ul>
      <li>Hỗ trợ Apple Pencil Gen 1 — vẽ, ghi chú, ký tên chuyên nghiệp</li>
      <li>Smart Keyboard chính hãng — biến iPad thành laptop mini</li>
      <li>iPadOS 17 — đa nhiệm Stage Manager, FaceTime SharePlay, Notes</li>
      <li>Giá từ 9.99 triệu — rẻ nhất trong dòng iPad mới chính hãng</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế và Màn hình</h3>
    <p>Màn hình Retina 10.2 inch, Touch ID nút Home, Lightning, Wi-Fi 5, Bluetooth 4.2. Nặng 487g, 7.5mm. Camera 8MP mặt sau, FaceTime 12MP. Màu Bạc và Xám. Pin 10 giờ. macOS không có nhưng đủ tất cả cho học tập.</p>
  </section>
</div>`,
        whatsInTheBox: 'iPad 9, Cáp Lightning, Adapter 20W',
        specs: {
          'Màn hình': '10.2" Retina',
          'Chip': 'Apple A13 Bionic',
          'RAM': '3GB',
          'Dung lượng': '64GB / 256GB',
          'Camera': '8MP Wide',
          'Pin': 'Lên đến 10 giờ',
          'Kết nối': 'Lightning',
          'Trọng lượng': '487g',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '64GB', priceModifier: 0, stock: 15 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 3000000, stock: 15 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 15 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 15 },
          { name: 'Kết nối', value: 'Wi-Fi', priceModifier: 0, stock: 20 },
          { name: 'Kết nối', value: 'Wi-Fi + 4G', priceModifier: 3000000, stock: 20 },
        ],
        extraMetadata: {
          badge: 'Tiết kiệm',
          chip: 'Apple A13 Bionic',
          ram: '3GB',
          warrantyMonths: 24,
          rating: 4.6,
          totalReviews: 4210,
          searchKeywords: ['ipad 9', 'budget ipad', 'student tablet', 'touch id'],
          warrantyLabel: 'Apple Việt Nam 1 năm',
          installmentEligible: true,
          freeShipping: true,
          isHot: true,
          promotionalCopy: 'Lựa chọn học sinh, sinh viên hàng đầu',
        },
      },
    ];
  }

  private genWatches(cat: Category) {
    return [
      {
        name: 'Apple Watch Ultra 3', slug: 'apple-watch-ultra-3',
        tagline: 'Đỉnh cao thể thao. Vượt mọi giới hạn.', shortDescription: 'Titan Grade 5 — 49mm — GPS + Cellular',
        price: 24990000,
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSs_6-8PW_qw-4NZl_JOjjmpl99osIQ6XJvA&s'],
        stock: 20, sold: 89,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Apple Watch Ultra 3 — Titanium Grade 5, màn hình Sapphire 3000 nits, lặn 100m, GPS kép</h2>
    <p>Apple Watch Ultra 3 không phải đồng hồ thông minh — đây là thiết bị đồng hành thể thao mạo hiểm đỉnh cao. Được thiết kế cùng các vận động viên ultra marathon, thợ lặn chuyên nghiệp và leo núi. Chống nước EN13319 100m, GPS kép chính xác tuyệt đối, pin 36 giờ ở chế độ thường và 72 giờ ở chế độ tiết kiệm.</p>
  </section>
  <section class="rd-durability">
    <h3>Sức bền không đối thủ trong đồng hồ thông minh</h3>
    <ul>
      <li>Khung titanium Grade 5 tinh chế — nhẹ và cứng hơn thép không gỉ</li>
      <li>Kính Sapphire — cứng thứ 2 sau kim cương, không trầy xước</li>
      <li>Chống nước 100m EN13319 — tiêu chuẩn thiết bị lặn chuyên nghiệp</li>
      <li>Nhiệt độ hoạt động -20°C đến 55°C — hoạt động trong mọi môi trường khắc nghiệt</li>
    </ul>
  </section>
  <section class="rd-gps">
    <h3>GPS kép chính xác, Pin 72 giờ</h3>
    <ul>
      <li>GPS kép (L1 + L5) — vệ tinh đa hệ thống, chính xác trong rừng rậm, núi cao</li>
      <li>36 giờ thường, 72 giờ Low Power mode — xuyên qua nhiều ngày không sạc</li>
      <li>Nút Action cam configurable — chạm là ghi lại điểm waypoint, bắt đầu workout</li>
    </ul>
  </section>
  <section class="rd-health">
    <h3>Sức khỏe và Màn hình</h3>
    <p>OLED 49mm 3000 nits — nhìn rõ dưới nắng cực mạnh. ECG, Blood Oxygen, Water Temperature (lặn), Depth Gauge, Crash Detection. Cellular tích hợp, chip S10 SiP. Dây Orange/Green Trail Loop hoặc Alpine Loop.</p>
  </section>
</div>`,
        whatsInTheBox: 'Apple Watch Ultra 3, Dây đeo Alpine Loop, Adapter USB-C sạc nhanh',
        specs: {
          'Màn hình': '49mm LTPO OLED, 3000 nits',
          'Chip': 'Apple S9 SiP',
          'RAM': '2GB',
          'Dung lượng': '64GB',
          'Pin': 'Lên đến 36 giờ',
          'Chống nước': '100m (WR100)',
          'GPS': 'Precision dual-frequency GPS',
          'Kết nối': 'GPS + Cellular',
        },
        category: cat,
        variants: [
          { name: 'Dây đeo', value: 'Alpine Loop (M/L)', priceModifier: 0, stock: 8 },
          { name: 'Dây đeo', value: 'Trail Loop (S/M)', priceModifier: 0, stock: 6 },
          { name: 'Dây đeo', value: 'Ocean Band', priceModifier: 0, stock: 6 },
          { name: 'Màu sắc', value: 'Titan Tự Nhiên', colorHex: '#b8b0a8', stock: 10 },
          { name: 'Màu sắc', value: 'Titan Đen', colorHex: '#3a3a3c', stock: 10 },
        ],
        extraMetadata: { badge: 'Mới', searchKeywords: ['apple watch ultra', 'rugged watch', 'sport watch'] },
      },
      {
        name: 'Apple Watch Series 10', slug: 'apple-watch-series-10',
        tagline: 'Thông minh hơn. Sáng hơn. Mỏng hơn.', shortDescription: '46mm — OLED — S9 SiP — Chống nước 50m',
        price: 11990000, originalPrice: 12990000,
        images: [
          'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/330050/apple-watch-s10-lte-42mm-vien-titanium-day-the-thao-trang-11-638623544822326204-750x500.jpg',
          'https://www.apple.com/newsroom/images/2024/09/introducing-apple-watch-series-10/article/Apple-Watch-Series-10-lineup-240909_big.jpg.large.jpg',
        ],
        stock: 50, sold: 345,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Apple Watch Series 10 — Mỏng 9.7mm, màn hình lớn nhất lịch sử, Double Tap</h2>
    <p>Apple Watch Series 10 là đồng hồ mỏng nhất, nhẹ nhất và màn hình lớn nhất từng có. Chỉ 9.7mm mỏng — gần như phẳng trên cổ tay. Màn hình OLED 46mm rộng hơn 10% và sáng hơn 30% so với Series 9. Double Tap điều khiển bằng ngón tay cái và trỏ — không cần chạm màn hình.</p>
  </section>
  <section class="rd-design">
    <h3>Mỏng nhất, nhẹ nhất, màn hình lớn nhất</h3>
    <ul>
      <li>Chỉ 9.7mm mỏng — mỏng hơn nhiều đồng hồ cơ truyền thống</li>
      <li>OLED 46mm 2000 nits — nhìn rõ dưới nắng mạnh, viền siêu mỏng</li>
      <li>Góc nhìn tăng 30% — đọc thông báo từ mọi góc độ</li>
      <li>Vỏ nhôm, titan, hoặc thép — 3 vật liệu tùy chọn phong cách</li>
    </ul>
  </section>
  <section class="rd-features">
    <h3>Double Tap và Siri on-device</h3>
    <ul>
      <li>Double Tap — gõ ngón cái và ngón trỏ 2 lần: bắt cuộc gọi, dừng báo thức không cần chạm</li>
      <li>Siri on-device — xử lý ngôn ngữ trên chip S10, không cần internet</li>
      <li>Crash Detection, Fall Detection, Emergency SOS — an toàn luôn bên bạn</li>
    </ul>
  </section>
  <section class="rd-health">
    <h3>Sức khỏe toàn diện</h3>
    <p>ECG, Blood Oxygen, Heart Rate, Cycle Tracking, Mindfulness. Sleep tracking chính xác. Chống nước 50m. Cellular tích hợp. Chip S10 SiP. Pin 18 giờ. Hơn 150 loại workout. watchOS 11 với Vitals và Pregnancy Tracking.</p>
  </section>
</div>`,
        whatsInTheBox: 'Apple Watch Series 10, Dây đeo, Adapter sạc USB-C',
        specs: {
          'Màn hình': '46mm / 42mm LTPO OLED',
          'Chip': 'Apple S9 SiP',
          'RAM': '2GB',
          'Dung lượng': '64GB',
          'Pin': 'Lên đến 18 giờ',
          'Chống nước': '50m (WR50)',
          'Kết nối': 'GPS / GPS + Cellular',
          'Trọng lượng': '35.3g (nhôm)',
        },
        category: cat,
        variants: [
          { name: 'Kích thước', value: '42mm', priceModifier: 0, stock: 15 },
          { name: 'Kích thước', value: '46mm', priceModifier: 1000000, stock: 15 },
          { name: 'Chất liệu', value: 'Nhôm', priceModifier: 0, stock: 15 },
          { name: 'Chất liệu', value: 'Titan', priceModifier: 8000000, stock: 8 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 8 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 8 },
          { name: 'Màu sắc', value: 'Vàng Hồng', colorHex: '#f8c8dc', stock: 8 },
          { name: 'Kết nối', value: 'GPS', priceModifier: 0, stock: 25 },
          { name: 'Kết nối', value: 'GPS + Cellular', priceModifier: 3000000, stock: 25 },
        ],
        extraMetadata: { badge: 'Mới', searchKeywords: ['apple watch series 10', 'series 10', 'health watch'] },
      },
      {
        name: 'Apple Watch SE 2024', slug: 'apple-watch-se',
        tagline: 'Yêu thương bắt đầu từ手腕.', shortDescription: 'Chip S9 — Crash Detection — Giá phải chăng',
        price: 6990000,
        images: ['https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/apple_watch_se_gps_44mm_silver_aluminium_case_denim_sport_band_1_0511983c13.png'],
        stock: 60, sold: 520,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Apple Watch SE (2024) — Lối vào hệ sinh thái Watch tốt nhất, Crash Detection, giá tốt</h2>
    <p>Apple Watch SE 2024 là câu trả lời hoàn hảo cho ai muốn sức mạnh của hệ sinh thái Apple Watch mà không cần chi trả cho đầy đủ tính năng Pro. Crash Detection, Fall Detection, Activity rings, Heart Rate real-time — tất cả tính năng an toàn quan trọng nhất. Chip S9 mới nhanh hơn 20%.</p>
  </section>
  <section class="rd-safety">
    <h3>Tính năng An toàn — Quan trọng nhất</h3>
    <ul>
      <li><strong>Crash Detection</strong> — phát hiện tai nạn xe hơi, tự gọi cứu thương</li>
      <li><strong>Fall Detection</strong> — phát hiện ngã, gọi khẩn cấp tự động</li>
      <li><strong>Emergency SOS</strong> — nút bên hông gọi cứu hộ tức thì</li>
      <li>Heart Rate cao/thấp bất thường — thông báo ngay khi phát hiện vấn đề</li>
    </ul>
  </section>
  <section class="rd-fitness">
    <h3>Fitness và Hoạt động</h3>
    <ul>
      <li>Activity Rings — theo dõi đứng, di chuyển và luyện tập mỗi ngày</li>
      <li>Hơn 100 loại workout được nhận dạng tự động</li>
      <li>GPS tích hợp — bản đồ chạy bộ, đạp xe không cần iPhone</li>
      <li>Chống nước 50m — bơi lội, lặn snorkeling</li>
    </ul>
  </section>
  <section class="rd-value">
    <h3>Chip S9 và Giá trị</h3>
    <p>Chip S9 SiP nhanh hơn 20% so với SE thế hệ trước. OLED 44mm, Always-On không có (chỉ Series). Bluetooth, Wi-Fi, không có Cellular. Nặng 26.4g. Tùy chọn thêm band theo phong cách. watchOS 11.</p>
  </section>
</div>`,
        whatsInTheBox: 'Apple Watch SE, Dây đeo, Adapter sạc USB-C',
        specs: {
          'Màn hình': '40mm / 44mm Retina OLED',
          'Chip': 'Apple S9 SiP',
          'RAM': '2GB',
          'Dung lượng': '64GB',
          'Pin': 'Lên đến 18 giờ',
          'Chống nước': '50m (WR50)',
          'Kết nối': 'GPS / GPS + Cellular',
          'Trọng lượng': '32.9g (nhựa)',
        },
        category: cat,
        variants: [
          { name: 'Kích thước', value: '40mm', priceModifier: 0, stock: 20 },
          { name: 'Kích thước', value: '44mm', priceModifier: 1000000, stock: 20 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 15 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 15 },
          { name: 'Màu sắc', value: 'Vàng Hồng', colorHex: '#f8c8dc', stock: 15 },
          { name: 'Kết nối', value: 'GPS', priceModifier: 0, stock: 30 },
          { name: 'Kết nối', value: 'GPS + Cellular', priceModifier: 2000000, stock: 30 },
        ],
        extraMetadata: { badge: 'Tiết kiệm', searchKeywords: ['apple watch se', 'budget apple watch'] },
      },
    ];
  }

  private genAirPods(cat: Category) {
    return [
      {
        name: 'AirPods Pro 3', slug: 'airpods-pro-3',
        tagline: 'Âm thanh. Tái định nghĩa.', shortDescription: 'H2 Chip — ANC — USB-C — Spatial Audio',
        price: 7490000, originalPrice: 7990000,
        images: [
          'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:100/plain/https://cellphones.com.vn/media/wysiwyg/Tai-nghe/Apple/apple-airpods-pro-3-2.jpg',
          'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airpods-pro-3-hero-select-202509_FMT_WHH?wid=752&hei=636&fmt=jpeg&qlt=90&.v=1758077264181',
        ],
        stock: 70, sold: 612,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>AirPods Pro 3 — ANC gấp đôi thế hệ trước, Hearing Aid FDA, Spatial Audio cá nhân hóa</h2>
    <p>AirPods Pro 3 nâng ANC lên tầm mới: giảm ồn mạnh gấp đôi AirPods Pro 2 với chip H2 thế hệ mới. Lần đầu tiên trong lịch sử AirPods, tính năng Hearing Aid được FDA chấp nhận — hỗ trợ người nghe kém nhẹ đến vừa mà không cần thiết bị y tế riêng biệt. Spatial Audio cá nhân hóa theo hình dạng tai của bạn.</p>
  </section>
  <section class="rd-anc">
    <h3>Active Noise Cancellation — Yên tĩnh tuyệt đối</h3>
    <ul>
      <li>ANC mạnh gấp đôi AirPods Pro 2 — ngồi máy bay, tàu điện, cà phê ồn ào đều biến mất</li>
      <li>4 micro phát hiện tiếng ồn từ mọi hướng, xử lý 48,000 lần/giây bằng chip H2</li>
      <li>Adaptive Audio tự chuyển ANC/Transparency theo môi trường — không cần chỉnh tay</li>
      <li>Conversation Awareness tự giảm nhạc khi bạn bắt đầu nói chuyện</li>
    </ul>
  </section>
  <section class="rd-hearing">
    <h3>Hearing Aid — Đột phá y tế từ tai nghe</h3>
    <ul>
      <li>Tính năng Hearing Aid được FDA 510(k) chấp thuận — đầu tiên trong AirPods</li>
      <li>Kiểm tra thính lực ngay trong ứng dụng, cá nhân hóa EQ theo kết quả</li>
      <li>Khuếch đại âm thanh thực tế cho người nghe kém nhẹ đến vừa</li>
    </ul>
  </section>
  <section class="rd-audio">
    <h3>Chất lượng Âm thanh và Pin</h3>
    <p>Spatial Audio cá nhân hóa theo tai (H2 đo hình dạng tai bạn). Driver Apple tùy chỉnh, dải tần rộng. Pin 6 giờ ANC, 30 giờ với case. MagSafe USB-C, IP54 chống bụi nước. Tương thích iOS 18+, Android có giới hạn.</p>
  </section>
</div>`,
        whatsInTheBox: 'AirPods Pro 3, Case sạc MagSafe (USB-C), 4 size eartips, Cáp USB-C',
        specs: {
          'Chip': 'Apple H2',
          'ANC': 'Active Noise Cancellation thế hệ mới',
          'Pin (tai nghe)': 'Lên đến 6 giờ',
          'Pin (case)': 'Lên đến 30 giờ',
          'Sạc': 'MagSafe, Apple Watch, Qi2, USB-C',
          'Chống nước': 'IP54 (tai nghe + case)',
          'Kết nối': 'Bluetooth 5.3',
        },
        category: cat,
        variants: [
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 40 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 30 },
        ],
        extraMetadata: { badge: 'Mới', searchKeywords: ['airpods pro 3', 'anc earbuds', 'noise cancellation'] },
      },
      {
        name: 'AirPods 4', slug: 'airpods-4',
        tagline: 'Thiết kế mới. Âm thanh mới.', shortDescription: 'Chip H2 — Không eartip — Spatial Audio',
        price: 4990000, originalPrice: 5490000,
        images: ['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/329154/airpods-4-cong-usb-c-anc-2-638615780223885505-750x500.jpg'],
        stock: 80, sold: 890,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>AirPods 4 — Thiết kế không eartip, chip H2, Spatial Audio — thoải mái cả ngày</h2>
    <p>AirPods 4 mang chip H2 và Spatial Audio từ AirPods Pro xuống model tiêu chuẩn với thiết kế hoàn toàn mới: không eartip silicon — phù hợp mọi hình dạng tai mà không cần ép vào. Gọn nhẹ nhất trong dòng AirPods, đủ tính năng thông minh cho cuộc sống hàng ngày.</p>
  </section>
  <section class="rd-design">
    <h3>Thiết kế không eartip — Thoải mái cho mọi tai</h3>
    <ul>
      <li>Không có eartip silicon — không cảm giác bít tai, phù hợp mọi hình tai</li>
      <li>Thân tai nghe nằm tự nhiên trong tai — nhẹ 4.4g mỗi bên</li>
      <li>Force Sensor bấm nhẹ để điều khiển — không cần chạm ngón tay vào tai</li>
    </ul>
  </section>
  <section class="rd-audio">
    <h3>Chip H2 và Spatial Audio</h3>
    <ul>
      <li>Chip H2 từ AirPods Pro — xử lý âm thanh nhanh hơn 2x so với AirPods 3</li>
      <li>Spatial Audio với head tracking — âm nhạc và phim xung quanh bạn 360 độ</li>
      <li>Adaptive EQ tự chỉnh EQ theo hình dạng tai — âm thanh luôn tối ưu</li>
      <li>Voice Isolation loại bỏ tiếng ồn khi gọi điện — tiếng người rõ ràng</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin và Kết nối</h3>
    <p>Pin 5 giờ liên tục, 30 giờ với case. Sạc USB-C, tương thích MagSafe. Bluetooth 5.3, ghép nối tức thì với thiết bị Apple. IP54 (tùy model có ANC). Tự kết nối H1-based switching. Không có ANC ở model cơ bản.</p>
  </section>
</div>`,
        whatsInTheBox: 'AirPods 4, Case sạc USB-C',
        specs: {
          'Chip': 'Apple H2',
          'Pin (tai nghe)': 'Lên đến 5 giờ',
          'Pin (case)': 'Lên đến 25 giờ',
          'Sạc': 'USB-C',
          'Kết nối': 'Bluetooth 5.3',
          'Chống nước': 'IP54',
        },
        category: cat,
        variants: [
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 40 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 30 },
        ],
        extraMetadata: { badge: 'Bán chạy', searchKeywords: ['airpods 4', 'open earbuds', 'apple earbuds'] },
      },
      {
        name: 'AirPods Max', slug: 'airpods-max',
        tagline: 'Nghe như chưa từng nghe.', shortDescription: 'Over-ear — ANC — Spatial Audio — 20 giờ',
        price: 17990000, originalPrice: 19990000,
        images: [
          'https://www.apple.com/v/airpods-max/k/images/overview/welcome/max-loop_startframe__c0vn1ukmh7ma_xlarge.jpg',
        ],
        stock: 30, sold: 234,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>AirPods Max — Over-ear cao cấp nhất Apple, driver 40mm tùy chỉnh, Spatial Audio đỉnh cao</h2>
    <p>AirPods Max là tuyên ngôn về âm thanh cao cấp của Apple: driver động 40mm tùy chỉnh được thiết kế riêng — không dùng driver thương mại — cùng mesh headband breathable đan tay và vành nhôm anodized. Spatial Audio with head tracking biến mọi nội dung thành trải nghiệm rạp chiếu phim 3D.</p>
  </section>
  <section class="rd-audio">
    <h3>Driver 40mm tùy chỉnh — Âm thanh Hi-Fi</h3>
    <ul>
      <li>Driver động 40mm thiết kế riêng cho AirPods Max — không có trên tai nghe nào khác</li>
      <li>Dải tần 20Hz–20kHz phẳng không tô màu — nghe nhạc đúng như ý định nghệ sĩ</li>
      <li>9 micro phát hiện tiếng ồn và giọng nói — ANC mạnh nhất trong mọi tai nghe Apple</li>
      <li>Adaptive EQ tự chỉnh theo vị trí và độ kín của tai nghe</li>
    </ul>
  </section>
  <section class="rd-spatial">
    <h3>Spatial Audio với Head Tracking — Rạp chiếu phim trên tai</h3>
    <ul>
      <li>Spatial Audio với dynamic head tracking — âm thanh vẫn ở vị trí khi bạn quay đầu</li>
      <li>Dolby Atmos — phim và nhạc thể không gian 3D đầy đủ</li>
      <li>Personalized Spatial Audio — cá nhân hóa theo hình tai</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế Cao cấp</h3>
    <p>Vành nhôm anodized, mesh headband đan tay, earcup bọc Memory foam. Thoải mái đeo nhiều giờ. Digital Crown điều chỉnh âm lượng. Smart Case gập nhỏ gọn. USB-C, không Lightning. Pin 20 giờ ANC. 5 màu sắc sang trọng.</p>
  </section>
</div>`,
        whatsInTheBox: 'AirPods Max, Smart Case, Cáp USB-C sang Lightning',
        specs: {
          'Driver': 'Apple 40mm custom',
          'ANC': 'Active Noise Cancellation',
          'Pin': 'Lên đến 20 giờ',
          'Sạc': 'Lightning',
          'Kết nối': 'Bluetooth 5.0',
          'Chống ồn': 'Transparency mode',
        },
        category: cat,
        variants: [
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 6 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 6 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 5 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 5 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 5 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 6 },
        ],
        extraMetadata: { searchKeywords: ['airpods max', 'over ear headphones', 'premium headphones'] },
      },
    ];
  }

  private genAccessories(cat: Category) {
    return [
      {
        name: 'Ốp Lưng Silicon MagSafe iPhone 16 Pro', slug: 'opal-silicon-magsafe-iphone-16-pro',
        tagline: 'Bảo vệ vui vẻ. Gắn chặt chẽ.', shortDescription: 'Silicone bền — Gắn MagSafe — Microfiber bên trong',
        price: 1403000,
        images: [
          'https://cdn2.fptshop.com.vn/unsafe/op_lung_magsafe_iphone_16_silicon_nature_series_devia_2_a64e82e612.jpg',
          'https://cdn2.fptshop.com.vn/unsafe/op_lung_iphone_16_pro_trong_suot_32daf8de2d.png',
        ],
        stock: 120, sold: 450,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Ốp Lưng Silicon MagSafe iPhone 16 Pro — Silicone cao cấp, MagSafe, Microfiber bên trong</h2>
    <p>Ốp lưng Silicon MagSafe chính hãng Apple thiết kế riêng cho iPhone 16 Pro với vật liệu silicone ngoại cấp mềm mại không trơn trượt và lớp microfiber bên trong bảo vệ mặt kính iPhone. 45% chất liệu tái chế — Apple cam kết môi trường bền vững.</p>
  </section>
  <section class="rd-magsafe">
    <h3>MagSafe Tích hợp — Gắn chặt, Sạc nhanh</h3>
    <ul>
      <li>Vòng từ MagSafe tích hợp trong ốp — gắn chặt Charger MagSafe, Wallet, car mount</li>
      <li>Không cần tháo ốp khi sạc MagSafe 15W — tiện lợi tối đa</li>
      <li>Snap chắc chắn vào MagSafe Battery Pack và phụ kiện từ tính</li>
    </ul>
  </section>
  <section class="rd-protection">
    <h3>Bảo Vệ và Chất liệu</h3>
    <ul>
      <li>Silicone mềm mại — grip tốt, không trơn, cầm chắc tay</li>
      <li>Lớp Microfiber bên trong — không trầy mặt kính Ceramic Shield</li>
      <li>Viền nổi cao bảo vệ camera và màn hình khi đặt xuống bàn</li>
      <li>45% chất liệu tái chế — Apple Environmental Goals</li>
    </ul>
  </section>
  <section class="rd-colors">
    <h3>Màu sắc và Tương thích</h3>
    <p>8 màu sắc từ Apple, mỗi màu matching với màu iPhone 16 Pro. Tương thích iPhone 16 Pro chỉ. Cổng USB-C tiếp cận hoàn toàn không cần tháo. Camera Control tiếp cận hoàn toàn. Apple 1 năm bảo hành.</p>
  </section>
</div>`,
        whatsInTheBox: 'Ốp Lưng Silicon MagSafe cho iPhone 16 Pro',
        specs: {
          'Chất liệu': 'Silicone (45% tái chế)',
          'Lớp trong': 'Microfiber',
          'Tương thích': 'iPhone 16 Pro',
          'Gắn MagSafe': 'Có',
          'Chống va đập': 'Có',
        },
        category: cat,
        variants: [
          { name: 'Màu sắc', value: 'Ổ Đào', colorHex: '#ff8c69', stock: 20 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 20 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 20 },
          { name: 'Màu sắc', value: 'Xanh Băng', colorHex: '#a7c7e7', stock: 20 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 20 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 20 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 10 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 10 },
        ],
        extraMetadata: { searchKeywords: ['op lung iphone', 'silicon case', 'magsafe case', 'apple case'] },
      },
      {
        name: 'Ốp Lưng Trong Suốt MagSafe iPhone 16', slug: 'opal-trong-suot-magsafe-iphone-16',
        tagline: 'Khoe màu iPhone. Bảo vệ tối đa.', shortDescription: 'Trong suốt — Gắn MagSafe — Chống ố vàng',
        price: 1403000,
        images: ['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/60/329748/op-lung-iphone-16-plus-nhua-cung-vien-deo-laut-crystal-m-1-638615848617296138-750x500.jpg'],
        stock: 80, sold: 320,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Ốp Lưng Trong Suốt MagSafe iPhone 16 — Khoe màu iPhone, chống ố vàng, MagSafe</h2>
    <p>Ốp lưng trong suốt MagSafe chính hãng Apple là cách tốt nhất để khoe trọn vẻ đẹp màu sắc iPhone 16 trong khi vẫn bảo vệ hoàn toàn. Công nghệ optically clear cho độ trong suốt hoàn hảo, và chống ố vàng về lâu dài — điều thường thấy ở ốp trong suốt giá rẻ.</p>
  </section>
  <section class="rd-clarity">
    <h3>Optically Clear — Trong Suốt Hoàn Hảo</h3>
    <ul>
      <li>Optically clear — không làm màu iPhone bị lệch hay ố vàng</li>
      <li>Công nghệ chống UV — ngăn ố vàng do ánh sáng mặt trời</li>
      <li>Cứng Polycarbonate phía sau — chắc chắn, không cong vênh</li>
      <li>Viền dẻo TPU — hấp thụ va đập từ cạnh và góc</li>
    </ul>
  </section>
  <section class="rd-magsafe">
    <h3>MagSafe và Bảo vệ</h3>
    <ul>
      <li>Vòng từ MagSafe tích hợp — tương thích toàn bộ phụ kiện MagSafe</li>
      <li>Viền nổi 1.5mm bảo vệ màn hình khi đặt xuống</li>
      <li>Viền nổi 2mm bảo vệ camera — không trầy khi đặt nằm xuống mặt phẳng</li>
    </ul>
  </section>
  <section class="rd-compatibility">
    <h3>Thiết kế và Tương thích</h3>
    <p>Tương thích iPhone 16 chỉ (không dùng cho 16 Pro, 16 Plus). Tiếp cận hoàn toàn tất cả nút, loa, USB-C, Camera Control. Nhẹ 29g không làm iPhone nặng thêm đáng kể. 1 màu Trong suốt. Apple 1 năm bảo hành.</p>
  </section>
</div>`,
        whatsInTheBox: 'Ốp Lưng Trong Suốt MagSafe cho iPhone 16',
        specs: {
          'Chất liệu': 'Polycarbonate trong suốt',
          'Tương thích': 'iPhone 16',
          'Gắn MagSafe': 'Có',
          'Chống ố vàng': 'Có',
        },
        category: cat,
        variants: [
          { name: 'Màu sắc', value: 'Trong suốt', colorHex: 'rgba(255,255,255,0.3)', stock: 80 },
        ],
        extraMetadata: { searchKeywords: ['clear case', 'transparent case', 'magsafe iphone 16'] },
      },
      {
        name: 'Magic Keyboard cho iPad Pro', slug: 'magic-keyboard-ipad-pro',
        tagline: 'Gõ như máy tính. Nhẹ như giấy.', shortDescription: 'Cảm ứng lực 1mm — USB-C pass-through — Floating',
        price: 8990000,
        images: ['https://www.maccenter.vn/Accessories/Apple-MagicKeyboard-iPadPro-White-A.jpg'],
        stock: 40, sold: 178,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Magic Keyboard cho iPad Pro — Floating design, trackpad haptic, cổng USB-C pass-through</h2>
    <p>Magic Keyboard cho iPad Pro biến iPad Pro thành laptop thực thụ. Thiết kế floating cantilever nâng iPad nổi trên bàn phím tạo cảm giác máy tính chuyên nghiệp. Bàn phím cảm ứng lực 1mm hành trình với đèn nền, trackpad lớn với haptic feedback.</p>
  </section>
  <section class="rd-design">
    <h3>Floating Cantilever — Độc đáo và Chắc chắn</h3>
    <ul>
      <li>Floating cantilever — iPad nổi trên bàn phím qua cánh tay kim loại, điều chỉnh góc nghiêng</li>
      <li>Kết nối Smart Connector magnetic — không cần Bluetooth, không cần sạc riêng</li>
      <li>Cổng USB-C pass-through — sạc iPad trong khi dùng Magic Keyboard</li>
      <li>Khung nhôm anodized matching màu iPad — đen hoặc trắng</li>
    </ul>
  </section>
  <section class="rd-keyboard">
    <h3>Bàn phím Cảm ứng Lực và Trackpad Haptic</h3>
    <ul>
      <li>Hành trình 1mm cảm ứng lực với đèn nền — gõ thoải mái như MacBook</li>
      <li>Trackpad lớn với Haptic Feedback — click vật lý cảm giác thật, đa điểm</li>
      <li>Hỗ trợ cursor iPadOS hoàn chỉnh — di chuyển chuột, cuộn, vuốt</li>
    </ul>
  </section>
  <section class="rd-compatibility">
    <h3>Tương thích</h3>
    <p>Magic Keyboard mới (M4) tương thích iPad Pro M4 11 và 13 inch. Cổng USB-C 3Gb/s pass-through (không truyền data). Vỏ nhựa polyurethane trắng hoặc đen. Tách iPad khỏi keyboard dễ dàng — dùng độc lập khi cần.</p>
  </section>
</div>`,
        whatsInTheBox: 'Magic Keyboard, Cáp USB-C',
        specs: {
          'Hành trình phím': '1mm',
          'Trackpad': 'Haptic Feedback',
          'Đèn nền': 'Có',
          'Cổng': 'USB-C pass-through',
          'Tương thích': 'iPad Pro 13" / 11" M4',
          'Trọng lượng': '630g (13"), 550g (11")',
        },
        category: cat,
        variants: [
          { name: 'Kích thước', value: '11 inch (M4)', priceModifier: 0, stock: 20 },
          { name: 'Kích thước', value: '13 inch (M4)', priceModifier: 2000000, stock: 15 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 20 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 15 },
        ],
        extraMetadata: { searchKeywords: ['magic keyboard ipad', 'ipad keyboard', 'ipad pro keyboard'] },
      },
      {
        name: 'Apple Pencil Pro', slug: 'apple-pencil-pro',
        tagline: 'Bút. Tái định nghĩa.', shortDescription: 'Haptic Feedback — Barrel Roll — Find My',
        price: 4990000,
        images: ['https://cdn.tgdd.vn/Products/Images/1882/325539/apple-pencil-pro-600x600.jpg'],
        stock: 60, sold: 234,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Apple Pencil Pro — Haptic feedback, Barrel Roll, Find My — Bút iPad đỉnh cao nhất</h2>
    <p>Apple Pencil Pro là bước tiến vượt trội với haptic engine bên trong tạo phản hồi rung tinh tế khi nhấn nút bên hông, và Barrel Roll — cảm biến gyroscope nhận biết góc xoay của bút. Trong Procreate, xoay bút thay đổi góc cọ như cọ vẽ thực tế. Không còn cần dùng nút trên màn hình.</p>
  </section>
  <section class="rd-features">
    <h3>Tính năng mới — Barrel Roll và Haptic</h3>
    <ul>
      <li><strong>Barrel Roll</strong> — gyroscope nhận góc xoay bút: xoay cọ trong Procreate, đổi bút trong GoodNotes</li>
      <li><strong>Haptic Feedback</strong> — bấm nút bên hông cảm nhận rung nhẹ xác nhận tức thì</li>
      <li><strong>Nút ngữ cảnh</strong> — bấm đôi đổi công cụ theo từng ứng dụng (Procreate, Notes, GoodNotes)</li>
      <li><strong>Find My</strong> — bút mất là tìm được qua mạng Find My của Apple</li>
    </ul>
  </section>
  <section class="rd-performance">
    <h3>Độ chính xác và Sạc</h3>
    <ul>
      <li>Độ trễ 9ms — cảm giác như viết trên giấy thực sự</li>
      <li>Cảm biến áp lực, nghiêng — nét đậm nhạt theo lực bút</li>
      <li>Sạc không dây MagSafe — đặt lên cạnh iPad Pro M4 hoặc iPad Air M3 là sạc</li>
    </ul>
  </section>
  <section class="rd-compatibility">
    <h3>Tương thích</h3>
    <p>Chỉ tương thích iPad Pro M4 (11 và 13 inch) và iPad Air M3 (11 và 13 inch). Không tương thích iPad mini hay iPad cơ bản. Tự động ghép nối khi đặt gần iPad. Không cần sạc riêng.</p>
  </section>
</div>`,
        whatsInTheBox: 'Apple Pencil Pro',
        specs: {
          'Cảm biến': 'Áp suất, độ nghiêng',
          'Haptic Feedback': 'Có',
          'Barrel Roll': 'Có',
          'Find My': 'Có',
          'Sạc': 'MagSafe / USB-C',
          'Tương thích': 'iPad Pro M4, iPad Air M3',
        },
        category: cat,
        variants: [
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 60 },
        ],
        extraMetadata: { badge: 'Mới', searchKeywords: ['apple pencil pro', 'ipad pen', 'stylus'] },
      },
      {
        name: 'Magic Mouse 3', slug: 'magic-mouse-3',
        tagline: 'Nhỏ gọn. Thông minh.', shortDescription: 'Surface sensor — Haptic Feedback — Sạc USB-C',
        price: 2990000,
        images: ['https://cdn2.cellphones.com.vn/x/media/catalog/product/c/h/chuot-apple-magic-mouse-3_3__3.png'],
        stock: 90, sold: 567,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Magic Mouse 3 — Multi-Touch toàn bề mặt, Haptic Feedback, sạc USB-C</h2>
    <p>Magic Mouse 3 nâng cấp quan trọng với USB-C và haptic feedback mới: lần đầu tiên Magic Mouse phản hồi cảm giác khi bạn cuộn và thực hiện cử chỉ. Bề mặt Multi-Touch toàn bộ phần trên — vuốt, cuộn, pinch đều hoạt động mượt mà như trackpad.</p>
  </section>
  <section class="rd-touch">
    <h3>Multi-Touch Toàn Bề Mặt</h3>
    <ul>
      <li>Bề mặt Multi-Touch phủ toàn bộ phía trên — không giới hạn vùng cảm ứng</li>
      <li>Vuốt ngang chuyển desktop, pinch zoom trong Safari và Photos</li>
      <li>Cuộn quán tính mượt mà với momentum scrolling</li>
      <li>Haptic Feedback — cảm giác rung nhẹ khi thực hiện cử chỉ</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế và Kết nối</h3>
    <ul>
      <li>Nhôm anodized Bạc và Đen Midnight — phù hợp Mac hoặc iMac</li>
      <li>USB-C — cùng loại dây với MacBook, sạc bất cứ nơi nào</li>
      <li>Bluetooth 5.0 — ghép nối tức thì với Mac, iPad</li>
      <li>Pin lithium-ion — sạc 2 phút dùng 9 giờ</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin và Tương thích</h3>
    <p>Pin lithium-ion không thay thế được — sạc khi dùng hết. Thời lượng pin vài tháng sử dụng bình thường. Tương thích mọi Mac với macOS 14+. Không tương thích Windows (không có driver Multi-Touch).</p>
  </section>
</div>`,
        whatsInTheBox: 'Magic Mouse 3, Cáp USB-C sang USB-C',
        specs: {
          'Cảm biến': 'Multi-Touch surface',
          'Kết nối': 'Bluetooth, USB-C',
          'Pin': 'Pin lithium-ion (vài tháng)',
          'Tương thích': 'Mac, iPad',
        },
        category: cat,
        variants: [
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 50 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 40 },
        ],
        extraMetadata: { searchKeywords: ['magic mouse', 'apple mouse', 'wireless mouse'] },
      },
      {
        name: 'Magic Keyboard với Touch ID', slug: 'magic-keyboard-touch-id',
        tagline: 'Gõ. Touch ID. An toàn.', shortDescription: 'Touch ID — Cảm ứng lực 1mm — USB-C',
        price: 5990000,
        images: ['https://cdn2.cellphones.com.vn/x/media/catalog/product/b/a/ban-phim-apple-magic-keyboard-touch-id-2021-1.jpg'],
        stock: 55, sold: 345,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Magic Keyboard Touch ID — Gõ bằng vân tay, đăng nhập Mac, Apple Pay tức thì</h2>
    <p>Magic Keyboard Touch ID mang tính năng Touch ID lên bàn phím rời — gõ fingerprint để đăng nhập Mac, xác nhận Apple Pay, điền mật khẩu. Không cần gõ mật khẩu nữa. Cảm ứng lực 1mm hành trình với đèn nền và sạc USB-C.</p>
  </section>
  <section class="rd-touchid">
    <h3>Touch ID — Bảo mật Vân tay Tích hợp</h3>
    <ul>
      <li>Touch ID nút góc phải — chạm là đăng nhập Mac tức thì</li>
      <li>Apple Pay xác nhận bằng vân tay — thanh toán an toàn không cần nhập mật khẩu</li>
      <li>1Password, 1Blocker, ứng dụng bảo mật — mở khoá bằng vân tay</li>
      <li>Nhận diện 5 vân tay riêng biệt — nhiều người dùng cùng Mac</li>
    </ul>
  </section>
  <section class="rd-typing">
    <h3>Bàn phím Cao cấp</h3>
    <ul>
      <li>Hành trình 1mm scissor mechanism — gõ chính xác, ít mỏi tay</li>
      <li>Đèn nền tự động điều chỉnh theo ánh sáng xung quanh</li>
      <li>Full-size layout với số pad (Magic Keyboard with Numeric Keypad)</li>
      <li>Thiết kế mỏng 6.5mm — không chiếm nhiều diện tích bàn</li>
    </ul>
  </section>
  <section class="rd-connectivity">
    <h3>Kết nối và Pin</h3>
    <p>Bluetooth 5.0, USB-C. Sạc bằng cáp USB-C (bán kèm). Pin tích hợp — vài tháng không cần sạc khi dùng Bluetooth. Tương thích Mac Apple Silicon M1 trở lên và Mac Intel với T2 chip. Màu Bạc và Đen Midnight.</p>
  </section>
</div>`,
        whatsInTheBox: 'Magic Keyboard Touch ID, Cáp USB-C',
        specs: {
          'Touch ID': 'Có',
          'Hành trình phím': '1mm',
          'Đèn nền': 'Có',
          'Sạc': 'USB-C',
          'Tương thích': 'Mac có Apple Silicon',
        },
        category: cat,
        variants: [
          { name: 'Bố cục', value: 'Tiếng Anh (US)', priceModifier: 0, stock: 30 },
          { name: 'Bố cục', value: 'Tiếng Việt', priceModifier: 0, stock: 25 },
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 30 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 25 },
        ],
        extraMetadata: { searchKeywords: ['magic keyboard touch id', 'keyboard fingerprint', 'mac keyboard'] },
      },
      {
        name: 'Dây Đeo Chéo Apple', slug: 'day-deo-chéo-apple',
        tagline: 'Gắn vào. Khoe ra.', shortDescription: 'Silicone — Gắn ốp lưng MagSafe — Nhiều màu',
        price: 1668000,
        images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/a/day-deo-cheo-apple-crossbody-strap_12_.png'],
        stock: 100, sold: 289,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Dây Đeo Chéo Apple — Crossbody Strap MagSafe, rảnh tay, nhiều màu sắc</h2>
    <p>Dây Đeo Chéo Apple (Crossbody Strap) cho phép bạn đeo iPhone qua vai hay qua thân hoàn toàn rảnh tay — không cần túi xách, không cần ví. Gắn từ tính MagSafe chắc chắn qua ốp lưng tương thích, dễ tháo ra khi cần một tay. Thiết kế tối giản Apple.</p>
  </section>
  <section class="rd-magsafe">
    <h3>Gắn MagSafe — Chắc chắn và Tiện lợi</h3>
    <ul>
      <li>Connector MagSafe gắn vào ốp lưng MagSafe (cần ốp lưng MagSafe — bán riêng)</li>
      <li>Lực từ đủ để giữ iPhone khi đi bộ, tàu xe, không lo rơi</li>
      <li>Tháo nhanh một tay khi cần dùng iPhone — không cần tháo ốp</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Silicone Cao cấp và Màu sắc</h3>
    <ul>
      <li>Silicone bền bỉ, mềm mại — không làm xước quần áo khi chạm vào</li>
      <li>Điều chỉnh độ dài dây — vừa với mọi vóc dáng, qua vai hoặc qua thân</li>
      <li>5 màu sắc matching ốp lưng Silicon MagSafe chính hãng Apple</li>
    </ul>
  </section>
  <section class="rd-compatibility">
    <h3>Tương thích</h3>
    <p>Tương thích với mọi ốp lưng MagSafe chính hãng Apple (Silicon, trong suốt, FineWoven). Cần ốp lưng MagSafe để gắn — dây đeo không gắn trực tiếp vào iPhone. Tương thích iPhone 12 trở lên có MagSafe.</p>
  </section>
</div>`,
        whatsInTheBox: 'Dây Đeo Chéo',
        specs: {
          'Chất liệu': 'Silicone bền',
          'Gắn': 'Ốp lưng MagSafe tương thích',
          'Tương thích': 'iPhone có ốp lưng MagSafe',
        },
        category: cat,
        variants: [
          { name: 'Màu sắc', value: 'Ổ Đào', colorHex: '#ff8c69', stock: 20 },
          { name: 'Màu sắc', value: 'Đen', colorHex: '#1d1d1f', stock: 20 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 20 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 20 },
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 20 },
        ],
        extraMetadata: { searchKeywords: ['day deo cho', 'iphone strap', 'crossbody strap'] },
      },
      {
        name: 'Bộ Sạc MagSafe 45W', slug: 'bo-sac-magsafe-45w',
        tagline: 'Sạc không dây. Không cần cáp.', shortDescription: '15W MagSafe — Gập được — USB-C',
        price: 1990000,
        images: ['https://bizweb.dktcdn.net/thumb/1024x1024/100/318/659/products/1312157581-500x500-sa-700x700-04cf9618-a724-4fd6-9443-99685c5171e4.jpg?v=1532344870800'],
        stock: 75, sold: 412,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Bộ Sạc MagSafe 15W — Sạc không dây nhanh nhất cho iPhone, gắn từ tính tự căn chỉnh</h2>
    <p>MagSafe Charger là cách sạc tối ưu cho iPhone 12 trở lên — 15W không dây, nhanh hơn gấp đôi Qi thông thường (7.5W). Vòng từ tính tự căn chỉnh lên trung tâm coil của iPhone để đạt hiệu suất sạc cao nhất mà không cần căn chỉnh bằng tay.</p>
  </section>
  <section class="rd-speed">
    <h3>15W — Sạc Nhanh Nhất Không Dây cho iPhone</h3>
    <ul>
      <li>15W MagSafe — sạc 0→50% trong khoảng 75 phút (nhanh hơn Qi 7.5W)</li>
      <li>Gắn từ tính tự căn chỉnh — không cần căn vị trí như sạc Qi thông thường</li>
      <li>Sạc xuyên ốp lưng MagSafe — không cần tháo ốp</li>
      <li>LED vòng trắng cho biết sạc đang hoạt động</li>
    </ul>
  </section>
  <section class="rd-versatile">
    <h3>Đa dụng — Sạc được nhiều thiết bị</html>
    <ul>
      <li>AirPods Pro và AirPods 3 có case MagSafe — đặt lên sạc trực tiếp</li>
      <li>Qi2 compatibility — sạc Android Qi2 15W (Samsung, Pixel mới)</li>
      <li>Dây 1m / 2m — đủ dài để đặt trên đầu giường hoặc bàn làm việc</li>
    </ul>
  </section>
  <section class="rd-requirements">
    <h3>Yêu cầu và Tương thích</h3>
    <p>Cần USB-C Power Adapter 20W trở lên (không bao gồm). MagSafe 15W chỉ với iPhone 12 và mới hơn. iPhone cũ hơn và Android sạc Qi 7.5W tiêu chuẩn. Dây USB-C. Bảo hành Apple 1 năm.</p>
  </section>
</div>`,
        whatsInTheBox: 'Bộ Sạc MagSafe',
        specs: {
          'Công suất': '15W',
          'Kết nối': 'USB-C',
          'Tương thích': 'iPhone 12 trở lên, AirPods MagSafe',
        },
        category: cat,
        variants: [
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 75 },
        ],
        extraMetadata: { searchKeywords: ['sac macsafe', 'wireless charger', 'apple charger'] },
      },
      {
        name: 'AirTag', slug: 'airtag',
        tagline: 'Tìm đồ. Không lo mất.', shortDescription: 'Precision Finding — Loa tích hợp — Thay được pin',
        price: 990000,
        images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/a/i/airtag-3.png'],
        stock: 150, sold: 1230,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>AirTag — Precision Finding Ultra Wideband, Find My Network, thay pin CR2032 dễ dàng</h2>
    <p>AirTag là thiết bị tìm đồ thông minh nhất: dùng chip U1 Ultra Wideband để chỉ hướng đến đồ vật bị mất với độ chính xác centimetre — không chỉ gần đây hay xa. Kết nối ẩn danh với hàng triệu thiết bị Apple trong mạng Find My toàn cầu để tìm đồ ngay cả khi ở nơi xa lạ.</p>
  </section>
  <section class="rd-precision">
    <h3>Precision Finding — Chỉ Hướng Chính Xác</h3>
    <ul>
      <li>Chip U1 Ultra Wideband — chỉ hướng mũi tên đến đúng vị trí AirTag trong bán kính gần</li>
      <li>Màn hình iPhone hiển thị khoảng cách tính bằng mét và hướng mũi tên — tìm trong nhà dễ dàng</li>
      <li>Loa tích hợp — phát âm thanh để tìm khi AirTag ở gần nhưng khuất tầm nhìn</li>
    </ul>
  </section>
  <section class="rd-network">
    <h3>Find My Network — Tìm Mọi Nơi Trên Thế Giới</h3>
    <ul>
      <li>Hàng triệu thiết bị Apple quét Bluetooth ẩn danh — phát hiện AirTag và báo vị trí</li>
      <li>Hoàn toàn ẩn danh và mã hóa — người phát hiện không biết AirTag thuộc về ai</li>
      <li>Chế độ Lost Mode — nhận thông báo ngay khi ai đó tìm thấy AirTag</li>
    </ul>
  </section>
  <section class="rd-battery">
    <h3>Pin CR2032 và Chống Nước</h3>
    <p>Pin CR2032 tiêu chuẩn — thay được dễ dàng, không cần gửi hãng. Pin kéo dài hơn 1 năm. IP67 chống nước và bụi. Khắc laser tên hoặc emoji (khi mua trực tiếp Apple). Đường kính 31.9mm, dày 8mm. Không bao gồm keyring — mua thêm Hermès Luggage Tag hoặc holder bên thứ ba.</p>
  </section>
</div>`,
        whatsInTheBox: 'AirTag (1 cái), Hướng dẫn',
        specs: {
          'Chip': 'Apple U1 (UWB)',
          'Kết nối': 'Bluetooth',
          'Pin': 'CR2032 (thay được)',
          'Chống nước': 'IP67',
          'Loa': 'Tích hợp',
        },
        category: cat,
        variants: [
          { name: 'Số lượng', value: '1 cái', priceModifier: 0, stock: 80 },
          { name: 'Số lượng', value: '4 cái (Gói)', priceModifier: 2000000, stock: 70 },
        ],
        extraMetadata: { badge: 'Bán chạy', searchKeywords: ['airtag', 'smart tracker', 'find item'] },
      },
      {
        name: 'Bộ Adapter Sạc 96W USB-C', slug: 'adapter-sac-96w',
        tagline: 'Sạc nhanh. Mọi thiết bị.', shortDescription: '96W — USB-C PD — Tương thích MacBook Pro',
        price: 3490000,
        images: ['https://bizweb.dktcdn.net/thumb/1024x1024/100/318/659/products/apple-61w-usb-c-power-adapter-e53647e5-1b58-47ed-bbe1-e33b5cd769d1-1db6235f-e16d-4a0b-b06b-94cee0f6b371.jpg?v=1620704685950'],
        stock: 45, sold: 198,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Adapter Sạc 96W USB-C — Sạc nhanh MacBook Pro, 2 cổng USB-C, Power Delivery</h2>
    <p>Adapter sạc 96W USB-C Power Delivery là lựa chọn tối ưu cho MacBook Pro 14 và 16 inch. Công suất 96W đủ để sạc đầy MacBook Pro trong khoảng 2 giờ. 2 cổng USB-C cho phép sạc MacBook và iPhone/iPad đồng thời mà không cần adapter thứ hai.</p>
  </section>
  <section class="rd-charging">
    <h3>Sạc Nhanh Power Delivery</h3>
    <ul>
      <li>96W USB-C Power Delivery — sạc nhanh MacBook Pro 14 inch và 16 inch</li>
      <li>2 cổng USB-C — sạc MacBook Pro qua MagSafe và iPhone/iPad qua USB-C cùng lúc</li>
      <li>Hỗ trợ sạc nhanh iPhone 15+ (20W từ cổng thứ hai)</li>
      <li>Power Delivery 3.0 — phân phối điện thông minh theo thiết bị</li>
    </ul>
  </section>
  <section class="rd-design">
    <h3>Thiết kế Nhỏ Gọn và An Toàn</h3>
    <ul>
      <li>Compact GaN (Gallium Nitride) — nhỏ gọn hơn 40% adapter truyền thống cùng công suất</li>
      <li>Tự động điều chỉnh điện áp 100-240V — dùng được toàn thế giới</li>
      <li>Bảo vệ quá nhiệt, quá áp, quá dòng — an toàn tuyệt đối</li>
    </ul>
  </section>
  <section class="rd-compatibility">
    <h3>Tương thích</h3>
    <p>Sạc MacBook Pro 14/16 M1-M4 qua MagSafe hoặc USB-C. iPhone, iPad, AirPods, Apple Watch (với adapter). Cáp USB-C không bao gồm — cần dùng cáp USB-C chính hãng Apple hoặc tương đương. Bảo hành 12 tháng.</p>
  </section>
</div>`,
        whatsInTheBox: 'Adapter 96W USB-C, Dây USB-C (2m)',
        specs: {
          'Công suất': '96W',
          'Cổng': '2× USB-C',
          'Sạc nhanh': 'USB-C PD',
          'Tương thích': 'MacBook Pro, iPhone, iPad',
        },
        category: cat,
        variants: [
          { name: 'Màu sắc', value: 'Trắng', colorHex: '#f5f5f7', stock: 45 },
        ],
        extraMetadata: { searchKeywords: ['adapter sac macbook', '96w charger', 'usb-c pd'] },
      },
    ];
  }

  private genTV(cat: Category) {
    return [
      {
        name: 'Apple TV 4K 128GB', slug: 'apple-tv-4k',
        tagline: 'TV thông minh. Apple style.', shortDescription: 'A15 Bionic — 4K HDR — tvOS',
        price: 6990000,
        images: ['https://cdn2.fptshop.com.vn/unsafe/564x0/filters:quality(80)/Uploads/images/2015/Tin-Tuc/DuyLe/Event/Pantech/Apple-tv-2022-4k-64gb-3.jpg'],
        stock: 40, sold: 234,
        description: `<div class="rich-description">
  <section class="rd-hero">
    <h2>Apple TV 4K — A15 Bionic, Dolby Vision 4K, Dolby Atmos, Hub HomeKit trung tâm</h2>
    <p>Apple TV 4K là cách tốt nhất để trải nghiệm hệ sinh thái Apple trên màn hình TV lớn. Chip A15 Bionic — cùng chip với iPhone 13 Pro — mang lại hiệu năng vượt xa mọi streaming box khác. Hỗ trợ 4K Dolby Vision HDR và Dolby Atmos cho chất lượng hình ảnh và âm thanh điện ảnh thực thụ.</p>
  </section>
  <section class="rd-media">
    <h3>Chất lượng Hình ảnh và Âm thanh Điện ảnh</h3>
    <ul>
      <li>4K Dolby Vision HDR — màu sắc cực rộng, tương phản cực cao như rạp chiếu phim</li>
      <li>HDR10+ và HLG — tương thích mọi TV HDR cao cấp</li>
      <li>Dolby Atmos — âm thanh không gian 3D đích thực qua soundbar/AV receiver</li>
      <li>HDMI 2.1 (4K 120fps) — chơi game TV 120fps với zero lag mode</li>
    </ul>
  </section>
  <section class="rd-ecosystem">
    <h3>Hub HomeKit và AirPlay</h3>
    <ul>
      <li>Hub HomeKit trung tâm — điều khiển toàn bộ smarthome từ xa khi bạn vắng nhà</li>
      <li>AirPlay 2 — phản chiếu iPhone, iPad, Mac lên TV không dây độ trễ thấp</li>
      <li>Apple TV+ sẵn sàng — xem nội dung gốc Apple chất lượng 4K Dolby Vision</li>
      <li>App Store tvOS — hàng ngàn ứng dụng và game phù hợp màn hình lớn</li>
    </ul>
  </section>
  <section class="rd-remote">
    <h3>Siri Remote và Hiệu Năng</h3>
    <p>Siri Remote nhôm với touch surface, nút điều hướng Power/Volume tích hợp. Chip A15 Bionic — phản hồi tức thì, không giật. Thread network — hub cho thiết bị Matter/Thread. Wi-Fi 6, Bluetooth 5.0, Ethernet tùy chọn. 16GB/64GB lưu trữ.</p>
  </section>
</div>`,
        whatsInTheBox: 'Apple TV 4K, Remote Siri, Dây nguồn, Cáp USB-C',
        specs: {
          'Chip': 'Apple A15 Bionic',
          'Bộ nhớ': '128GB / 256GB',
          'Video': '4K Dolby Vision, HDR10+, HLG',
          'Âm thanh': 'Dolby Atmos',
          'Kết nối': 'Wi-Fi 6E, Bluetooth 5.3, HDMI 2.1',
          'Remote': 'Siri Remote',
        },
        category: cat,
        variants: [
          { name: 'Dung lượng', value: '128GB', priceModifier: 0, stock: 25 },
          { name: 'Dung lượng', value: '256GB', priceModifier: 3000000, stock: 15 },
        ],
        extraMetadata: { searchKeywords: ['apple tv 4k', 'streaming box', '4k tv'] },
      },
    ];
  }
}
