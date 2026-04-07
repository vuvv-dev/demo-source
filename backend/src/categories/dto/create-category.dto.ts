import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateCategoryDto {
  @IsNotEmpty() name: string;
  @IsNotEmpty() slug: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image?: string;
}
