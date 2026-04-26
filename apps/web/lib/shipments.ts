import type { Shipment } from '@/types/shipment';
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
