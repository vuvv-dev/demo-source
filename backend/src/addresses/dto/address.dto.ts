import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty() @IsString() name: string;
  @IsNotEmpty() @IsString() phone: string;
  @IsNotEmpty() @IsString() province: string;
  @IsNotEmpty() @IsString() district: string;
  @IsNotEmpty() @IsString() ward: string;
  @IsNotEmpty() @IsString() detailAddress: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() province?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() ward?: string;
  @IsOptional() @IsString() detailAddress?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
