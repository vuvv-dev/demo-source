import { IsNotEmpty, IsOptional, IsNumber, IsArray, IsBoolean, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty() name: string;
  @IsNotEmpty() slug: string;
  @IsNotEmpty() description: string;
  @IsNumber() @Type(() => Number) price: number;
  @IsOptional() @IsNumber() @Type(() => Number) originalPrice?: number;
  @IsOptional() @IsArray() images?: string[];
  @IsNumber() @Type(() => Number) stock: number;
  @IsNotEmpty() categoryId: string;
  @IsOptional() @IsObject() specs?: Record<string, string>;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
