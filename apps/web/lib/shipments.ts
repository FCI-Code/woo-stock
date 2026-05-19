import type { Shipment, ShipmentDetail } from '@/types/shipment';
import type { ShipmentStatus } from '@/types/tracking';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export async function getShipments(
  apiKey: string,
  status?: ShipmentStatus,
): Promise<Shipment[]> {
  const url = new URL(`${API_URL}/shipments`);
  if (status) url.searchParams.set('status', status);

  const res = await fetch(url.toString(), {
    headers: { 'X-API-Key': apiKey },
    next: { revalidate: 30 },
  });

  if (!res.ok) throw new Error('Failed to fetch shipments');

  return res.json() as Promise<Shipment[]>;
}

export async function getShipment(apiKey: string, id: string): Promise<ShipmentDetail> {
  const res = await fetch(`${API_URL}/shipments/${id}`, {
    headers: { 'X-API-Key': apiKey },
    next: { tags: ['shipment', id] },
  });

  if (!res.ok) throw new Error('Failed to fetch shipment');

  return res.json() as Promise<ShipmentDetail>;
}

export async function updateShipmentStatus(
  apiKey: string,
  id: string,
  status: ShipmentStatus,
  description?: string,
  location?: string,
) {
  const res = await fetch(`${API_URL}/shipments/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({ status, description, location }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(text || 'Failed to update shipment status');
  }

  return res.json();
}
