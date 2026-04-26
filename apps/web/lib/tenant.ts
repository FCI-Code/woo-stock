import type { TenantProfile } from '@/types/tenant';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export async function getTenantProfile(apiKey: string): Promise<TenantProfile> {
  const res = await fetch(`${API_URL}/tenants/me`, {
    headers: { 'X-API-Key': apiKey },
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error('Failed to fetch tenant profile');

  return res.json() as Promise<TenantProfile>;
}
