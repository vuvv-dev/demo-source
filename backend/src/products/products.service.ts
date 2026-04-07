import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
import { Review } from '../reviews/review.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
  ) {}

  async findAll(query: QueryProductDto) {
    const { page = 1, limit = 12, search, categoryId, categorySlug, minPrice, maxPrice, sortBy = 'newest' } = query;
    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .where('p.isActive = :isActive', { isActive: true });

    if (search) qb.andWhere('p.name LIKE :search', { search: `%${search}%` });
    if (categoryId) qb.andWhere('c.id = :categoryId', { categoryId });
    if (categorySlug) qb.andWhere('c.slug = :categorySlug', { categorySlug });
    if (minPrice) qb.andWhere('p.price >= :minPrice', { minPrice });
    if (maxPrice) qb.andWhere('p.price <= :maxPrice', { maxPrice });

    const orderMap = {
      price_asc: { 'p.price': 'ASC' as const },
      price_desc: { 'p.price': 'DESC' as const },
      newest: { 'p.createdAt': 'DESC' as const },
      popular: { 'p.sold': 'DESC' as const },
    };
    const order = orderMap[sortBy] || orderMap.newest;
    Object.entries(order).forEach(([col, dir]) => qb.addOrderBy(col, dir));

    const [products, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();

    // Add average rating
    const data = await Promise.all(products.map(async (p) => {
      const { avg, count } = await this.reviewRepo
        .createQueryBuilder('r')
        .select('AVG(r.rating)', 'avg')
        .addSelect('COUNT(r.id)', 'count')
        .where('r.productId = :id', { id: p.id })
        .getRawOne();
      return { ...p, averageRating: avg ? parseFloat(avg).toFixed(1) : null, reviewCount: parseInt(count) };
    }));

    return { data, total, page: +page, limit: +limit, success: true };
  }

  async findOne(idOrSlug: string) {
    const product = await this.repo.findOne({
      where: [{ id: idOrSlug }, { slug: idOrSlug }],
      relations: ['reviews', 'reviews.user'],
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    const { avg, count } = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(r.id)', 'count')
      .where('r.productId = :id', { id: product.id })
      .getRawOne();

    return {
      data: { ...product, averageRating: avg ? parseFloat(avg).toFixed(1) : null, reviewCount: parseInt(count) },
      success: true,
    };
  }

  async create(dto: CreateProductDto) {
    const { categoryId, ...rest } = dto;
    const category = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    const product = this.repo.create({ ...rest, category });
    const data = await this.repo.save(product);
    return { data, success: true, message: 'Tạo sản phẩm thành công' };
  }

  async update(id: string, dto: Partial<CreateProductDto>) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    const { categoryId, ...rest } = dto;
    if (categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: categoryId } });
      if (category) product.category = category;
    }
    Object.assign(product, rest);
    const data = await this.repo.save(product);
    return { data, success: true };
  }

  async remove(id: string) {
    await this.repo.update(id, { isActive: false });
    return { success: true, message: 'Xóa sản phẩm thành công' };
  }

  async findAllAdmin(page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['category'],
      skip: (page - 1) * limit, take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }
}
