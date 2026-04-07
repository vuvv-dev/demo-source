import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Review } from '../reviews/review.entity';

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

  @Column({ type: 'decimal', precision: 15, scale: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, nullable: true })
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

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  @JoinColumn()
  category: Category;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
