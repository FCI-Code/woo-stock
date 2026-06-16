import { apiFetch } from '@/lib/api-client';
import type { TenantProfile, TenantUpdatePayload } from '@woo-stock/shared-types';

export function getTenantProfile(): Promise<TenantProfile> {
  return apiFetch<TenantProfile>('/tenants/me');
}

export function updateTenant(data: TenantUpdatePayload): Promise<TenantProfile> {
  return apiFetch<TenantProfile>('/tenants/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
