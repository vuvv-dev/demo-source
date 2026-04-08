import { Controller, Post, Get, Body, Param, Headers, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
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

  @Post('webhook')
  handleWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    return this.service.handleWebhook(req.rawBody, sig);
  }
}