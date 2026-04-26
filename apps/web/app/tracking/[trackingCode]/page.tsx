import type { Metadata } from 'next';
import { getTracking } from '@/lib/tracking';
import { TrackingView } from '@/components/tracking/TrackingView';
import { TrackingNotFound } from '@/components/tracking/TrackingNotFound';
import { TrackingError } from '@/components/tracking/TrackingError';

interface Props {
  params: Promise<{ trackingCode: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { trackingCode } = await params;
  return {
    title: `Rastreio ${trackingCode} — WooStock`,
  };
}

export default async function TrackingPage({ params }: Props) {
  const { trackingCode } = await params;

  let data = null;
  let hasError = false;

  try {
    data = await getTracking(trackingCode);
  } catch {
    hasError = true;
  }

  if (hasError) return <TrackingError />;
  if (!data) return <TrackingNotFound trackingCode={trackingCode} />;

  return <TrackingView data={data} />;
}
