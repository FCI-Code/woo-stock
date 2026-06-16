import { apiFetch } from '@/lib/api-client';
import type { Shipment, ShipmentDetail, ShipmentStatus } from '@woo-stock/shared-types';

export function getShipments(status?: ShipmentStatus): Promise<Shipment[]> {
  const query = status ? `?status=${status}` : '';
  return apiFetch<Shipment[]>(`/shipments${query}`);
}

export function getShipment(id: string): Promise<ShipmentDetail> {
  return apiFetch<ShipmentDetail>(`/shipments/${id}`);
}
