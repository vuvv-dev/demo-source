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
    const {
      page = 1,
      limit = 12,
      search,
      categoryId,
      categorySlug,
      minPrice,
      maxPrice,
      sortBy = 'popular',
      order = 'desc',
      minRating,
      inStock = 'all',
    } = query;

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoin('p.reviews', 'r')
      .groupBy('p.id')
      .addGroupBy('c.id')
      .where('p.isActive = :isActive', { isActive: true });

    // ── Full-text search: name, description, tagline
    if (search) {
      const keyword = `%${search}%`;
      qb.andWhere(
        `(p.name ILIKE :kw OR p.description ILIKE :kw OR p.tagline ILIKE :kw)`,
        { kw: keyword },
      );
    }

    // Category filter
    if (categoryId) qb.andWhere('c.id = :categoryId', { categoryId });
    if (categorySlug) qb.andWhere('c.slug = :categorySlug', { categorySlug });

    // Price range
    if (minPrice != null) qb.andWhere('p.price >= :minPrice', { minPrice });
    if (maxPrice != null) qb.andWhere('p.price <= :maxPrice', { maxPrice });

    // Stock filter
    if (inStock === 'in_stock') qb.andWhere('p.stock > 0');
    else if (inStock === 'out_of_stock') qb.andWhere('p.stock <= 0');

    // ── Sort — rating/sold/newest use JS post-sort after ratingMap is built
    const dir: 'ASC' | 'DESC' = order === 'asc' ? 'ASC' : 'DESC';

    switch (sortBy) {
      case 'price_asc':
        qb.orderBy('p.price', 'ASC').addOrderBy('p.createdAt', 'DESC');
        break;
      case 'price_desc':
        qb.orderBy('p.price', 'DESC').addOrderBy('p.createdAt', 'DESC');
        break;
      case 'newest':
        qb.orderBy('p.createdAt', dir).addOrderBy('p.name', 'ASC');
        break;
      case 'rating':
        // Sort after ratingMap is available (see post-processing below)
        break;
      case 'sold':
        qb.orderBy('p.sold', dir).addOrderBy('p.name', dir === 'ASC' ? 'ASC' : 'DESC');
        break;
      case 'popular':
      default:
        qb.orderBy('p.sold', 'DESC').addOrderBy('p.createdAt', 'DESC');
        break;
    }

    const [products, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (products.length === 0) {
      return { data: [], total, page: +page, limit: +limit, success: true };
    }

    const ids = products.map((p) => p.id);

    // ── Get review counts (separate from avg to avoid alias conflicts)
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

    // ── Build final data — attach computed fields
    // p.category is auto-populated by leftJoinAndSelect
    let data = products.map((p: any) => {
      const r = ratingMap.get(p.id);
      return {
        ...p,
        averageRating: r ? parseFloat(parseFloat(r.avgRating).toFixed(1)) : null,
        reviewCount: r ? parseInt(String(r.reviewCount)) : 0,
      };
    });

    // ── Post-query rating filter (applied after pagination)
    if (minRating != null) {
      data = data.filter((p) => p.averageRating != null && p.averageRating >= minRating);
    }

    // ── Post-query sorts — nulls always last
    if (sortBy === 'rating') {
      data.sort((a, b) => {
        if (a.averageRating == null && b.averageRating == null) return 0;
        if (a.averageRating == null) return 1;
        if (b.averageRating == null) return -1;
        return dir === 'ASC' ? a.averageRating - b.averageRating : b.averageRating - a.averageRating;
      });
    } else if (sortBy === 'sold' && dir === 'ASC') {
      data.sort((a, b) => a.sold - b.sold);
    }

    return { data, total, page: +page, limit: +limit, success: true };
  }

  async findOne(idOrSlug: string) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUuid = uuidRegex.test(idOrSlug);

      // Build where clause: for UUID, try id+slug; for slug strings, only slug (avoids cast error)
      const where = isUuid
        ? [{ id: idOrSlug }, { slug: idOrSlug }]
        : [{ slug: idOrSlug }];

      const product = await this.repo.findOne({
        where,
        relations: ['reviews', 'reviews.user', 'variants'],
      });

      if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
      return { data: this.formatProduct(product), success: true };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      console.error('[findOne] error:', err);
      throw err;
    }
  }

  private formatProduct(product: any) {
    return {
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
      shortDescription: product.shortDescription,
      featuredImage: product.featuredImage,
      whatsInTheBox: product.whatsInTheBox,
      extraMetadata: product.extraMetadata,
      category: product.category,
      variants: product.variants,
      createdAt: product.createdAt,
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
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  // ─── Variant CRUD ────────────────────────────────────────────────────────
  async createVariant(
    productId: string,
    dto: { name: string; value: string; priceModifier?: number; stock?: number },
  ) {
    const product = await this.repo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    const variant = this.variantRepo.create({ ...dto, product });
    const data = await this.variantRepo.save(variant);
    return { data, success: true };
  }

  async updateVariant(
    variantId: string,
    dto: {
      name?: string;
      value?: string;
      priceModifier?: number;
      stock?: number;
      isActive?: boolean;
    },
  ) {
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