import { apiFetch } from '@/lib/api-client';
import type { TrackingData } from '@woo-stock/shared-types';

export function getTracking(code: string): Promise<TrackingData> {
  return apiFetch<TrackingData>(`/shipping/tracking/${code}`, {
    authenticated: true,
  });
}
