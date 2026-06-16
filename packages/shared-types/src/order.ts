import type { Shipment } from './shipment';

export type OrderStatus =
  | 'received'
  | 'quoting'
  | 'ready_to_ship'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'error';

export interface ShippingAddress {
  street: string;
  complement: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface OrderItem {
  name: string;
  sku: string;
  qty: number;
  product_id: number;
  variation_id: number;
  price: number;
  total: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  woo_order_id: number;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  total_weight: number;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends Order {
  shipment: Shipment | null;
}

export interface OrdersPage {
  items: Order[];
  total: number;
  page: number;
  limit: number;
}
