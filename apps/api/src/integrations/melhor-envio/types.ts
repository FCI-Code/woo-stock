export interface MelhorEnvioProduct {
  id?: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value?: number;
  quantity: number;
}

export interface MelhorEnvioCalculateRequest {
  from: { postal_code: string };
  to: { postal_code: string };
  products: MelhorEnvioProduct[];
  options?: {
    receipt?: boolean;
    own_hand?: boolean;
    insurance_value?: number;
    use_insurance_value?: boolean;
  };
  services?: string;
}

export interface MelhorEnvioCalculateOption {
  id: number;
  name: string;
  price?: string;
  custom_price?: string;
  discount?: string;
  currency?: string;
  delivery_time?: number;
  delivery_range?: { min: number; max: number };
  custom_delivery_time?: number;
  custom_delivery_range?: { min: number; max: number };
  packages?: unknown[];
  additional_services?: Record<string, unknown>;
  company?: { id: number; name: string; picture?: string };
  error?: string;
}

export interface MelhorEnvioAddress {
  name: string;
  phone?: string;
  email?: string;
  document?: string;
  company_document?: string;
  state_register?: string;
  address: string;
  complement?: string;
  number?: string;
  district?: string;
  city: string;
  state_abbr: string;
  country_id: string;
  postal_code: string;
}

export interface MelhorEnvioCartProduct {
  name: string;
  quantity: number;
  unitary_value: number;
}

export interface MelhorEnvioVolume {
  height: number;
  width: number;
  length: number;
  weight: number;
}

export interface MelhorEnvioCartRequest {
  service: number;
  agency?: number;
  from: MelhorEnvioAddress;
  to: MelhorEnvioAddress;
  products: MelhorEnvioCartProduct[];
  volumes: MelhorEnvioVolume[];
  options: {
    insurance_value: number;
    receipt: boolean;
    own_hand: boolean;
    reverse?: boolean;
    non_commercial?: boolean;
    platform?: string;
    tags?: { tag: string; url?: string }[];
  };
}

export interface MelhorEnvioCartResponse {
  id: string;
  protocol?: string;
  service_id?: number;
  status?: string;
}

export interface MelhorEnvioGenerateResponseEntry {
  status?: string;
  message?: string;
  tracking?: string;
}

export type MelhorEnvioGenerateResponse = Record<string, MelhorEnvioGenerateResponseEntry>;

export interface MelhorEnvioPrintResponse {
  url: string;
}
