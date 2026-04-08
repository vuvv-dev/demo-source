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
  const reviewRepo = dataSource.getRepository(Review);
  const variantRepo = dataSource.getRepository(ProductVariant);

  // Clear existing
  await reviewRepo.delete({});
  await dataSource.getRepository(OrderItem).delete({});
  await dataSource.getRepository(Order).delete({});
  await dataSource.getRepository(CartItem).delete({});
  await cartRepo.delete({});
  await variantRepo.delete({});
  await productRepo.delete({});
  await categoryRepo.delete({});

  // --- Users ---
  let admin = await userRepo.findOne({ where: { email: 'admin@apple-store.vn' } });
  if (!admin) {
    const adminHash = await bcrypt.hash('Admin@123', 10);
    admin = await userRepo.save({ email: 'admin@apple-store.vn', password: adminHash, name: 'Store Admin', role: 'admin', phone: '0901234567' });
    await cartRepo.save({ user: admin });
  }
  let customer = await userRepo.findOne({ where: { email: 'customer@test.vn' } });
  if (!customer) {
    const userHash = await bcrypt.hash('Test@123', 10);
    customer = await userRepo.save({ email: 'customer@test.vn', password: userHash, name: 'Nguyễn Văn A', role: 'customer', phone: '0912345678', address: '123 Nguyễn Trãi, Quận 1, TP.HCM' });
    await cartRepo.save({ user: customer });
  }

  // --- Categories ---
  const cats = [
    { name: 'iPhone', slug: 'iphone', description: 'Điện thoại thông minh của Apple' },
    { name: 'Mac', slug: 'mac', description: 'Máy tính xách tay và để bàn' },
    { name: 'iPad', slug: 'ipad', description: 'Máy tính bảng cho mọi nhu cầu' },
    { name: 'Apple Watch', slug: 'apple-watch', description: 'Đồng hồ thông minh hàng đầu' },
    { name: 'AirPods', slug: 'airpods', description: 'Trải nghiệm âm thanh không dây đỉnh cao' },
    { name: 'Vision', slug: 'vision', description: 'Kỷ nguyên điện toán không gian' },
    { name: 'Phụ kiện', slug: 'phu-kien', description: 'Ốp lưng, cáp, sạc và hơn thế nữa' },
  ];
  const savedCats: Record<string, Category> = {};
  for (const c of cats) {
    savedCats[c.slug] = await categoryRepo.save(categoryRepo.create({
      ...c,
      image: `https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400`,
      metadata: { theme: 'light', icon: c.slug }
    }));
  }

  // --- Massive Product Registry ---
  const allProducts: any[] = [
    // --- iPhones (30 items) ---
    { name: 'iPhone 17 Pro Max', slug: 'iphone-17-pro-max', price: 38990000, cat: 'iphone', tagline: 'Đỉnh cao công nghệ 2026.', img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', box: 'iPhone, Cáp USB-C', meta: { chip: 'A19 Pro', ram: '24GB' } },
    { name: 'iPhone 17 Pro', slug: 'iphone-17-pro', price: 33990000, cat: 'iphone', tagline: 'Sức mạnh Pro trong lòng bàn tay.', img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', box: 'iPhone, Cáp USB-C', meta: { chip: 'A19 Pro' } },
    { name: 'iPhone 17 Slim', slug: 'iphone-17-slim', price: 29990000, cat: 'iphone', tagline: 'Mỏng chưa từng thấy.', img: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800', box: 'iPhone, Cáp USB-C', meta: { style: 'Ultra Thin' } },
    { name: 'iPhone 17 Plus', slug: 'iphone-17-plus', price: 26990000, cat: 'iphone', tagline: 'Màn hình lớn, pin cực lâu.', img: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800', box: 'iPhone, Cáp USB-C' },
    { name: 'iPhone 17', slug: 'iphone-17', price: 23990000, cat: 'iphone', tagline: 'Màu sắc mới, trải nghiệm mới.', img: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800', box: 'iPhone, Cáp USB-C' },
    { name: 'iPhone 16 Pro Max', slug: 'iphone-16-pro-max', price: 31990000, cat: 'iphone', tagline: 'Kỷ nguyên AI bắt đầu.', img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', box: 'iPhone, Cáp USB-C', meta: { chip: 'A18 Pro' } },
    { name: 'iPhone 16 Pro', slug: 'iphone-16-pro', price: 28990000, cat: 'iphone', tagline: 'Sáng tạo không giới hạn.', img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800', box: 'iPhone, Cáp USB-C' },
    { name: 'iPhone 16 Plus', slug: 'iphone-16-plus', price: 22990000, cat: 'iphone', tagline: 'Sức mạnh trong tầm tay.', img: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800', box: 'iPhone, Cáp USB-C' },
    { name: 'iPhone 16', slug: 'iphone-16', price: 19990000, cat: 'iphone', tagline: 'Chiếc iPhone cho mọi người.', img: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800', box: 'iPhone, Cáp USB-C' },
    { name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', price: 26990000, cat: 'iphone', tagline: 'Titanium đầu tiên.', img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', box: 'iPhone, Cáp USB-C' },
    { name: 'iPhone 14 Pro Max', slug: 'iphone-14-pro-max', price: 21990000, cat: 'iphone', tagline: 'Dynamic Island đột phá.', img: 'https://images.unsplash.com/photo-1664478546384-d2b0abb68432?w=800' },
    { name: 'iPhone 13 Pro Max', slug: 'iphone-13-pro-max', price: 18990000, cat: 'iphone', tagline: 'Màn hình ProMotion mượt mà.', img: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800' },
    { name: 'iPhone 12 Pro Max', slug: 'iphone-12-pro-max', price: 15990000, cat: 'iphone', tagline: 'Thiết kế vuông vức cổ điển.', img: 'https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=800' },
    { name: 'iPhone 11 Pro Max', slug: 'iphone-11-pro-max', price: 11990000, cat: 'iphone', tagline: 'Cụm 3 camera huyền thoại.', img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800' },
    { name: 'iPhone 13 mini', slug: 'iphone-13-mini', price: 12990000, cat: 'iphone', tagline: 'Sức mạnh lớn, kích thước nhỏ.', img: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800' },
    { name: 'iPhone 12 mini', slug: 'iphone-12-mini', price: 9990000, cat: 'iphone', tagline: 'Siêu phẩm nhỏ gọn nhất.', img: 'https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=800' },
    { name: 'iPhone SE (Gen 3)', slug: 'iphone-se-3', price: 10490000, cat: 'iphone', tagline: 'Nội lực mạnh mẽ, ngoại hình cổ điển.', img: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800' },
    { name: 'iPhone 15', slug: 'iphone-15', price: 17490000, cat: 'iphone', tagline: 'Màu sắc pastel rạng rỡ.', img: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800' },
    { name: 'iPhone 14', slug: 'iphone-14', price: 14490000, cat: 'iphone', tagline: 'Ổn định, bền bỉ.', img: 'https://images.unsplash.com/photo-1664478546384-d2b0abb68432?w=800' },
    { name: 'iPhone 13', slug: 'iphone-13', price: 12490000, cat: 'iphone', tagline: 'Giá trị vượt thời gian.', img: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800' },
    { name: 'iPhone 12', slug: 'iphone-12', price: 10490000, cat: 'iphone', tagline: 'Công nghệ 5G đời đầu.', img: 'https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=800' },
    { name: 'iPhone 11', slug: 'iphone-11', price: 8490000, cat: 'iphone', tagline: 'Vẫn tuyệt vời cho nhu cầu cơ bản.', img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800' },
    // Variations
    { name: 'iPhone 17 Pro Max 1TB', slug: 'iphone-17-pm-1tb', price: 46990000, cat: 'iphone', tagline: 'Dung lượng cực đại.' },
    { name: 'iPhone 17 Pro 512GB', slug: 'iphone-17-p-512', price: 38990000, cat: 'iphone', tagline: 'Lưu trữ Pro.' },
    { name: 'iPhone 16 Pro Max (Refurbished)', slug: 'iphone-16-pm-ref', price: 27990000, cat: 'iphone', tagline: 'Như mới, giá tốt hơn.' },
    { name: 'iPhone 15 Pro (Certified)', slug: 'iphone-15-p-cert', price: 22990000, cat: 'iphone', tagline: 'Sự lựa chọn thông minh.' },
    { name: 'iPhone XR (Heritage)', slug: 'iphone-xr-heritage', price: 5990000, cat: 'iphone', tagline: 'Màu sắc rực rỡ một thời.', img: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=800' },

    // --- Macs (25 items) ---
    { name: 'MacBook Pro 16" M5 Max', slug: 'mbp-16-m5-max', price: 94990000, cat: 'mac', tagline: 'Mạnh mẽ nhất thế giới.', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', meta: { chip: 'M5 Max', ram: '48GB' } },
    { name: 'MacBook Pro 14" M5 Pro', slug: 'mbp-14-m5-pro', price: 54990000, cat: 'mac', tagline: 'Sự cân bằng hoàn hảo.', img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', meta: { chip: 'M5 Pro' } },
    { name: 'MacBook Pro 16" M4 Max', slug: 'mbp-16-m4-max', price: 84990000, cat: 'mac', tagline: 'Hiệu suất AI khủng.', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800' },
    { name: 'MacBook Pro 14" M4 Pro', slug: 'mbp-14-m4-pro', price: 48990000, cat: 'mac', tagline: 'Sẵn sàng cho tương lai.', img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800' },
    { name: 'MacBook Air 15" M3', slug: 'mba-15-m3', price: 32990000, cat: 'mac', tagline: 'Màn hình lớn, siêu mỏng.', img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800' },
    { name: 'MacBook Air 13" M3', slug: 'mba-13-m3', price: 26990000, cat: 'mac', tagline: 'Máy tính yêu thích của mọi người.', img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800' },
    { name: 'MacBook Air 13" M2', slug: 'mba-13-m2', price: 22990000, cat: 'mac', tagline: 'Thiết kế mới, sức mạnh mới.', img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800' },
    { name: 'MacBook Air 13" M1', slug: 'mba-13-m1', price: 18490000, cat: 'mac', tagline: 'Kỷ nguyên Apple Silicon bắt đầu.', img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800' },
    { name: 'MacBook Pro (Intel Core i9)', slug: 'mbp-intel-i9', price: 25990000, cat: 'mac', tagline: 'Dành cho ai cần chạy Windows.', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800' },
    { name: 'iMac 24" M4', slug: 'imac-24-m4', price: 34990000, cat: 'mac', tagline: 'Màu rực rỡ, chip siêu nhanh.', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800' },
    { name: 'iMac 24" M3', slug: 'imac-24-m3', price: 29990000, cat: 'mac', tagline: 'Trạm làm việc All-in-one.', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800' },
    { name: 'Mac Studio M2 Ultra', slug: 'mac-studio-m2-ultra', price: 109990000, cat: 'mac', tagline: 'Điểm đến của các chuyên gia.', img: 'https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?w=800' },
    { name: 'Mac mini M4', slug: 'mac-mini-m4', price: 16990000, cat: 'mac', tagline: 'Nhỏ nhưng cực có võ.', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800' },
    { name: 'Mac Pro M2 Ultra', slug: 'mac-pro-m2-ultra', price: 179990000, cat: 'mac', tagline: 'Khả năng mở rộng vô hạn.', img: 'https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?w=800' },
    { name: 'MacBook Pro 16" M5 Pro', slug: 'mbp-16-m5-pro', price: 69990000, cat: 'mac', tagline: 'Màn hình lớn cho công việc Pro.' },
    { name: 'MacBook Pro 14" M5 Base', slug: 'mbp-14-m5-base', price: 42990000, cat: 'mac', tagline: 'Bản nhập môn của dòng Pro.' },
    { name: 'Mac Studio M5 Max', slug: 'mac-studio-m5-max', price: 54990000, cat: 'mac', tagline: 'Sức mạnh mới trên bàn làm việc.' },
    { name: 'Mac Studio M5 Ultra', slug: 'mac-studio-m5-ultra', price: 124990000, cat: 'mac', tagline: 'Đỉnh cao máy tính để bàn.' },
    { name: 'Mac mini M4 Pro', slug: 'mac-mini-m4-pro', price: 34990000, cat: 'mac', tagline: 'Destktop mini mạnh mẽ.' },
    { name: 'iMac Pro (Legacy)', slug: 'imac-pro-legacy', price: 49990000, cat: 'mac', tagline: 'Màu xám không gian quyền lực.', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800' },

    // --- iPads (15 items) ---
    { name: 'iPad Pro 13" M5', slug: 'ip-pro-13-m5', price: 36990000, cat: 'ipad', tagline: 'Mỏng kỷ lục, chip siêu khủng.', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', meta: { display: 'OLED Gen 2' } },
    { name: 'iPad Pro 11" M5', slug: 'ip-pro-11-m5', price: 28990000, cat: 'ipad', tagline: 'Gọn nhẹ, hiệu năng cao.', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800' },
    { name: 'iPad Pro 13" M4', slug: 'ip-pro-13-m4', price: 32990000, cat: 'ipad', tagline: 'Siêu mỏng 5.1mm.', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800' },
    { name: 'iPad Air 13" M2', slug: 'ip-air-13-m2', price: 22490000, cat: 'ipad', tagline: 'Màn hình lớn cho mọi nhà.', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800' },
    { name: 'iPad Air 11" M2', slug: 'ip-air-11-m2', price: 16990000, cat: 'ipad', tagline: 'Mạnh mẽ và đầy màu sắc.', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800' },
    { name: 'iPad mini (Gen 7)', slug: 'ip-mini-7', price: 13990000, cat: 'ipad', tagline: 'Mạnh mẽ trong lòng bàn tay.', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800' },
    { name: 'iPad mini (Gen 6)', slug: 'ip-mini-6', price: 12490000, cat: 'ipad' },
    { name: 'iPad (Gen 10)', slug: 'ip-10', price: 9490000, cat: 'ipad', tagline: 'Thiết kế mới rực rỡ.', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800' },
    { name: 'iPad (Gen 9)', slug: 'ip-9', price: 7490000, cat: 'ipad', tagline: 'Giá trị tốt nhất cho giáo dục.', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800' },

    // --- Apple Watches (15 items) ---
    { name: 'Apple Watch Ultra 3', slug: 'aw-ultra-3', price: 23990000, cat: 'apple-watch', tagline: 'Phưu lưu không giới hạn.', img: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800', meta: { battery: '72h' } },
    { name: 'Apple Watch Series 11', slug: 'aw-s11', price: 12490000, cat: 'apple-watch', tagline: 'Kỷ nguyên sức khỏe mới.', img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800' },
    { name: 'Apple Watch Series 10', slug: 'aw-s10', price: 10990000, cat: 'apple-watch', tagline: 'Mỏng hơn đáng kể.', img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800' },
    { name: 'Apple Watch Ultra 2', slug: 'aw-ultra-2', price: 19990000, cat: 'apple-watch', tagline: 'Sáng nhất, cứng nhất.', img: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800' },
    { name: 'Apple Watch SE (Gen 3)', slug: 'aw-se-3', price: 7490000, cat: 'apple-watch', tagline: 'Đủ dùng, cực yêu.' },
    { name: 'Apple Watch Series 9 (Ref)', slug: 'aw-s9-ref', price: 7990000, cat: 'apple-watch' },
    { name: 'Apple Watch Hermes Series 11', slug: 'aw-hermes-11', price: 34990000, cat: 'apple-watch', tagline: 'Đẳng cấp và xa xỉ.' },

    // --- Vision (5 items) ---
    { name: 'Apple Vision Pro 2', slug: 'vision-pro-2', price: 99990000, cat: 'vision', tagline: 'Kỷ nguyên điện toán không gian.', img: 'https://images.unsplash.com/photo-1707064434175-12b73379204b?w=800' },
    { name: 'Apple Vision', slug: 'vision-standard', price: 54990000, cat: 'vision', tagline: 'Mang thực tế ảo đến mọi nhà.', img: 'https://images.unsplash.com/photo-1632733711679-5292d6e4922f?w=800' },

    // --- AirPods (10 items) ---
    { name: 'AirPods Pro 3', slug: 'ap-pro-3', price: 6990000, cat: 'airpods', tagline: 'Chống ồn cải tiến vượt bậc.', img: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800' },
    { name: 'AirPods Max 2', slug: 'ap-max-2', price: 15490000, cat: 'airpods', tagline: 'Màu mới, âm thanh mới.', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' },
    { name: 'AirPods (Gen 4)', slug: 'ap-4', price: 3990000, cat: 'airpods', tagline: 'Thiết kế mới cho mọi tai.' },
    { name: 'AirPods Pro 2', slug: 'ap-pro-2', price: 5990000, cat: 'airpods' },

    // --- Accessories (40 items) ---
    { 
      name: 'Ốp Lưng Silicon MagSafe iPhone 17 - Ối Đào', 
      slug: 'case-silicon-17-peach', 
      price: 1390000, 
      cat: 'phu-kien', 
      tagline: 'Gắn vào. Khoe ra.', 
      img: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MA7E4?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1723930438344',
      box: 'Ốp Lưng Silicon MagSafe cho iPhone 17',
      hasColors: true,
      meta: {
        compatibility: ['iPhone 17'],
        bannerCopy: 'Lớp vỏ ngoài bằng silicon mềm mại, mượt mà tạo cảm giác tuyệt vời khi cầm trên tay. Ở bên nội thất, lớp lót sợi siêu mịn giúp bảo vệ iPhone tốt hơn.',
        bannerImg: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-silicone-case-with-magsafe-plum-lifestyle-202409?wid=1000&hei=1000&fmt=jpeg&qlt=90&.v=1723930432549'
      }
    },
    { name: 'Ốp Lưng FineWoven iPhone 17 Pro Max', slug: 'case-fine-17pm', price: 1690000, cat: 'phu-kien', tagline: 'Vải dệt cao cấp.', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800' },
    { name: 'Dây đeo Ocean Apple Watch', slug: 'strap-ocean', price: 2490000, cat: 'phu-kien', tagline: 'Cho những chuyến lặn biển.' },
    { name: 'Dây đeo Alpine Loop', slug: 'strap-alpine', price: 2490000, cat: 'phu-kien' },
    { name: 'Sạc MagSafe (Gen 3)', slug: 'magsafe-charger-3', price: 1290000, cat: 'phu-kien', tagline: 'Sạc không dây nhanh chóng.' },
    { name: 'Cáp USB-C sang MagSafe 3 (2m)', slug: 'magsafe-cable-2m', price: 1390000, cat: 'phu-kien' },
    { name: 'Apple Pencil Pro', slug: 'pencil-pro', price: 3490000, cat: 'phu-kien', tagline: 'Ma thuật cho iPad.' },
    { name: 'Magic Keyboard cho iPad Pro 13"', slug: 'magic-kb-13', price: 9990000, cat: 'phu-kien' },
    { name: 'AirTag (4 packs)', slug: 'airtag-4p', price: 2990000, cat: 'phu-kien', tagline: 'Không bao giờ lo lạc mất.' },
    { name: 'Sạc 20W USB-C', slug: 'adapter-20w', price: 590000, cat: 'phu-kien' },
    { name: 'Sạc 35W Cổng Cép', slug: 'adapter-35w', price: 1590000, cat: 'phu-kien' },
    { name: 'Dây sạc Watch từ tính', slug: 'watch-cable', price: 890000, cat: 'phu-kien' },
    // Fillers to reach 100+
    ...Array.from({ length: 30 }).map((_, i) => ({
      name: `Phụ kiện Apple #${i + 1}`,
      slug: `acc-filler-${i}`,
      price: (Math.floor(Math.random() * 20) + 5) * 100000,
      cat: 'phu-kien',
      tagline: 'Phụ kiện chính hãng chất lượng cao.'
    }))
  ];

  // --- Bulk Insertion ---
  console.log('🚀 Starting bulk product insertion...');
  for (let i = 0; i < allProducts.length; i++) {
    const p = allProducts[i];
    const product = await productRepo.save(productRepo.create({
      name: p.name,
      slug: p.slug,
      description: p.tagline ? `${p.name}. ${p.tagline} Trải nghiệm Apple chính hãng tại Store.` : `${p.name}. Sản phẩm Apple chính hãng.`,
      price: p.price || 1000000,
      originalPrice: (p.price || 1000000) * 1.1,
      stock: Math.floor(Math.random() * 100) + 10,
      sold: Math.floor(Math.random() * 500),
      images: [p.img || 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800'],
      tagline: p.tagline || 'Sắc sảo. Sang trọng.',
      featuredImage: p.img || 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=1200',
      whatsInTheBox: p.box || 'Thân máy, Sách hướng dẫn, Cáp sạc USB-C',
      extraMetadata: p.meta || { type: 'Apple Genuine' },
      category: savedCats[p.cat]
    }));

    // Variants for cases or high-end products
    if (p.hasColors || i % 10 === 0) {
      const colors = ['Trắng', 'Đen', 'Xám', 'Vàng', 'Hồng', 'Blue', 'Purple'];
      for (const color of colors.slice(0, 4)) {
        await variantRepo.save(variantRepo.create({ product, name: 'Màu sắc', value: color, priceModifier: 0, stock: 20 }));
      }
    }
  }

  // --- Random Reviews (300 items) ---
  console.log('✍️ Generating reviews...');
  const products = await productRepo.find();
  const comments = [
    'Sản phẩm tuyệt vời!', 'Giao hàng nhanh, đóng gói kỹ.', 'Rất đáng mua.', 'Thiết kế đẹp, cầm rất sướng.', 
    'Đúng chuẩn Apple.', 'Tuyệt phẩm cho công việc.', 'Pin trâu, dùng cả ngày không hết.', 'Màn hình hiển thị cực sắc nét.'
  ];
  for (let i = 0; i < 300; i++) {
    const p = products[Math.floor(Math.random() * products.length)];
    await reviewRepo.save(reviewRepo.create({
      rating: Math.floor(Math.random() * 2) + 4,
      comment: comments[Math.floor(Math.random() * comments.length)],
      user: customer,
      product: p
    }));
  }

  console.log(`\n🎉 SEED COMPLETE!`);
  console.log(`📱 Products: ${allProducts.length}`);
  console.log(`✍️ Reviews: 300`);
  console.log(`📧 Admin: admin@apple-store.vn / Admin@123`);
  await dataSource.destroy();
}

seed().catch(console.error);
