import { apiFetch } from '@/lib/api-client';
import type { QuoteResult, LabelResult } from '@woo-stock/shared-types';

export function quoteShipping(orderId: string): Promise<QuoteResult> {
  return apiFetch<QuoteResult>('/shipping/quote', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
  });
}

export function generateLabel(
  orderId: string,
  option: { carrier: string; service: string },
): Promise<LabelResult> {
  return apiFetch<LabelResult>('/shipping/label', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, ...option }),
  });
}
