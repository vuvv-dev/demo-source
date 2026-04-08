import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Stripe = require('stripe');

// Inline type definitions to avoid Stripe v22 namespace resolution issues
interface LineItemParams {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      images?: string[];
    };
    unit_amount: number;
  };
  quantity: number;
}

interface CheckoutSession {
  id: string;
  url: string | null;
  metadata: Record<string, string> | null;
}

@Injectable()
export class PaymentService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private stripe: any;

  constructor(@InjectRepository(Order) private orderRepo: Repository<Order>) {
    this.stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createCheckoutSession(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'items'],
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.user.id !== userId) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.paymentMethod !== 'stripe') throw new BadRequestException('Sai phương thức thanh toán');

    const lineItems: LineItemParams[] = order.items.map(item => ({
      price_data: {
        currency: 'vnd',
        product_data: {
          name: item.productName,
          images: item.productImage ? [item.productImage] : [],
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    const session: CheckoutSession = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout?canceled=true`,
      metadata: { orderId: order.id, userId },
      customer_email: order.user.email,
    });

    return { data: { sessionId: session.id, url: session.url }, success: true };
  }

  async handleWebhook(payload: Buffer, sig: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not configured');
      return { received: true };
    }

    try {
      this.stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed`);
    }

    // Parse event manually to avoid Stripe namespace issues
    const event = JSON.parse(payload.toString()) as {
      type: string;
      data: { object: CheckoutSession };
    };

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { orderId } = session.metadata || {};
      if (orderId) {
        await this.orderRepo.update(orderId, {
          paymentStatus: 'paid',
          status: 'confirmed',
        });
      }
    }

    return { received: true };
  }
}