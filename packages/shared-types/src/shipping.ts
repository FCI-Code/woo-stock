export interface QuoteOption {
  id: number;
  carrier: string | null;
  service: string;
  cost: number;
  estimated_days: number | null;
  company_picture: string | null;
}

export interface QuoteResult {
  quote_id: string;
  options: QuoteOption[];
}

export interface LabelResult {
  shipment_id: string;
  tracking_code: string | null;
  label_url: string | null;
  carrier: string;
  service: string;
  cost: number;
}
