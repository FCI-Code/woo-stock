'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export async function updateTenant(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get('wsk_api_key')?.value;
  if (!apiKey) return { error: 'Não autenticado' };

  const fields = [
    'name',
    'store_url',
    'origin_zip',
    'woo_consumer_key',
    'woo_consumer_secret',
    'melhor_envio_token',
  ] as const;

  const payload: Record<string, string> = {};
  for (const field of fields) {
    const value = formData.get(field);
    if (typeof value === 'string' && value.trim() !== '') {
      payload[field] = value.trim();
    }
  }

  try {
    const res = await fetch(`${API_URL}/tenants/me`, {
      method: 'PATCH',
      headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: (body as { message?: string }).message ?? 'Erro ao salvar configurações' };
    }

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch {
    return { error: 'Erro ao conectar com o servidor' };
  }
}
