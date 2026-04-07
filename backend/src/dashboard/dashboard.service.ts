import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getStats() {
    const [orders, products, users] = await Promise.all([
      this.orderRepo.find(),
      this.productRepo.find(),
      this.userRepo.find(),
    ]);

    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + Number(o.totalAmount), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalUsers = users.filter(u => u.role === 'customer').length;

    const recentOrders = await this.orderRepo.find({ relations: ['user'], order: { createdAt: 'DESC' }, take: 10 });
    const topProducts = await this.productRepo.find({ order: { sold: 'DESC' }, take: 5 });

    // Strip passwords before returning
    const safeOrders = recentOrders.map(o => {
      const { password, ...safeUser } = o.user as any;
      return { ...o, user: safeUser };
    });

    return {
      data: { totalRevenue, totalOrders, totalProducts, totalUsers, recentOrders: safeOrders, topProducts },
      success: true,
    };
  }
}
