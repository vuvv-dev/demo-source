import { IsNotEmpty, IsNumber, IsOptional, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsNotEmpty() productId: string;
  @IsNumber() @Min(1) @Type(() => Number) quantity: number;
  @IsOptional() @IsObject() selectedVariant?: Record<string, string>;
}

export class UpdateCartItemDto {
  @IsNumber() @Min(1) @Type(() => Number) quantity: number;
}
