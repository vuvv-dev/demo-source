import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private service: CartService) {}

  @Get()
  getCart(@CurrentUser() user: any) { return this.service.getCart(user.id); }

  @Post('items')
  addItem(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.service.addItem(user.id, dto);
  }

  @Patch('items/:id')
  updateItem(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return this.service.updateItem(user.id, id, dto);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.removeItem(user.id, id);
  }

  @Delete()
  clearCart(@CurrentUser() user: any) { return this.service.clearCart(user.id); }
}
