export interface User {
  id: string; email: string; name: string;
  phone?: string; address?: string;
  role: 'customer' | 'admin'; avatar?: string;
  createdAt: string;
}

export interface Category {
  id: string; name: string; slug: string;
  description?: string; image?: string;
}

export interface ProductVariant {
  id: string; name: string; value: string;
  priceModifier: number; stock: number; isActive: boolean;
  colorHex?: string;
}

export interface Product {
  id: string; name: string; slug: string;
  description: string; price: number; originalPrice?: number;
  images: string[]; stock: number; sold: number;
  isActive: boolean; specs: Record<string, string>;
  category: Category; averageRating?: string | null;
  reviewCount?: number; createdAt: string;
  variants?: ProductVariant[];
  tagline?: string;
  shortDescription?: string;
  featuredImage?: string;
  whatsInTheBox?: string;
  extraMetadata?: Record<string, any>;
}

export interface CartItem {
  id: string; product: Product;
  quantity: number; selectedVariant?: Record<string, string>;
}

export interface Cart { id: string; items: CartItem[]; }

export interface ShippingAddress { name: string; phone: string; address: string; city: string; }

export interface OrderItem {
  id: string; product?: Product;
  productName: string; productImage: string;
  price: number; quantity: number;
  selectedVariant?: Record<string, string>;
}

export interface Order {
  id: string; orderNumber: string; items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: string; paymentStatus: string;
  note?: string; user?: User;
  createdAt: string;
}

export interface Review {
  id: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  rating: number; comment: string; createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[]; total: number; page: number; limit: number;
}

export interface ApiResponse<T> { data: T; success: boolean; message?: string; }

export interface DashboardStats {
  totalRevenue: number; totalOrders: number;
  totalProducts: number; totalUsers: number;
  recentOrders: Order[];
  topProducts: (Product & { sold: number })[];
}
