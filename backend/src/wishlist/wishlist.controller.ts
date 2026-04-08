import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private service: WishlistService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.id);
  }

  @Post(':productId')
  add(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.service.add(user.id, productId);
  }

  @Delete(':productId')
  remove(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.service.remove(user.id, productId);
  }

  @Get(':productId/status')
  isWishlisted(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.service.isWishlisted(user.id, productId);
  }
}
