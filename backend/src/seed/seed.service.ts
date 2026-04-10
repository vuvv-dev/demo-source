import { Injectable } from '@nestjs/common';
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
export class SeedService {
  private defaultCustomer: User | null = null;

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
    console.log(`✅ Seed complete in ${elapsed}ms — ${total} products in DB`);
    return { success: true, total, elapsed };
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

  // ─────────────────────────────────────────────────────────────────────────
  // PRODUCTS
  // ─────────────────────────────────────────────────────────────────────────
  private async seedProducts() {
    const cats = await this.categoryRepo.find();
    const catMap = Object.fromEntries(cats.map(c => [c.slug, c]));

    const generators = [
      this.genIPhones(catMap['iphone']),
      this.genMacs(catMap['mac']),
      this.genIPads(catMap['ipad']),
      this.genWatches(catMap['apple-watch']),
      this.genAirPods(catMap['airpods']),
      this.genAccessories(catMap['phu-kien']),
      this.genTV(catMap['tv']),
      // this.genAndroid(catMap['android']),
      // this.genLaptops(catMap['laptop']),
      // this.genTablets(catMap['tablet']),
      // this.genHeadphones(catMap['tai-nghe']),
      // this.genSpeakers(catMap['loa-am-thanh']),
      // this.genCameras(catMap['camera']),
      // this.genGaming(catMap['gaming']),
      // this.genSmartHome(catMap['smart-home']),
    ];

    let count = 0;
    for (const gen of generators) {
      for (const productData of gen) {
        await this.createProduct(productData);
        count++;
      }
    }
    console.log(`  📦 ${count} products seeded`);
  }

