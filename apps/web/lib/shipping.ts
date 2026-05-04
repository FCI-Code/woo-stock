'use server';

import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import type { QuoteResult, LabelResult } from '@/types/shipping';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

type QuoteActionResult = { data: QuoteResult } | { error: string };
type LabelActionResult = { data: LabelResult } | { error: string };

async function getApiKey(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('wsk_api_key')?.value ?? null;
}

export async function quoteShipping(orderId: string): Promise<QuoteActionResult> {
  const apiKey = await getApiKey();
  if (!apiKey) return { error: 'Não autenticado' };

  try {
    const res = await fetch(`${API_URL}/shipping/quote`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: (body as { message?: string }).message ?? 'Erro ao cotar frete' };
    }

    const data = (await res.json()) as QuoteResult;
    return { data };
  } catch {
    return { error: 'Erro ao conectar com o servidor' };
  }
}

export async function generateLabel(
  orderId: string,
  selectedOption: { carrier: string; service: string },
): Promise<LabelActionResult> {
  const apiKey = await getApiKey();
  if (!apiKey) return { error: 'Não autenticado' };

  try {
    const res = await fetch(`${API_URL}/shipping/label`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, selected_option: selectedOption }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: (body as { message?: string }).message ?? 'Erro ao gerar etiqueta' };
    }

    const data = (await res.json()) as LabelResult;

    revalidateTag('order');
    revalidateTag(orderId);
    revalidateTag('shipment');

    return { data };
  } catch {
    return { error: 'Erro ao conectar com o servidor' };
  }
}
