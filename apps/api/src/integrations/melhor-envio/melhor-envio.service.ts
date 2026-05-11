import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MelhorEnvioCalculateOption,
  MelhorEnvioCalculateRequest,
  MelhorEnvioCartRequest,
  MelhorEnvioCartResponse,
  MelhorEnvioGenerateResponse,
  MelhorEnvioPrintResponse,
} from './types';

@Injectable()
export class MelhorEnvioService {
  private readonly logger = new Logger(MelhorEnvioService.name);
  private readonly baseUrl: string;
  private readonly userAgent = 'WooStock (contact@woostock.local)';

  constructor(config: ConfigService) {
    this.baseUrl =
      config.get<string>('MELHOR_ENVIO_BASE_URL') ??
      'https://sandbox.melhorenvio.com.br';
  }

  async calculate(
    token: string,
    payload: MelhorEnvioCalculateRequest,
  ): Promise<MelhorEnvioCalculateOption[]> {
    return this.request<MelhorEnvioCalculateOption[]>(
      'POST',
      '/api/v2/me/shipment/calculate',
      token,
      payload,
    );
  }

  async addToCart(
    token: string,
    payload: MelhorEnvioCartRequest,
  ): Promise<MelhorEnvioCartResponse> {
    return this.request<MelhorEnvioCartResponse>(
      'POST',
      '/api/v2/me/cart',
      token,
      payload,
    );
  }

  async checkout(token: string, orderIds: string[]): Promise<unknown> {
    return this.request<unknown>('POST', '/api/v2/me/shipment/checkout', token, {
      orders: orderIds,
    });
  }

  async generate(
    token: string,
    orderIds: string[],
  ): Promise<MelhorEnvioGenerateResponse> {
    return this.request<MelhorEnvioGenerateResponse>(
      'POST',
      '/api/v2/me/shipment/generate',
      token,
      { orders: orderIds },
    );
  }

  async print(token: string, orderIds: string[]): Promise<MelhorEnvioPrintResponse> {
    return this.request<MelhorEnvioPrintResponse>(
      'POST',
      '/api/v2/me/shipment/print',
      token,
      { mode: 'private', orders: orderIds },
    );
  }

  private async request<T>(
    method: string,
    path: string,
    token: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        method,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent,
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const text = await response.text();
      const parsed = text ? safeJsonParse(text) : null;

      if (!response.ok) {
        const message =
          (parsed && typeof parsed === 'object' && 'message' in parsed
            ? String((parsed as { message: unknown }).message)
            : null) ?? text ?? 'Melhor Envio request failed';
        this.logger.error(`ME ${method} ${path} → ${response.status}: ${message}`);
        throw new HttpException(
          { error: 'MELHOR_ENVIO_ERROR', message, details: parsed },
          response.status,
        );
      }

      return parsed as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
