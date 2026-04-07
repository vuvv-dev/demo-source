import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(@InjectRepository(Review) private repo: Repository<Review>) {}

  async findByProduct(productId: string, page = 1, limit = 10) {
    const [data, total] = await this.repo.findAndCount({
      where: { product: { id: productId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit, take: limit,
    });
    return { data, total, page, limit };
  }

  async create(productId: string, userId: string, dto: CreateReviewDto) {
    const review = this.repo.create({ product: { id: productId } as any, user: { id: userId } as any, ...dto });
    const data = await this.repo.save(review);
    const saved = await this.repo.findOne({ where: { id: data.id }, relations: ['user'] });
    return { data: saved, success: true, message: 'Cảm ơn bạn đã đánh giá!' };
  }

  async remove(id: string) {
    const review = await this.repo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Đánh giá không tồn tại');
    await this.repo.delete(id);
    return { success: true, message: 'Xóa đánh giá thành công' };
  }
}
