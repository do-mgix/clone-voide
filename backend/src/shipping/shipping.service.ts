import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ShippingOption {
  id: number;
  name: string;
  company: string;
  logo: string;
  priceCents: number;
  deadline: number;
  error: string | null;
}

// Default package dimensions per item (cm / kg)
const ITEM_WIDTH = 16;
const ITEM_HEIGHT = 12;
const ITEM_LENGTH = 20;
const ITEM_WEIGHT = 0.4;

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(private readonly config: ConfigService) {}

  private get baseUrl() {
    const sandbox = this.config.get<string>('MELHORENVIO_SANDBOX') !== 'false';
    return sandbox
      ? 'https://sandbox.melhorenvio.com.br/api/v2'
      : 'https://www.melhorenvio.com.br/api/v2';
  }

  async calculate(toZip: string, totalItems: number, insuranceValue: number): Promise<ShippingOption[]> {
    const token = this.config.get<string>('MELHORENVIO_TOKEN');
    const fromZip = this.config.get<string>('MELHORENVIO_FROM_ZIP') ?? '01310100';
    const appEmail = this.config.get<string>('MELHORENVIO_APP_EMAIL') ?? 'app@shopstore.com';

    if (!token) {
      this.logger.warn('MELHORENVIO_TOKEN not set – returning empty quotes');
      return [];
    }

    const qty = Math.max(1, totalItems);

    const body = {
      from: { postal_code: fromZip.replace(/\D/g, '') },
      to:   { postal_code: toZip.replace(/\D/g, '') },
      package: {
        width:  ITEM_WIDTH,
        height: ITEM_HEIGHT * qty,
        length: ITEM_LENGTH,
        weight: +(ITEM_WEIGHT * qty).toFixed(2),
      },
      options: {
        insurance_value: insuranceValue,
        receipt: false,
        own_hand: false,
      },
    };

    const res = await fetch(`${this.baseUrl}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': `ShopStore (${appEmail})`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Melhor Envio API error ${res.status}: ${text}`);
      throw new Error('Erro ao consultar fretes');
    }

    const data: any[] = await res.json();

    return data
      .filter((opt) => !opt.error)
      .map((opt) => ({
        id: opt.id,
        name: opt.name,
        company: opt.company?.name ?? '',
        logo: opt.company?.picture ?? '',
        priceCents: Math.round(parseFloat(opt.price) * 100),
        deadline: opt.delivery_range?.max ?? opt.delivery_time ?? 0,
        error: null,
      }));
  }
}
