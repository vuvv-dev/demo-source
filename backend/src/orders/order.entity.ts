import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => User, (user) => user.orders, { eager: true })
  @JoinColumn()
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 15, scale: 0 })
  totalAmount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'simple-json' })
  shippingAddress: { name: string; phone: string; address: string; city: string };

  @Column({ default: 'cod' })
  paymentMethod: string;

  @Column({ default: 'pending' })
  paymentStatus: string;

  @Column({ nullable: true, type: 'text' })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
