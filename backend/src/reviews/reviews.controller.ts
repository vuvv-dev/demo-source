import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private service: ReviewsService) {}

  @Get('products/:productId/reviews')
  findByProduct(@Param('productId') productId: string, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.service.findByProduct(productId, +page, +limit);
  }

  @Post('products/:productId/reviews')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(@Param('productId') productId: string, @CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.service.create(productId, user.id, dto);
  }

  @Delete('reviews/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
