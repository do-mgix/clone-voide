import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

class CalculateShippingDto {
  @IsString() @IsNotEmpty() toZip: string;
  @IsInt() @Min(1) totalItems: number;
  @IsInt() @Min(0) insuranceValueCents: number;
}

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('calculate')
  async calculate(@Body() dto: CalculateShippingDto) {
    const zip = dto.toZip.replace(/\D/g, '');
    if (zip.length !== 8) throw new BadRequestException('CEP inválido');

    const options = await this.shippingService.calculate(
      zip,
      dto.totalItems,
      dto.insuranceValueCents / 100,
    );

    return options.map((opt) => ({
      id: opt.id,
      name: opt.name,
      company: opt.company,
      logo: opt.logo,
      price: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opt.priceCents / 100),
      priceCents: opt.priceCents,
      deadline: opt.deadline,
    }));
  }
}
