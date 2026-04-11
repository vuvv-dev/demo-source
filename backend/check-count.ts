import { DataSource } from 'typeorm';
import { Product } from './src/products/product.entity';
import { Category } from './src/categories/category.entity';
import { ProductVariant } from './src/products/product-variant.entity';
import { Review } from './src/reviews/review.entity';
import { User } from './src/users/user.entity';
import { Address } from './src/addresses/address.entity';
import { Wishlist } from './src/wishlist/wishlist.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: 'postgresql://postgres:postgres123@localhost:5432/apple_store',
  entities: [Product, Category, ProductVariant, Review, User, Address, Wishlist],
  synchronize: false,
});

async function check() {
  await dataSource.initialize();
  const count = await dataSource.getRepository(Product).count();
  console.log('--- PRODUCT COUNT ---');
  console.log(count);
  console.log('---------------------');
  await dataSource.destroy();
}

check();
