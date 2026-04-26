export interface TenantRegistrationResponse {
  id: string;
  name: string | null;
  store_url: string;
  status: 'active' | 'inactive';
  created_at: string;
  api_key: string;
  webhook_secret: string;
  webhook_url: string;
}

export interface TenantProfile {
  id: string;
  name: string | null;
  store_url: string;
  origin_zip: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}
