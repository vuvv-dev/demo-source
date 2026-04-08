import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { Category } from '../categories/category.entity';
import { Review } from '../reviews/review.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    @InjectRepository(ProductVariant) private variantRepo: Repository<ProductVariant>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
  ) {}

  async findAll(query: QueryProductDto) {
    const { page = 1, limit = 12, search, categoryId, categorySlug, minPrice, maxPrice, sortBy = 'newest' } = query;

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .where('p.isActive = :isActive', { isActive: true });

    if (search) qb.andWhere('p.name LIKE :search', { search: `%${search}%` });
    if (categoryId) qb.andWhere('c.id = :categoryId', { categoryId });
    if (categorySlug) qb.andWhere('c.slug = :categorySlug', { categorySlug });
    if (minPrice) qb.andWhere('p.price >= :minPrice', { minPrice });
    if (maxPrice) qb.andWhere('p.price <= :maxPrice', { maxPrice });

    const orderMap: Record<string, Record<string, 'ASC' | 'DESC'>> = {
      price_asc: { 'p.price': 'ASC' },
      price_desc: { 'p.price': 'DESC' },
      newest: { 'p.createdAt': 'DESC' },
      popular: { 'p.sold': 'DESC' },
    };
    const order = orderMap[sortBy] || orderMap.newest;
    Object.entries(order).forEach(([col, dir]) => qb.addOrderBy(col, dir));

    const [products, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (products.length === 0) {
      return { data: [], total, page: +page, limit: +limit, success: true };
    }

    const ids = products.map((p) => p.id);
    const ratingResults = await this.reviewRepo
      .createQueryBuilder('r')
      .select('r.productId', 'productId')
      .addSelect('AVG(r.rating)', 'avgRating')
      .addSelect('COUNT(r.id)', 'reviewCount')
      .where('r.productId IN (:...ids)', { ids })
      .groupBy('r.productId')
      .getRawMany();

    const ratingMap = new Map<string, { avgRating: string; reviewCount: string }>(
      ratingResults.map((r: any) => [r.productId, r]),
    );

    const data = products.map((p: any) => {
      const r = ratingMap.get(p.id);
      return {
        ...p,
        averageRating: r ? parseFloat(parseFloat(r.avgRating).toFixed(1)) : null,
        reviewCount: r ? parseInt(String(r.reviewCount)) : 0,
      };
    });

    return { data, total, page: +page, limit: +limit, success: true };
  }

  async findOne(idOrSlug: string) {
    try {
      const product = await this.repo.findOne({
        where: [{ id: idOrSlug }, { slug: idOrSlug }],
        relations: ['reviews', 'reviews.user', 'variants'],
      });
      if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

      const ratingResult = await this.reviewRepo
        .createQueryBuilder('r')
        .select('AVG(r.rating)', 'avgRating')
        .addSelect('COUNT(r.id)', 'reviewCount')
        .where('r.productId = :id', { id: product.id })
        .getRawOne();

      const avgRating = ratingResult?.avgRating
        ? parseFloat(parseFloat(ratingResult.avgRating).toFixed(1))
        : null;
      const reviewCount = ratingResult?.reviewCount
        ? parseInt(String(ratingResult.reviewCount))
        : 0;

      // Return plain object to avoid TypeORM entity proxy issues
      const data = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        originalPrice: product.originalPrice != null ? Number(product.originalPrice) : null,
        images: product.images,
        stock: product.stock,
        sold: product.sold,
        isActive: product.isActive,
        specs: product.specs,
        tagline: product.tagline,
        featuredImage: product.featuredImage,
        whatsInTheBox: product.whatsInTheBox,
        extraMetadata: product.extraMetadata,
        category: product.category,
        variants: product.variants,
        averageRating: avgRating,
        reviewCount,
        createdAt: product.createdAt,
      };

      return { data, success: true };
    } catch (err) {
      console.error('[findOne] error:', err);
      throw err;
    }
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

  // ─── Variant CRUD ────────────────────────────────────────────────────────
  async createVariant(productId: string, dto: { name: string; value: string; priceModifier?: number; stock?: number }) {
    const product = await this.repo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    const variant = this.variantRepo.create({ ...dto, product });
    const data = await this.variantRepo.save(variant);
    return { data, success: true };
  }

  async updateVariant(variantId: string, dto: { name?: string; value?: string; priceModifier?: number; stock?: number; isActive?: boolean }) {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Biến thể không tồn tại');
    Object.assign(variant, dto);
    const data = await this.variantRepo.save(variant);
    return { data, success: true };
  }

  async deleteVariant(variantId: string) {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Biến thể không tồn tại');
    await this.variantRepo.remove(variant);
    return { success: true, message: 'Đã xóa biến thể' };
  }
}
