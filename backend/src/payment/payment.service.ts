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
      description: `Thanh toan don hang ${order.orderNumber}`,
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
      return {
        data: {
          checkoutUrl: paymentLink.checkoutUrl,
          qrData: (paymentLink as any).qrData,
          orderCode: body.orderCode,
        },
        success: true,
      };
    } catch (error) {
      console.error('PayOS error:', error);
      throw new BadRequestException('Không thể tạo liên kết thanh toán');
    }
  }

  // ─── Handle PayOS webhook ──────────────────────────────────────────────────
  async handlePayOSWebhook(body: any) {
    try {
      const verifiedData = await this.payos.webhooks.verify(body);
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


  async getQRCodeUrl(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'items'],
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.user.id !== userId) throw new NotFoundException('Đơn hàng không tồn tại');

    if (order.paymentStatus === 'paid') {
      return { data: { alreadyPaid: true }, success: true };
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrDescription = `Thanh toan don hang ${order.orderNumber}`;
    const amount = Math.round(Number(order.totalAmount));

    // ── bank_transfer → VietQR.io ──────────────────────────────────────────
    if (order.paymentMethod === 'bank_transfer') {
      const bankCode = process.env.VIETQR_BANK_CODE || 'VCB';
      const accountNumber = process.env.VIETQR_ACCOUNT_NUMBER;

      if (!accountNumber) {
        throw new BadRequestException('Chưa cấu hình tài khoản thanh toán');
      }

      // VietQR.io — hoàn toàn miễn phí, không cần API key
      // https://img.vietqr.io/image/[BANK]-[ACCOUNT]-[TEMPLATE].png?amount=...&addInfo=...
      const qrImageUrl =
        `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.png` +
        `?amount=${amount}&addInfo=${encodeURIComponent(qrDescription)}`;

      return {
        data: {
          qrUrl: qrImageUrl,
          qrType: 'vietqr',
          orderNumber: order.orderNumber,
          amount,
          bankCode,
          accountNumber,
        },
        success: true,
      };
    }

    // ── payos → PayOS ───────────────────────────────────────────────────────
    if (order.paymentMethod !== 'payos') {
      throw new BadRequestException('Phương thức thanh toán không hỗ trợ QR');
    }

    const body = {
      orderCode: Number(order.orderCode),
      amount,
      description: qrDescription,
      items: order.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: Math.round(Number(item.price)),
      })),
      returnUrl: `${frontendUrl}/checkout/success?order_id=${orderId}`,
      cancelUrl: `${frontendUrl}/checkout?canceled=true`,
    };

    try {
      const paymentLink = await this.payos.paymentRequests.create(body);
      const qrUrl = (paymentLink as any).qrUrl || (paymentLink as any).qrData;
      return {
        data: {
          qrUrl,
          qrType: 'payos',
          checkoutUrl: paymentLink.checkoutUrl,
          orderNumber: order.orderNumber,
          amount,
          orderCode: body.orderCode,
        },
        success: true,
      };
    } catch (error) {
      console.error('PayOS QR error:', error);
      throw new BadRequestException('Không thể tạo mã QR thanh toán');
    }
  }

  async confirmPayment(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user'],
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.user.id !== userId) throw new NotFoundException('Đơn hàng không tồn tại');
    if (!['bank_transfer', 'payos'].includes(order.paymentMethod)) {
      throw new BadRequestException('Phương thức thanh toán không hỗ trợ xác nhận thủ công');
    }
    if (order.paymentStatus === 'paid') {
      return { data: { alreadyPaid: true, orderId }, success: true };
    }

    await this.orderRepo.update({ id: orderId }, {
      paymentStatus: 'paid',
      status: 'confirmed',
    });

    return { data: { confirmed: true, orderId }, success: true, message: 'Xác nhận thanh toán thành công' };
  }
}
