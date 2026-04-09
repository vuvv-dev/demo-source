import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (p) => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn()
  product: Product;

  @Column()
  name: string; // e.g. "Màu sắc", "Dung lượng"

  @Column()
  value: string; // e.g. "Đen Midnight", "256GB"

  // Price modifier relative to product base price (can be negative for discounts)
  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0, transformer: { to: Number, from: Number } })
  priceModifier: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  colorHex: string; // e.g. "#1d1d1f" — for color swatches

  @Column({ nullable: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
