import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/api';

const STORE_KEY = 'wsk_api_key';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function getStoredApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(STORE_KEY);
}

export async function setStoredApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(STORE_KEY, key);
}

export async function deleteStoredApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(STORE_KEY);
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { authenticated?: boolean },
): Promise<T> {
  const { authenticated = true, headers: extraHeaders, ...rest } = options ?? {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  };

  if (authenticated) {
    const apiKey = await getStoredApiKey();
    if (apiKey) headers['X-API-Key'] = apiKey;
  }

  const res = await fetch(`${API_URL}${path}`, { headers, ...rest });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? 'Erro na requisição');
  }

  return res.json() as Promise<T>;
}
