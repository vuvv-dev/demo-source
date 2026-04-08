import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { PayOS } from '@payos/node';

@Injectable()
export class PaymentService {
  private payos: PayOS;

  constructor(@InjectRepository(Order) private orderRepo: Repository<Order>) {
    this.payos = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID || '',
      apiKey: process.env.PAYOS_API_KEY || '',
      checksumKey: process.env.PAYOS_CHECKSUM_KEY || '',
    });
  }

  async createCheckoutSession(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'items'],
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.user.id !== userId) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.paymentMethod !== 'payos') throw new BadRequestException('Sai phương thức thanh toán');

    const body = {
      orderCode: Number(order.orderCode),
      amount: Math.round(Number(order.totalAmount)),
      description: `Thanh toán đơn hàng ${order.orderNumber}`,
      items: order.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: Math.round(Number(item.price)),
      })),
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success?order_id=${orderId}`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout?canceled=true`,
    };

    try {
      const paymentLink = await this.payos.paymentRequests.create(body);
      return { data: { checkoutUrl: paymentLink.checkoutUrl, orderCode: body.orderCode }, success: true };
    } catch (error) {
      console.error('PayOS error:', error);
      throw new BadRequestException('Không thể tạo liên kết thanh toán');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleWebhook(body: any) {
    try {
      // PayOS verification
      const verifiedData = await this.payos.webhooks.verify(body);
      
      // PayOS sends status in its payload
      if (verifiedData.code === '00' || body.success === true) {
        const orderCode = verifiedData.orderCode;
        if (orderCode) {
          await this.orderRepo.update({ orderCode }, {
            paymentStatus: 'paid',
            status: 'confirmed',
          });
        }
      }
      return { success: true };
    } catch (err) {
      console.error('Webhook processing error:', err);
      return { success: false, message: 'Invalid webhook data' };
    }
  }
}