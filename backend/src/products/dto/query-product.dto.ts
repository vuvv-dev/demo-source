import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) limit?: number = 12;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() categorySlug?: string;
  @IsOptional() @Type(() => Number) minPrice?: number;
  @IsOptional() @Type(() => Number) maxPrice?: number;
  @IsOptional() @IsString() sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}
