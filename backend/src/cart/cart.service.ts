import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from '../products/product.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private itemRepo: Repository<CartItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async getCart(userId: string) {
    let cart = await this.cartRepo.findOne({ where: { user: { id: userId } } });
    if (!cart) {
      cart = this.cartRepo.create({ user: { id: userId } as any });
      await this.cartRepo.save(cart);
    }
    // Strip user password from cart response
    if (cart.user) {
      const { password, ...safeUser } = cart.user as any;
      cart = { ...cart, user: safeUser };
    }
    return { data: cart, success: true };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const cart = await this.cartRepo.findOne({ where: { user: { id: userId } } });
    if (!cart) throw new NotFoundException('Giỏ hàng không tồn tại');

    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    if (product.stock < dto.quantity) throw new BadRequestException('Sản phẩm không đủ hàng');

    // Check if item already in cart
    const existing = cart.items?.find(i => i.product?.id === dto.productId);
    if (existing) {
      existing.quantity += dto.quantity;
      await this.itemRepo.save(existing);
    } else {
      const item = this.itemRepo.create({ cart, product, quantity: dto.quantity, selectedVariant: dto.selectedVariant });
      await this.itemRepo.save(item);
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.itemRepo.findOne({ where: { id: itemId }, relations: ['cart', 'cart.user'] });
    if (!item || item.cart.user.id !== userId) throw new NotFoundException('Mục không tồn tại');
    item.quantity = dto.quantity;
    await this.itemRepo.save(item);
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.itemRepo.findOne({ where: { id: itemId }, relations: ['cart', 'cart.user'] });
    if (!item || item.cart.user.id !== userId) throw new NotFoundException('Mục không tồn tại');
    await this.itemRepo.delete(itemId);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepo.findOne({ where: { user: { id: userId } } });
    if (cart) await this.itemRepo.delete({ cart: { id: cart.id } });
    return { success: true, message: 'Đã xóa giỏ hàng' };
  }
}
