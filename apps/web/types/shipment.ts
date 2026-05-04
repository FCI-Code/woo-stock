import type { ShipmentStatus } from './tracking';

export interface Shipment {
  id: string;
  tenant_id: string;
  order_id: string;
  tracking_code: string | null;
  carrier: string | null;
  service: string | null;
  status: ShipmentStatus;
  shipping_cost: number | null;
  estimated_days: number | null;
  label_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  tenant_id: string;
  status: ShipmentStatus;
  description: string;
  location: string | null;
  occurred_at: string;
}

export interface ShipmentDetail extends Shipment {
  events: ShipmentEvent[];
}
