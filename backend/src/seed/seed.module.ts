import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { ProductVariant } from '../products/product-variant.entity';
import { Category } from '../categories/category.entity';
import { Review } from '../reviews/review.entity';
import { User } from '../users/user.entity';
import { Cart } from '../cart/cart.entity';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductVariant, Category, Review, User, Cart])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