  private async createProduct(data: {
    name: string; slug: string; description: string; tagline: string;
    shortDescription: string; price: number; originalPrice?: number;
    images: string[]; stock: number; sold: number;
    specs: Record<string, string>; whatsInTheBox: string;
    category: Category; extraMetadata?: Record<string, any>;
    variants?: Partial<ProductVariant>[];
    tags?: string[];
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
      {
        name: 'iPhone 16 Pro', slug: 'iphone-16-pro',
        tagline: 'Titan. Hiệu năng. Đẳng cấp.', shortDescription: 'Chip A18 Pro — Hiệu năng vượt trội',
        price: 34990000, originalPrice: 37990000,
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
          'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600',
        ],
        stock: 45, sold: 312,
        description: `iPhone 16 Pro sở hữu khung titanium cao cấp với màn hình Super Retina XDR 6.3 inch, tần số quét ProMotion 120Hz cho trải nghiệm mượt mà. Chip A18 Pro với Neural Engine thế hệ mới xử lý AI nhanh hơn 40%, pin trâu hơn 4 giờ so với thế hệ trước. Camera Fusion 48MP kết hợp camera Ultra Wide 48MP chụp ảnh chuyên nghiệp với khả năng quay video Dolby Vision 4K 120fps. Nút Camera Control mới giúp truy cập nhanh các công cụ chụp ảnh.`,
        whatsInTheBox: 'iPhone 16 Pro, Cáp USB-C sang USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.3" Super Retina XDR, ProMotion 120Hz',
          'Chip': 'A18 Pro',
          'RAM': '8GB',
          'Dung lượng': '256GB / 512GB / 1TB',
          'Camera': '48MP Fusion + 48MP Ultra Wide + 5x Telephoto',
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
        extraMetadata: { badge: 'Bán chạy', searchKeywords: ['iphone 16 pro', 'apple flagship', 'pro model'] },
      },
      {
        name: 'iPhone 16 Pro Max', slug: 'iphone-16-pro-max',
        tagline: 'Lớn hơn. Mạnh hơn.', shortDescription: 'Màn hình 6.9 inch — Pin lâu nhất từng có',
        price: 39990000, originalPrice: 43990000,
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
        ],
        stock: 30, sold: 198,
        description: `iPhone 16 Pro Max mang đến màn hình Super Retina XDR 6.9 inch lớn nhất từng có trên iPhone. Viền mỏng hơn giúp thân máy nhỏ gọn hơn dù màn hình lớn hơn. Chip A18 Pro với GPU 6 lõi mới, ray tracing tăng tốc 2 lần cho trải nghiệm gaming đỉnh cao. Pin iPhone lớn nhất từng có — video lên đến 33 giờ. Camera Tele 5x với khả năng chụp từ xa siêu nét.`,
        whatsInTheBox: 'iPhone 16 Pro Max, Cáp USB-C, Tài liệu hướng dẫn',
        specs: {
          'Màn hình': '6.9" Super Retina XDR, ProMotion 120Hz',
          'Chip': 'A18 Pro',
          'RAM': '8GB',
          'Dung lượng': '256GB / 512GB / 1TB',
          'Camera': '48MP Fusion + 48MP Ultra Wide + 5x Telephoto',
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
        extraMetadata: { badge: 'Mới', searchKeywords: ['iphone 16 pro max', 'large screen', 'max'] },
      },
      {
        name: 'iPhone 16', slug: 'iphone-16',
        tagline: 'Hoàn toàn mới. Hoàn toàn iPhone.', shortDescription: 'Chip A18 — Camera 48MP — Nút Camera Control',
        price: 22990000, originalPrice: 24990000,
        images: [
          'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
        ],
        stock: 80, sold: 540,
        description: `iPhone 16 thế hệ mới với chip A18 mạnh mẽ, camera Fusion 48MP và camera Ultra Wide 12MP. Nút Camera Control hoàn toàn mới giúp chụp ảnh nhanh chóng. Dynamic Island trên màn hình 6.1 inch Super Retina XDR. Pin lâu hơn, sạc MagSafe nhanh hơn. iOS 18 mang đến Apple Intelligence — trợ lý AI thông minh nhất từ Apple.`,
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
        extraMetadata: { badge: 'Bán chạy', searchKeywords: ['iphone 16', 'new iphone', 'apple'] },
      },
      {
        name: 'iPhone 16 Plus', slug: 'iphone-16-plus',
        tagline: 'Màn hình lớn. Pin lâu.', shortDescription: '6.7 inch — Chip A18 — Camera 48MP',
        price: 28990000,
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
          'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600',
        ],
        stock: 50, sold: 220,
        description: `iPhone 16 Plus sở hữu màn hình 6.7 inch Super Retina XDR rộng rãi, hoàn hảo để xem phim, chơi game và làm việc. Chip A18 mạnh mẽ với Neural Engine 16 lõi hỗ trợ Apple Intelligence. Camera Fusion 48MP chụp ảnh đẹp trong mọi điều kiện. Pin trâu nhất trong lịch sử iPhone Plus.`,
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
        extraMetadata: { searchKeywords: ['iphone 16 plus', 'large iphone'] },
      },
      {
        name: 'iPhone 15', slug: 'iphone-15',
        tagline: 'Tính năng Pro. Giá iPhone.', shortDescription: 'Dynamic Island — Camera 48MP — USB-C',
        price: 19990000,
        images: [
          'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600',
        ],
        stock: 60, sold: 890,
        description: `iPhone 15 kế thừa nhiều tính năng từ dòng Pro với giá phải chăng hơn. Dynamic Island hiện đại, cổng USB-C tiện lợi, camera 48MP chụp ảnh xuất sắc. Chip A16 Bionic vẫn mạnh mẽ cho mọi tác vụ. Thiết kế nhôm cao cấp với mặt kính màu phủ cả mặt sau.`,
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
        extraMetadata: { badge: 'Tiết kiệm', searchKeywords: ['iphone 15', 'value iphone'] },
      },
      {
        name: 'iPhone 14', slug: 'iphone-14',
        tagline: 'Mạnh mẽ. Bền bỉ.', shortDescription: 'Chip A15 Bionic — Camera 12MP — Emergency SOS',
        price: 15990000,
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
        ],
        stock: 40, sold: 1200,
        description: `iPhone 14 với chip A15 Bionic mạnh mẽ, camera 12MP được nâng cấp với Photonic Engine cho ảnh thiếu sáng đẹp hơn. Tính năng Crash Detection và Emergency SOS qua vệ tinh mang đến sự an toàn tối đa. Pin trâu, thiết kế nhôm cao cấp chống nước IP68.`,
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
        ],
        extraMetadata: { searchKeywords: ['iphone 14', 'entry iphone'] },
      },
    ];
  }

  private genMacs(cat: Category) {
    return [
      {
        name: 'MacBook Air M4', slug: 'macbook-air-m4',
        tagline: 'Nhẹ. Nhanh. Không quạt.', shortDescription: 'Chip M4 — Mỏng 1.13cm — Pin 18 giờ',
        price: 27990000, originalPrice: 29990000,
        images: [
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600',
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
        ],
        stock: 35, sold: 256,
        description: `MacBook Air M4 mới nhất với chip Apple M4 — 10 lõi CPU, GPU 10 lõi, Neural Engine 38 lõi. Hiệu năng vượt trội, không quạt tản nhiệt, hoàn toàn im lặng. Màn hình Liquid Retina 13.6 inch sáng rõ, mỏng chỉ 1.13cm, nặng 1.24kg. Pin 18 giờ sử dụng liên tục. Hỗ trợ hai màn hình ngoài, Wi-Fi 6E, Bluetooth 5.3.`,
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
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 12 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 10 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 8 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 5 },
        ],
        extraMetadata: { badge: 'Mới', searchKeywords: ['macbook air', 'apple m4', 'thin laptop'] },
      },
      {
        name: 'MacBook Air 15" M4', slug: 'macbook-air-15-m4',
        tagline: 'Lớn hơn. Nhẹ hơn bao giờ hết.', shortDescription: 'Màn hình 15.3 inch — Chip M4 — Không quạt',
        price: 32990000,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
        stock: 20, sold: 145,
        description: `MacBook Air 15 inch với chip M4 mang đến không gian làm việc rộng rãi trong thiết kế mỏng nhẹ nhất thế giới cho laptop 15 inch — chỉ 1.51kg. 6 loa Spatial Audio, màn hình Liquid Retina sắc nét, pin 18 giờ.`,
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
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 7 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 7 },
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 6 },
        ],
        extraMetadata: { searchKeywords: ['macbook air 15', 'large screen macbook'] },
      },
      {
        name: 'MacBook Pro 14" M4 Pro', slug: 'macbook-pro-14-m4-pro',
        tagline: 'Chuyên nghiệp. Hiệu năng đỉnh cao.', shortDescription: 'M4 Pro — 48GB RAM — Liquid Retina XDR 120Hz',
        price: 52990000, originalPrice: 57990000,
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600',
        ],
        stock: 25, sold: 98,
        description: `MacBook Pro 14 inch với chip M4 Pro — 12 lõi CPU, GPU 16 lõi. Hiệu năng vượt trội cho developer, video editor, 3D artist. Màn hình Liquid Retina XDR 14.2 inch với ProMotion 120Hz, độ sáng HDR 1600 nits. Cổng HDMI, SD card, MagSafe 3, 3× Thunderbolt 5. Pin 20 giờ.`,
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
          { name: 'Màu sắc', value: 'Bạc', colorHex: '#e8e4df', stock: 12 },
          { name: 'Màu sắc', value: 'Xám', colorHex: '#86868b', stock: 13 },
        ],
        extraMetadata: { badge: 'Pro', searchKeywords: ['macbook pro 14', 'pro laptop', 'm4 pro'] },
      },
      {
        name: 'MacBook Pro 16" M4 Max', slug: 'macbook-pro-16-m4-max',
        tagline: 'Máy Mac mạnh nhất từng có.', shortDescription: 'M4 Max — 128GB RAM — Quản lý bộ nhớ 512GB/s',
        price: 89990000, originalPrice: 99990000,
        images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600'],
        stock: 12, sold: 45,
        description: `MacBook Pro 16 inch với chip M4 Max — 16 lõi CPU, GPU 40 lõi, Neural Engine 40 lõi. Hiệu năng khủng khiếp cho machine learning, video 8K, rendering 3D. Màn hình Liquid Retina XDR 16.2 inch, bộ nhớ hợp nhất 512GB/s. Pin 24 giờ — lâu nhất trên Mac.`,
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
        extraMetadata: { searchKeywords: ['macbook pro 16', 'm4 max', 'workstation'] },
      },
      {
        name: 'MacBook Pro 14" M3', slug: 'macbook-pro-14-m3',
        tagline: 'Pro cho mọi người.', shortDescription: 'Chip M3 — 18GB RAM — Liquid Retina XDR',
        price: 39990000,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
        stock: 30, sold: 189,
        description: `MacBook Pro 14 inch chip M3 — lựa chọn hoàn hảo cho sinh viên và chuyên gia. Hiệu năng mạnh mẽ với chip 3nm đầu tiên, GPU 10 lõi, hỗ trợ ray tracing tăng tốc.`,
        whatsInTheBox: 'MacBook Pro 14" M3, Adapter USB-C 70W, Cáp MagSafe 3',
        specs: {
          'Chip': 'Apple M3 (8-core CPU, 10-core GPU)',
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
        extraMetadata: { searchKeywords: ['macbook pro 14 m3', 'm3 laptop'] },
      },
      {
        name: 'Mac mini M4', slug: 'mac-mini-m4',
        tagline: 'Nhỏ gọn. Mạnh mẽ. Chiến binh.', shortDescription: 'Chip M4 Pro — Kích thước 12.7×12.7cm',
        price: 19990000, originalPrice: 21990000,
        images: ['https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600'],
        stock: 40, sold: 178,
        description: `Mac mini M4 Pro nhỏ gọn nhất từng có — chỉ 12.7×12.7×3.6cm. Chip M4 Pro 12 lõi, hỗ trợ tới 64GB RAM, 5 cổng Thunderbolt 4 phía trước. Hiệu năng ngang Mac Pro, tiết kiệm không gian tối đa.`,
        whatsInTheBox: 'Mac mini M4 Pro, Dây nguồn',
        specs: {
          'Chip': 'Apple M4 Pro (12-core CPU, 16-core GPU)',
          'RAM': '24GB / 48GB / 64GB',
          'SSD': '512GB / 1TB / 2TB / 4TB',
          'Cổng trước': '2× USB-C (Thunderbolt 4), Jack 3.5mm',
          'Cổng sau': '3× Thunderbolt 5, HDMI, Ethernet 10Gb',
          'Kết nối': 'Wi-Fi 6E, Bluetooth 5.3',
          'Trọng lượng': '0.67 kg',
        },
        category: cat,
        variants: [
          { name: 'RAM', value: '24GB', priceModifier: 0, stock: 15 },
          { name: 'RAM', value: '48GB', priceModifier: 8000000, stock: 10 },
          { name: 'RAM', value: '64GB', priceModifier: 16000000, stock: 5 },
          { name: 'SSD', value: '512GB', priceModifier: 0, stock: 12 },
          { name: 'SSD', value: '1TB', priceModifier: 6000000, stock: 10 },
          { name: 'SSD', value: '2TB', priceModifier: 12000000, stock: 8 },
        ],
        extraMetadata: { badge: 'Mới', searchKeywords: ['mac mini', 'compact mac', 'desktop'] },
      },
      {
        name: 'Mac Studio M4 Max', slug: 'mac-studio-m4-max',
        tagline: 'Siêu năng lực. Siêu nhỏ gọn.', shortDescription: 'M4 Max — 128GB RAM — 8 cổng Thunderbolt',
        price: 69990000,
        images: ['https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600'],
        stock: 15, sold: 67,
        description: `Mac Studio với M4 Max mang hiệu năng workstation vào khung máy nhỏ gọn 19.7cm vuông. 128GB unified memory, SSD tới 8TB, quạt hướng trục cho tản nhiệt hiệu quả.`,
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
        extraMetadata: { searchKeywords: ['mac studio', 'pro desktop', 'creator'] },
      },
      {
        name: 'iMac 24" M4', slug: 'imac-24-m4',
        tagline: 'Làm nhiều hơn. Màu sắc hơn.', shortDescription: 'M4 — Màn hình 4.5K — 7 màu sắc',
        price: 28990000, originalPrice: 30990000,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
        stock: 22, sold: 134,
        description: `iMac 24 inch với chip M4 — 8 lõi CPU, GPU 8 lõi. Màn hình Retina 4.5K 24 inch sắc nét, loa 6 tấm Spatial Audio, camera 12MP Center Stage. Bàn phím và chuột matching color. 7 lựa chọn màu sắc.`,
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
          { name: 'Màu sắc', value: 'Xanh Mướp', colorHex: '#a3c585', stock: 4 },
          { name: 'Màu sắc', value: 'Xanh Băng', colorHex: '#a7c7e7', stock: 4 },
          { name: 'Màu sắc', value: 'Hồng', colorHex: '#f8c8dc', stock: 4 },
          { name: 'Màu sắc', value: 'Cam', colorHex: '#ff8c69', stock: 4 },
          { name: 'Màu sắc', value: 'Vàng', colorHex: '#f5c518', stock: 4 },
          { name: 'Màu sắc', value: 'Tím', colorHex: '#9c7fc4', stock: 4 },
        ],
        extraMetadata: { badge: 'Mới', searchKeywords: ['imac', 'all in one', 'desktop'] },
      },
    ];
  }

  private genIPads(cat: Category) {
    return [
      {
        name: 'iPad Pro 13" M4', slug: 'ipad-pro-13-m4',
        tagline: 'Mỏng nhất Apple từng tạo.', shortDescription: 'Chip M4 — OLED Tandem — 5.1mm',
        price: 35990000, originalPrice: 38990000,
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'],
        stock: 30, sold: 156,
        description: `iPad Pro 13 inch M4 với màn hình OLED Tandem Ultra Retina XDR — độ sáng HDR 1600 nits. Chip M4 với CPU 9 lõi, GPU 10 lõi. Mỏng 5.1mm, nhẹ 579g. Hỗ trợ Apple Pencil Pro và Magic Keyboard. Face ID, USB-C Thunderbolt, Wi-Fi 6E.`,
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
        ],
        extraMetadata: { badge: 'Mới', searchKeywords: ['ipad pro 13', 'oled ipad', 'pro tablet'] },
      },
      {
        name: 'iPad Pro 11" M4', slug: 'ipad-pro-11-m4',
        tagline: 'Pro. Trong lòng bàn tay.', shortDescription: 'Chip M4 — OLED — 5.3mm mỏng',
        price: 29990000,
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'],
        stock: 35, sold: 210,
        description: `iPad Pro 11 inch M4 nhỏ gọn nhưng mạnh mẽ ngang ngửa phiên bản 13 inch. Màn hình OLED Tandem sáng rõ, chip M4 9 lõi. Thiết kế mỏng 5.3mm.`,
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
        ],
        extraMetadata: { searchKeywords: ['ipad pro 11', 'm4 ipad'] },
      },
      {
        name: 'iPad Air 13" M3', slug: 'ipad-air-13-m3',
        tagline: 'Mạnh mẽ. Nhẹ. Đa năng.', shortDescription: 'Chip M3 — 13 inch — Hỗ trợ Apple Pencil',
        price: 21990000,
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'],
        stock: 28, sold: 98,
        description: `iPad Air M3 với chip M3 8 lõi, GPU 9 lõi. Màn hình Liquid Retina 13 inch, hỗ trợ Apple Pencil Pro. Nhẹ 617g, mỏng 6.1mm.`,
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
        extraMetadata: { badge: 'Mới', searchKeywords: ['ipad air 13', 'm3 ipad'] },
      },
      {
        name: 'iPad Air 11" M3', slug: 'ipad-air-11-m3',
        tagline: 'Mạnh. Nhẹ. Hoàn hảo.', shortDescription: '11 inch — Chip M3 — Apple Pencil Pro',
        price: 17990000,
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'],
        stock: 32, sold: 145,
        description: `iPad Air 11 inch M3 nhỏ gọn, dễ mang theo. Chip M3 mạnh mẽ, màn hình Liquid Retina 11 inch sắc nét, hỗ trợ Apple Pencil Pro và Magic Keyboard.`,
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
        extraMetadata: { searchKeywords: ['ipad air 11', 'compact ipad'] },
      },
      {
        name: 'iPad mini A17 Pro', slug: 'ipad-mini',
        tagline: 'Nhỏ gọn. Đầy sức mạnh.', shortDescription: 'Chip A17 Pro — 8.3 inch — Apple Pencil USB-C',
        price: 14990000,
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'],
        stock: 25, sold: 167,
        description: `iPad mini A17 Pro nhỏ gọn trong lòng bàn tay với màn hình 8.3 inch Liquid Retina. Chip A17 Pro mới nhất, hỗ trợ Apple Pencil Pro. Touch ID, camera 12MP, USB-C.`,
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
        extraMetadata: { searchKeywords: ['ipad mini', 'small tablet', 'portable'] },
      },
    ];
  }

  private genWatches(cat: Category) {
    return [
      {
        name: 'Apple Watch Ultra 3', slug: 'apple-watch-ultra-3',
        tagline: 'Đỉnh cao thể thao. Vượt mọi giới hạn.', shortDescription: 'Titan Grade 5 — 49mm — GPS + Cellular',
        price: 24990000,
        images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600'],
        stock: 20, sold: 89,
        description: `Apple Watch Ultra 3 với khung titanium Grade 5, màn hình Sapphire 49mm sáng 3000 nits. GPS chính xác, Cellular tích hợp, pin 36 giờ. Chống nước 100m, hoàn hảo cho thợ lặn và thể thao mạo hiểm.`,
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
          'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600',
          'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=600',
        ],
        stock: 50, sold: 345,
        description: `Apple Watch Series 10 mỏng 9.7mm, nhẹ hơn. Màn hình OLED 46mm sáng nhất từng có, góc nhìn rộng. Chip S9 SiP, Double Tap, Siri on-device. Health features: ECG, Blood Oxygen, Sleep, Cycle. Chống nước 50m.`,
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
        images: ['https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=600'],
        stock: 60, sold: 520,
        description: `Apple Watch SE 2024 — lối vào hệ sinh thái Apple Watch với giá phải chăng. Chip S9 nhanh hơn, Crash Detection, Fall Detection, Activity rings, Heart Rate.`,
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
          'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600',
          'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600',
        ],
        stock: 70, sold: 612,
        description: `AirPods Pro 3 với chip H2 nâng cấp, Active Noise Cancellation gấp đôi, Transparency mode tự nhiên. Spatial Audio cá nhân hóa theo tai bạn. Pin 6 giờ, case sạc MagSafe USB-C. Chống bụi IP54.`,
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
        images: ['https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600'],
        stock: 80, sold: 890,
        description: `AirPods 4 thế hệ mới không có eartip — thiết kế thoải mái cho mọi tai. Chip H2, Spatial Audio, Voice Isolation. Pin 5 giờ. USB-C.`,
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
          'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600',
        ],
        stock: 30, sold: 234,
        description: `AirPods Max — tai nghe over-ear cao cấp với driver Apple 40mm tùy chỉnh. Active Noise Cancellation, Transparency mode, Spatial Audio với head tracking. Khung stainless steel, headband breathable knit. Pin 20 giờ.`,
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
          'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
        ],
        stock: 120, sold: 450,
        description: `Ốp lưng Silicon MagSafe chính hãng Apple cho iPhone 16 Pro. Được thiết kế ôm sát iPhone, gắn chặt vào MagSafe. Bên ngoài silicone mềm mại, bên trong lớp microfiber bảo vệ iPhone. 45% chất liệu tái chế.`,
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
        images: ['https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600'],
        stock: 80, sold: 320,
        description: `Ốp lưng trong suốt MagSafe cho iPhone 16 — khoe trọn vẹn thiết kế iPhone với lớp trong suốt, đồng thời bảo vệ khỏi trầy xước và va đập. Công nghệ chống ố vàng giữ độ trong lâu dài. Gắn MagSafe tiện lợi.`,
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
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'],
        stock: 40, sold: 178,
        description: `Magic Keyboard cho iPad Pro với cảm ứng lực 1mm, trackpad lớn với Haptic Feedback. Floating cantilever design — màn hình iPad nổi trên bàn phím. Cổng USB-C pass-through để sạc. Có đèn nền.`,
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
        images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'],
        stock: 60, sold: 234,
        description: `Apple Pencil Pro với barrel roll, haptic feedback khi xoay. Nút ngữ cảnh mới, Find My tích hợp. Tương thích iPad Pro M4 và iPad Air M3. Sạc không dây qua MagSafe.`,
        whatsInTheBox: 'Apple Pencil Pro',
        specs: {
          'Cảm biến': 'Áp suất,倾斜',
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
        images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'],
        stock: 90, sold: 567,
        description: `Magic Mouse 3 thế hệ mới với bề mặt Multi-Touch toàn diện, haptic feedback khi cuộn. Sạc USB-C, pin lithium-ion bên trong. Kết nối Bluetooth, hoạt động lên đến vài tháng.`,
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
        images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'],
        stock: 55, sold: 345,
        description: `Magic Keyboard với Touch ID — gõ thoải mái, đăng nhập Apple Pay và ứng dụng bằng vân tay. Cảm ứng lực 1mm cho cảm giác gõ chuyên nghiệp. Có đèn nền, sạc USB-C.`,
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
        images: ['https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600'],
        stock: 100, sold: 289,
        description: `Dây Đeo Chéo Apple — gắn vào ốp lưng MagSafe để mang iPhone thoải mái mà rảnh tay. silicone bền bỉ, nhiều màu sắc matching iPhone.`,
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
        images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'],
        stock: 75, sold: 412,
        description: `Bộ sạc MagSafe 15W cho iPhone — gắn từ tính, sạc không dây nhanh 15W. Thiết kế gập nhỏ gọn, USB-C. Tương thích AirPods MagSafe.`,
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
        images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'],
        stock: 150, sold: 1230,
        description: `AirTag — thiết bị tìm đồ Bluetooth. Precision Finding với U1 chip, loa tích hợp, thay pin CR2032 dễ dàng. Chống nước IP67. Kết nối Find My network — hàng triệu thiết bị Apple giúp tìm.`,
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
        images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'],
        stock: 45, sold: 198,
        description: `Adapter sạc 96W USB-C Power Delivery — sạc nhanh MacBook Pro 14"/16". Có 2 cổng USB-C — sạc MacBook và iPhone cùng lúc. Thiết kế nhỏ gọn.`,
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
        images: ['https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600'],
        stock: 40, sold: 234,
        description: `Apple TV 4K với chip A15 Bionic mạnh mẽ, hỗ trợ 4K Dolby Vision, HDR10+, Dolby Atmos. tvOS mang đến hàng ngàn ứng dụng, Apple TV+, AirPlay, HomeKit.`,
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
