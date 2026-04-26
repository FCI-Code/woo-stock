import type { TrackingData } from '@/types/tracking';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';
const TRACKING_API_KEY = process.env.TRACKING_API_KEY ?? '';

export async function getTracking(
  trackingCode: string,
): Promise<TrackingData | null> {
  const res = await fetch(
    `${API_URL}/shipping/tracking/${encodeURIComponent(trackingCode)}`,
    {
      headers: { 'X-API-Key': TRACKING_API_KEY },
      next: { revalidate: 60 },
    },
  );

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`API responded with ${res.status}`);
  }

  return res.json() as Promise<TrackingData>;
}
