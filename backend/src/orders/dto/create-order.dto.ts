import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsNotEmpty() street: string;
  @IsString() @IsNotEmpty() number: string;
  @IsOptional() @IsString() complement?: string;
  @IsString() @IsNotEmpty() neighborhood: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() state: string;
  @IsString() @IsNotEmpty() zip: string;
}

class ShippingDto {
  @IsInt() serviceId: number;
  @IsString() @IsNotEmpty() company: string;
  @IsString() @IsNotEmpty() service: string;
  @IsInt() @Min(0) priceCents: number;
  @IsInt() @Min(0) deadline: number;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsIn(['pix', 'credit_card', 'boleto'])
  paymentMethod: 'pix' | 'credit_card' | 'boleto';

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingDto)
  shipping?: ShippingDto;
}
