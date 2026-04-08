import { IsNotEmpty, IsOptional, IsString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @IsNotEmpty() name: string;
  @IsNotEmpty() phone: string;
  @IsNotEmpty() address: string;
  @IsNotEmpty() city: string;
}

export class CreateOrderDto {
  @ValidateNested() @Type(() => ShippingAddressDto) shippingAddress: ShippingAddressDto;
  @IsString() paymentMethod: 'cod' | 'bank_transfer' | 'credit_card' | 'stripe' = 'cod';
  @IsOptional() @IsString() note?: string;
}

export class UpdateOrderStatusDto {
  @IsString() status: string;
  @IsOptional() @IsString() paymentStatus?: string;
}
