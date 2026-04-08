import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Review } from '../reviews/review.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 0, transformer: { to: Number, from: Number } })
  price: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, nullable: true, transformer: { to: Number, from: Number } })
  originalPrice: number;

  @Column({ type: 'simple-json', default: '[]' })
  images: string[];

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 0 })
  sold: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', default: '{}' })
  specs: Record<string, string>;

  @Column({ nullable: true })
  tagline: string;

  @Column({ nullable: true })
  featuredImage: string;

  @Column({ type: 'text', nullable: true })
  whatsInTheBox: string;

  @Column({ type: 'simple-json', default: '{}' })
  extraMetadata: Record<string, any>;

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  @JoinColumn()
  category: Category;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => ProductVariant, (v) => v.product)
  variants: ProductVariant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
