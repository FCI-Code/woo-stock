'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { TenantRegistrationResponse } from '@/types/tenant';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';
const COOKIE_NAME = 'wsk_api_key';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type RegisterResult = { data: TenantRegistrationResponse } | { error: string };

type LoginResult = { error: string } | void;

export async function register(formData: FormData): Promise<RegisterResult> {
  const name = formData.get('name') as string;
  const store_url = formData.get('store_url') as string;

  const res = await fetch(`${API_URL}/tenants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name || undefined, store_url }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const raw = body.message;
    const message = Array.isArray(raw)
      ? raw[0]
      : (raw ?? 'Erro ao criar conta');
    return { error: String(message) };
  }

  return { data: (await res.json()) as TenantRegistrationResponse };
}

export async function loginWithKey(apiKey: string): Promise<LoginResult> {
  const res = await fetch(`${API_URL}/tenants/me`, {
    headers: { 'X-API-Key': apiKey },
  });

  if (!res.ok) {
    return { error: 'API key inválida ou tenant inativo.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, apiKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  });

  redirect('/dashboard');
}

export async function login(formData: FormData): Promise<LoginResult> {
  const apiKey = (formData.get('api_key') as string).trim();
  return loginWithKey(apiKey);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/login');
}
