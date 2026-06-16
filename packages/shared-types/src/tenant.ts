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

export interface TenantUpdatePayload {
  name?: string;
  store_url?: string;
  origin_zip?: string;
  woo_consumer_key?: string;
  woo_consumer_secret?: string;
  melhor_envio_token?: string;
}
