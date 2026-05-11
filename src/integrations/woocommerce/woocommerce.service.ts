import { HttpException, Injectable, Logger } from '@nestjs/common';

export interface WoocommerceCredentials {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

@Injectable()
export class WoocommerceService {
  private readonly logger = new Logger(WoocommerceService.name);

  async updateOrderTracking(
    creds: WoocommerceCredentials,
    wooOrderId: number,
    trackingCode: string,
    carrierLabel?: string,
  ): Promise<void> {
    const baseUrl = `${creds.storeUrl.replace(/\/$/, '')}/wp-json/wc/v3`;
    const auth = Buffer.from(
      `${creds.consumerKey}:${creds.consumerSecret}`,
    ).toString('base64');
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    };

    await this.request(`${baseUrl}/orders/${wooOrderId}`, 'PUT', headers, {
      status: 'completed',
      meta_data: [
        { key: '_woostock_tracking', value: trackingCode },
        ...(carrierLabel
          ? [{ key: '_woostock_carrier', value: carrierLabel }]
          : []),
      ],
    });

    const note = carrierLabel
      ? `Pedido despachado via ${carrierLabel}. Código de rastreio: ${trackingCode}`
      : `Pedido despachado. Código de rastreio: ${trackingCode}`;

    await this.request(`${baseUrl}/orders/${wooOrderId}/notes`, 'POST', headers, {
      note,
      customer_note: true,
    });
  }

  private async request(
    url: string,
    method: string,
    headers: Record<string, string>,
    body: unknown,
  ): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const text = await response.text();
      const parsed = text ? safeJsonParse(text) : null;

      if (!response.ok) {
        const message =
          (parsed && typeof parsed === 'object' && 'message' in parsed
            ? String((parsed as { message: unknown }).message)
            : null) ?? text ?? 'WooCommerce request failed';
        this.logger.error(`WC ${method} ${url} → ${response.status}: ${message}`);
        throw new HttpException(
          { error: 'WOOCOMMERCE_ERROR', message },
          response.status,
        );
      }

      return parsed;
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
