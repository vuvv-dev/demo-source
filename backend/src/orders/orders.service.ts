import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Cart } from '../cart/cart.entity';
import { CartItem } from '../cart/cart-item.entity';
import { Product } from '../products/product.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `APL-${dateStr}-${rand}`;
  }

  async create(userId: string, dto: CreateOrderDto) {
    const cart = await this.cartRepo.findOne({ where: { user: { id: userId } } });
    if (!cart || !cart.items?.length) throw new BadRequestException('Giỏ hàng trống');

    let totalAmount = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of cart.items) {
      const product = await this.productRepo.findOne({ where: { id: item.product.id } });
      if (!product) throw new NotFoundException(`Sản phẩm không tồn tại`);
      if (product.stock < item.quantity) throw new BadRequestException(`${product.name} không đủ hàng`);

      totalAmount += Number(product.price) * item.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || '',
        price: product.price,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant,
      });

      await this.productRepo.update(product.id, { stock: product.stock - item.quantity, sold: product.sold + item.quantity });
    }

    const order = this.orderRepo.create({
      orderNumber: this.generateOrderNumber(),
      user: { id: userId } as any,
      totalAmount,
      shippingAddress: dto.shippingAddress,
      paymentMethod: dto.paymentMethod,
      note: dto.note,
    });
    const saved = await this.orderRepo.save(order);

    for (const item of orderItems) {
      await this.orderItemRepo.save({ ...item, order: saved });
    }

    await this.cartItemRepo.delete({ cart: { id: cart.id } });

    return { data: await this.findOne(saved.id, userId), success: true, message: 'Đặt hàng thành công' };
  }

  async findAll(userId: string, isAdmin: boolean, page = 1, limit = 10, status?: string) {
    const qb = this.orderRepo.createQueryBuilder('o')
      .leftJoinAndSelect('o.user', 'u')
      .leftJoinAndSelect('o.items', 'i')
      .orderBy('o.createdAt', 'DESC');

    if (!isAdmin) qb.where('u.id = :userId', { userId });
    if (status) qb.andWhere('o.status = :status', { status });

    const [data, total] = await qb.skip((page-1)*limit).take(limit).getManyAndCount();
    const safeData = data.map(o => {
      const { password, ...safeUser } = o.user as any;
      return { ...o, user: safeUser };
    });
    return { data: safeData, total, page, limit };
  }

  async findOne(id: string, userId?: string) {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['user', 'items'] });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (userId && order.user.id !== userId) throw new NotFoundException('Đơn hàng không tồn tại');
    // Strip password before returning to avoid leaking
    const { password, ...safeUser } = order.user as any;
    return { ...order, user: safeUser };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    await this.orderRepo.update(id, { status: dto.status, ...(dto.paymentStatus && { paymentStatus: dto.paymentStatus }) });
    return { data: await this.findOne(id), success: true };
  }

  async cancel(id: string, userId: string) {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['user', 'items'] });
    if (!order || order.user.id !== userId) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.status !== 'pending') throw new BadRequestException('Chỉ có thể hủy đơn hàng đang chờ xử lý');
    await this.orderRepo.update(id, { status: 'cancelled' });
    for (const item of order.items) {
      await this.productRepo.increment({ id: item.productId }, 'stock', item.quantity);
      await this.productRepo.decrement({ id: item.productId }, 'sold', item.quantity);
    }
    return { success: true, message: 'Hủy đơn hàng thành công' };
  }
}
