import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../src/users/user.entity';
import { Category } from '../src/categories/category.entity';
import { Product } from '../src/products/product.entity';
import { Order } from '../src/orders/order.entity';
import { OrderItem } from '../src/orders/order-item.entity';
import { Cart } from '../src/cart/cart.entity';
import { CartItem } from '../src/cart/cart-item.entity';
import { Review } from '../src/reviews/review.entity';
import { ProductVariant } from '../src/products/product-variant.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/apple_store',
  entities: [User, Category, Product, ProductVariant, Order, OrderItem, Cart, CartItem, Review],
  synchronize: true,
  logging: false,
});

async function seed() {
  await dataSource.initialize();
  console.log('🔌 Database connected');

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const cartRepo = dataSource.getRepository(Cart);

  // --- Users ---
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const userHash = await bcrypt.hash('Test@123', 10);

  const admin = await userRepo.save({
    email: 'admin@apple-store.vn',
    password: adminHash,
    name: 'Store Admin',
    role: 'admin',
    phone: '0901234567',
  });

  const customer = await userRepo.save({
    email: 'customer@test.vn',
    password: userHash,
    name: 'Nguyễn Văn A',
    role: 'customer',
    phone: '0912345678',
    address: '123 Nguyễn Trãi, Quận 1, TP.HCM',
  });

  // Auto-create carts
  await cartRepo.save({ user: admin });
  await cartRepo.save({ user: customer });
  console.log('✅ Users seeded');

  // --- Categories ---
  const categories = [
    { name: 'iPhone', slug: 'iphone', description: 'Điện thoại thông minh Apple', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400' },
    { name: 'iPad', slug: 'ipad', description: 'Máy tính bảng Apple', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400' },
    { name: 'Mac', slug: 'mac', description: 'Máy tính xách tay và để bàn Apple', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400' },
    { name: 'AirPods', slug: 'airpods', description: 'Tai nghe không dây Apple', image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400' },
    { name: 'Apple Watch', slug: 'apple-watch', description: 'Đồng hồ thông minh Apple', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400' },
    { name: 'Phụ kiện', slug: 'phu-kien', description: 'Phụ kiện chính hãng Apple', image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400' },
  ];

  const savedCategories: Record<string, any> = {};
  for (const cat of categories) {
    const saved = await categoryRepo.save(categoryRepo.create(cat));
    savedCategories[cat.slug] = saved;
  }
  console.log('✅ Categories seeded');

  // --- Products ---
  const products = [
    // iPhone
    {
      name: 'iPhone 16 Pro Max', slug: 'iphone-16-pro-max',
      description: 'iPhone 16 Pro Max với chip A18 Pro, màn hình Super Retina XDR 6.9 inch, hệ thống camera Fusion 48MP, pin trâu nhất từ trước đến nay.',
      price: 39990000, originalPrice: 42990000, stock: 50, sold: 128,
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600'],
      categoryId: savedCategories['iphone'].id,
      specs: { 'Chip': 'A18 Pro', 'RAM': '8GB', 'Màn hình': '6.9 inch', 'Pin': '4.685 mAh', 'Camera': '48MP + 48MP + 12MP', 'SIM': 'nanoSIM + eSIM' },
    },
    {
      name: 'iPhone 16 Pro', slug: 'iphone-16-pro',
      description: 'iPhone 16 Pro với chip A18 Pro, màn hình 6.3 inch ProMotion 120Hz, camera 48MP, khung titanium cao cấp.',
      price: 34990000, originalPrice: 37990000, stock: 45, sold: 95,
      images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600'],
      categoryId: savedCategories['iphone'].id,
      specs: { 'Chip': 'A18 Pro', 'RAM': '8GB', 'Màn hình': '6.3 inch', 'Pin': '3.582 mAh', 'Camera': '48MP + 48MP + 12MP' },
    },
    {
      name: 'iPhone 16', slug: 'iphone-16',
      description: 'iPhone 16 với chip A18, Dynamic Island, camera Fusion 48MP, nút Camera Control tiện lợi.',
      price: 22990000, originalPrice: 24990000, stock: 80, sold: 210,
      images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600'],
      categoryId: savedCategories['iphone'].id,
      specs: { 'Chip': 'A18', 'RAM': '8GB', 'Màn hình': '6.1 inch', 'Pin': '3.561 mAh', 'Camera': '48MP + 12MP' },
    },
    {
      name: 'iPhone 15', slug: 'iphone-15',
      description: 'iPhone 15 với chip A16 Bionic, Dynamic Island, camera 48MP, cổng USB-C.',
      price: 18490000, originalPrice: 19990000, stock: 60, sold: 340,
      images: ['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600'],
      categoryId: savedCategories['iphone'].id,
      specs: { 'Chip': 'A16 Bionic', 'RAM': '6GB', 'Màn hình': '6.1 inch', 'Pin': '3.349 mAh', 'Camera': '48MP + 12MP' },
    },
    // iPad
    {
      name: 'iPad Pro M4', slug: 'ipad-pro-m4',
      description: 'iPad Pro M4 với chip Apple M4, màn hình Ultra Retina XDR, hỗ trợ Apple Pencil Pro và Magic Keyboard.',
      price: 32990000, originalPrice: 34990000, stock: 30, sold: 45,
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'],
      categoryId: savedCategories['ipad'].id,
      specs: { 'Chip': 'Apple M4', 'RAM': '16GB', 'Màn hình': '13 inch Ultra Retina XDR', 'Pin': '10 giờ', 'Bộ nhớ': '256GB - 2TB' },
    },
    {
      name: 'iPad Air M2', slug: 'ipad-air-m2',
      description: 'iPad Air M2 với chip M2, màn hình Liquid Retina 11 inch, hỗ trợ Apple Pencil Pro.',
      price: 18490000, originalPrice: 19990000, stock: 40, sold: 68,
      images: ['https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600'],
      categoryId: savedCategories['ipad'].id,
      specs: { 'Chip': 'Apple M2', 'RAM': '8GB', 'Màn hình': '11 inch Liquid Retina', 'Pin': '10 giờ', 'Bộ nhớ': '128GB - 1TB' },
    },
    {
      name: 'iPad mini', slug: 'ipad-mini',
      description: 'iPad mini A17 Pro nhỏ gọn với màn hình 8.3 inch, chip A17 Pro mạnh mẽ.',
      price: 14990000, originalPrice: 16490000, stock: 35, sold: 52,
      images: ['https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600'],
      categoryId: savedCategories['ipad'].id,
      specs: { 'Chip': 'A17 Pro', 'RAM': '8GB', 'Màn hình': '8.3 inch Liquid Retina', 'Pin': '10 giờ', 'Bộ nhớ': '128GB - 512GB' },
    },
    // Mac
    {
      name: 'MacBook Pro M4 Pro', slug: 'macbook-pro-m4-pro',
      description: 'MacBook Pro M4 Pro với chip M4 Pro, RAM 24GB, màn hình Liquid Retina XDR 14.2 inch.',
      price: 52990000, originalPrice: 57990000, stock: 20, sold: 32,
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
      categoryId: savedCategories['mac'].id,
      specs: { 'Chip': 'Apple M4 Pro', 'RAM': '24GB', 'SSD': '512GB', 'Màn hình': '14.2 inch Liquid Retina XDR', 'Pin': '22 giờ' },
    },
    {
      name: 'MacBook Air M3', slug: 'macbook-air-m3',
      description: 'MacBook Air M3 siêu mỏng nhẹ với chip M3, màn hình Liquid Retina 13.6 inch.',
      price: 28490000, originalPrice: 30990000, stock: 25, sold: 78,
      images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600'],
      categoryId: savedCategories['mac'].id,
      specs: { 'Chip': 'Apple M3', 'RAM': '16GB', 'SSD': '256GB', 'Màn hình': '13.6 inch Liquid Retina', 'Pin': '18 giờ' },
    },
    {
      name: 'Mac mini M4', slug: 'mac-mini-m4',
      description: 'Mac mini M4 nhỏ gọn với chip M4, RAM 16GB, SSD 256GB, cổng kết nối đầy đủ.',
      price: 19990000, originalPrice: 21990000, stock: 30, sold: 25,
      images: ['https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600'],
      categoryId: savedCategories['mac'].id,
      specs: { 'Chip': 'Apple M4', 'RAM': '16GB', 'SSD': '256GB', 'Cổng': '5x USB-C, HDMI, Ethernet', 'Kích thước': '12.7 x 12.7 cm' },
    },
    // AirPods
    {
      name: 'AirPods Pro 2', slug: 'airpods-pro-2',
      description: 'AirPods Pro 2 với chip H2, chống ồn chủ động, Spatial Audio, thời lượng pin 6 giờ.',
      price: 6990000, originalPrice: 7990000, stock: 100, sold: 450,
      images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600'],
      categoryId: savedCategories['airpods'].id,
      specs: { 'Chip': 'Apple H2', 'Pin': '6 giờ (30 giờ với hộp)', 'Chống nước': 'IPX4', 'Kết nối': 'Bluetooth 5.3', 'Tính năng': 'Chống ồn, Spatial Audio, Adaptive Audio' },
    },
    {
      name: 'AirPods 4', slug: 'airpods-4',
      description: 'AirPods 4 với chip H2, thiết kế mới thoải mái hơn, Spatial Audio, sạc USB-C.',
      price: 3990000, originalPrice: 4490000, stock: 80, sold: 320,
      images: ['https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600'],
      categoryId: savedCategories['airpods'].id,
      specs: { 'Chip': 'Apple H2', 'Pin': '5 giờ (30 giờ với hộp)', 'Chống nước': 'IP54', 'Kết nối': 'Bluetooth 5.3', 'Tính năng': 'Spatial Audio, Adaptive Audio' },
    },
    {
      name: 'AirPods Max', slug: 'airpods-max',
      description: 'AirPods Max tai nghe over-ear cao cấp với chip H1, chống ồn chủ động, Spatial Audio.',
      price: 13990000, originalPrice: 15990000, stock: 30, sold: 58,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
      categoryId: savedCategories['airpods'].id,
      specs: { 'Chip': 'Apple H1', 'Pin': '20 giờ', 'Chống nước': 'IPX4', 'Kết nối': 'Bluetooth 5.0', 'Tính năng': 'Chống ồn, Spatial Audio, Transparency' },
    },
    // Apple Watch
    {
      name: 'Apple Watch Series 10', slug: 'apple-watch-series-10',
      description: 'Apple Watch Series 10 với màn hình rộng hơn, chip S10, theo dõi sức khỏe toàn diện.',
      price: 11990000, originalPrice: 13490000, stock: 50, sold: 85,
      images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'],
      categoryId: savedCategories['apple-watch'].id,
      specs: { 'Chip': 'Apple S10', 'Màn hình': '46mm Always-On Retina', 'Pin': '18 giờ', 'Chống nước': '50m', 'Tính năng': 'ECG, SpO2, Sleep, Stress' },
    },
    {
      name: 'Apple Watch Ultra 2', slug: 'apple-watch-ultra-2',
      description: 'Apple Watch Ultra 2 cho athlete chuyên nghiệp, vỏ titanium, pin 36 giờ, GPS chính xác.',
      price: 24990000, originalPrice: 26990000, stock: 20, sold: 28,
      images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600'],
      categoryId: savedCategories['apple-watch'].id,
      specs: { 'Chip': 'Apple S9', 'Màn hình': '49mm Always-On Retina', 'Pin': '36 giờ (60 giờ tiết kiệm)', 'Chống nước': '100m', 'GPS': 'L1 + L5 precision' },
    },
    {
      name: 'Apple Watch SE', slug: 'apple-watch-se',
      description: 'Apple Watch SE giá rẻ với chip S8, theo dõi sức khỏe cơ bản, thiết kế thể thao.',
      price: 6990000, originalPrice: 7990000, stock: 45, sold: 120,
      images: ['https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=600'],
      categoryId: savedCategories['apple-watch'].id,
      specs: { 'Chip': 'Apple S8', 'Màn hình': '40mm Retina', 'Pin': '18 giờ', 'Chống nước': '50m', 'Tính năng': 'Fall Detection, Heart Rate' },
    },
    // Accessories
    {
      name: 'MagSafe Charger', slug: 'magsafe-charger',
      description: 'Sạc không dây MagSafe 15W cho iPhone, gắn từ tính chắc chắn, sạc nhanh.',
      price: 1490000, originalPrice: 1690000, stock: 200, sold: 580,
      images: ['https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=600'],
      categoryId: savedCategories['phu-kien'].id,
      specs: { 'Công suất': '15W', 'Kết nối': 'USB-C', 'Tương thích': 'iPhone 12 trở lên', 'Chiều dài': '1m' },
    },
    {
      name: 'Apple Pencil Pro', slug: 'apple-pencil-pro',
      description: 'Apple Pencil Pro cho iPad Pro/Air, cảm biến lực nhạy, phản hồi xúc giác, con quay hồi chuyển.',
      price: 3990000, originalPrice: 4490000, stock: 60, sold: 95,
      images: ['https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600'],
      categoryId: savedCategories['phu-kien'].id,
      specs: { 'Kết nối': 'USB-C', 'Pin': '12 giờ', 'Tương thích': 'iPad Pro M4, iPad Air M2', 'Tính năng': 'Haptic feedback, barrel roll, Find My' },
    },
    {
      name: 'Magic Keyboard', slug: 'magic-keyboard',
      description: 'Magic Keyboard với Touch ID, bàn phím số, thiết kế nhôm cao cấp cho Mac.',
      price: 7990000, originalPrice: 8990000, stock: 40, sold: 62,
      images: ['https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600'],
      categoryId: savedCategories['phu-kien'].id,
      specs: { 'Kết nối': 'Bluetooth + USB-C', 'Pin': '2 tháng', 'Tương thích': 'Mac, iPad', 'Tính năng': 'Touch ID, đèn nền' },
    },
  ];

  for (const p of products) {
    const cat = await categoryRepo.findOne({ where: { id: p.categoryId } });
    await productRepo.save(productRepo.create({ ...p, category: cat }));
  }
  console.log('✅ Products seeded');

  // --- Sample Reviews ---
  const reviewRepo = dataSource.getRepository(Review);
  const allProducts = await productRepo.find();
  for (const product of allProducts.slice(0, 8)) {
    const reviews = [
      { rating: 5, comment: 'Sản phẩm tuyệt vời, giao hàng nhanh, đóng gói cẩn thận! ⭐⭐⭐⭐⭐' },
      { rating: 5, comment: 'Đúng hàng Apple chính hãng, dùng rất mượt. Khuyên dùng!' },
      { rating: 4, comment: 'Sản phẩm tốt, nhưng giao hàng hơi chậm 1 ngày.' },
    ];
    for (const r of reviews) {
      await reviewRepo.save(reviewRepo.create({
        ...r,
        user: customer,
        product: product,
      }));
    }
  }
  console.log('✅ Reviews seeded');

  console.log('');
  console.log('🎉 Seed hoàn tất!');
  console.log('📧 Admin: admin@apple-store.vn / Admin@123');
  console.log('👤 Customer: customer@test.vn / Test@123');

  await dataSource.destroy();
}

seed().catch(console.error);
