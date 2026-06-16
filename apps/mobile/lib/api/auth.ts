import { apiFetch } from '@/lib/api-client';
import type { TenantRegistrationResponse, TenantProfile } from '@woo-stock/shared-types';

export function validateApiKey(apiKey: string): Promise<TenantProfile> {
  return apiFetch<TenantProfile>('/tenants/me', {
    authenticated: false,
    headers: { 'X-API-Key': apiKey },
  });
}

export function registerTenant(data: {
  name?: string;
  store_url: string;
}): Promise<TenantRegistrationResponse> {
  return apiFetch<TenantRegistrationResponse>('/tenants', {
    method: 'POST',
    body: JSON.stringify(data),
    authenticated: false,
  });
}
