import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() value: string;
  @IsNumber() @IsOptional() priceModifier?: number;
  @IsNumber() @IsOptional() stock?: number;
}

export class UpdateVariantDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() value?: string;
  @IsNumber() @IsOptional() priceModifier?: number;
  @IsNumber() @IsOptional() stock?: number;
  @IsBoolean() @IsOptional() isActive?: boolean;
}

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Get()
  findAll(@Query() query: QueryProductDto) { return this.service.findAll(query); }

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAllAdmin(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.findAllAdmin(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateProductDto) { return this.service.create(dto); }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) { return this.service.remove(id); }

  // ─── Variants ───────────────────────────────────────────────────────────
  @Post(':id/variants')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.service.createVariant(id, dto);
  }

  @Patch('variants/:variantId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateVariant(@Param('variantId') variantId: string, @Body() dto: UpdateVariantDto) {
    return this.service.updateVariant(variantId, dto);
  }

  @Delete('variants/:variantId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deleteVariant(@Param('variantId') variantId: string) {
    return this.service.deleteVariant(variantId);
  }
}
