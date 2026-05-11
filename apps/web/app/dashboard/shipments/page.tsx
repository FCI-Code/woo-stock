import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getShipments } from '@/lib/shipments';
import { ShipmentsTable } from '@/components/dashboard/shipments/ShipmentsTable';
import { ShipmentStatusFilter } from '@/components/dashboard/shipments/ShipmentStatusFilter';
import type { ShipmentStatus } from '@/types/tracking';

export const metadata: Metadata = {
  title: 'Envios — WooStock',
};

const VALID_STATUSES: ShipmentStatus[] = [
  'quoted',
  'label_generated',
  'posted',
  'in_transit',
  'delivered',
  'error',
];

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function ShipmentsPage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get('wsk_api_key')?.value;
  if (!apiKey) redirect('/login');

  const { status: rawStatus } = await searchParams;
  const status = VALID_STATUSES.includes(rawStatus as ShipmentStatus)
    ? (rawStatus as ShipmentStatus)
    : undefined;

  const shipments = await getShipments(apiKey, status).catch(() => []);

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Envios
        </p>
        <span className="text-xs text-slate-400">{shipments.length} resultado(s)</span>
      </div>

      <Suspense fallback={null}>
        <ShipmentStatusFilter current={status} />
      </Suspense>

      <ShipmentsTable shipments={shipments} />
    </div>
  );
}
