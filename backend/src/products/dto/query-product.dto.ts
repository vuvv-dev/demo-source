import { IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) limit?: number = 12;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() categorySlug?: string;
  @IsOptional() @Type(() => Number) minPrice?: number;
  @IsOptional() @Type(() => Number) maxPrice?: number;
  @IsOptional() @IsString() @IsIn(['popular', 'newest', 'price_asc', 'price_desc', 'rating', 'sold']) sortBy?: string;
  @IsOptional() @IsString() @IsIn(['asc', 'desc']) order?: 'asc' | 'desc' = 'desc';
  @IsOptional() @Type(() => Number) minRating?: number;
  @IsOptional() @IsIn(['in_stock', 'out_of_stock', 'all']) inStock?: string = 'all';
}
