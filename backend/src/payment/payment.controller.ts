import { Controller, Post, Get, Body, Param, Patch, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private service: PaymentService) {}

  @Post('create-checkout-session')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  createCheckoutSession(@CurrentUser() user: any, @Body('orderId') orderId: string) {
    return this.service.createCheckoutSession(user.id, orderId);
  }

  @Get('qr/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getQRCode(@CurrentUser() user: any, @Param('orderId') orderId: string) {
    return this.service.getQRCodeUrl(user.id, orderId);
  }

  @Patch('confirm/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  confirmPayment(@CurrentUser() user: any, @Param('orderId') orderId: string) {
    return this.service.confirmPayment(user.id, orderId);
  }

  /** PayOS webhook */
  @Post('webhook/payos')
  @HttpCode(HttpStatus.OK)
  async webhookPayOS(@Body() body: any) {
    return this.service.handlePayOSWebhook(body);
  }
}