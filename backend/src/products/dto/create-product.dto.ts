import { IsNotEmpty, IsOptional, IsNumber, IsArray, IsBoolean, IsObject, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty() @IsString() name: string;
  @IsNotEmpty() @IsString() slug: string;
  @IsNotEmpty() @IsString() description: string;
  @IsNotEmpty() @IsNumber() @Type(() => Number) price: number;
  @IsOptional() @IsNumber() @Type(() => Number) originalPrice?: number;
  @IsOptional() @IsString() tagline?: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsArray() images?: string[];
  @IsOptional() @IsNumber() @Type(() => Number) stock?: number;
  @IsNotEmpty() @IsString() categoryId: string;
  @IsOptional() @IsObject() specs?: Record<string, string>;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() featuredImage?: string;
  @IsOptional() @IsString() whatsInTheBox?: string;
  @IsOptional() @IsObject() extraMetadata?: Record<string, any>;
}