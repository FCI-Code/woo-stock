export type ShipmentStatus =
  | 'pending'
  | 'quoted'
  | 'label_generated'
  | 'posted'
  | 'in_transit'
  | 'delivered'
  | 'error';

export interface TimelineEvent {
  type: 'preparation' | 'shipment';
  status: string;
  description: string;
  location: string | null;
  occurred_at: string;
}

export interface TrackingData {
  tracking_code: string;
  current_status: ShipmentStatus;
  carrier: string | null;
  service: string | null;
  estimated_days: number | null;
  label_url: string | null;
  order: {
    id: string;
    woo_order_id: number;
    customer_name: string;
    customer_email: string;
  };
  timeline: TimelineEvent[];
}
