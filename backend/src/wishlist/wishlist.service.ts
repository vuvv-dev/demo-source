import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './wishlist.entity';

@Injectable()
export class WishlistService {
  constructor(@InjectRepository(Wishlist) private repo: Repository<Wishlist>) {}

  async findAll(userId: string) {
    const items = await this.repo.find({ where: { user: { id: userId } }, relations: ['product', 'product.category'] });
    return { data: items, total: items.length, success: true };
  }

  async add(userId: string, productId: string) {
    const exists = await this.repo.findOne({ where: { user: { id: userId }, product: { id: productId } } });
    if (exists) throw new ConflictException('Sản phẩm đã có trong danh sách yêu thích');
    const item = this.repo.create({ user: { id: userId } as any, product: { id: productId } as any });
    const data = await this.repo.save(item);
    return { data, success: true };
  }

  async remove(userId: string, productId: string) {
    const item = await this.repo.findOne({ where: { user: { id: userId }, product: { id: productId } } });
    if (!item) throw new NotFoundException('Sản phẩm không có trong danh sách yêu thích');
    await this.repo.remove(item);
    return { success: true, message: 'Đã xóa khỏi danh sách yêu thích' };
  }

  async isWishlisted(userId: string, productId: string) {
    const item = await this.repo.findOne({ where: { user: { id: userId }, product: { id: productId } } });
    return { data: !!item, success: true };
  }
}
