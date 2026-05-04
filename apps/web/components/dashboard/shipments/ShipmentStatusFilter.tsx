'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { ShipmentStatus } from '@/types/tracking';

const FILTERS: { label: string; value: ShipmentStatus | undefined }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Cotado', value: 'quoted' },
  { label: 'Etiqueta', value: 'label_generated' },
  { label: 'Postado', value: 'posted' },
  { label: 'Em Trânsito', value: 'in_transit' },
  { label: 'Entregue', value: 'delivered' },
  { label: 'Erro', value: 'error' },
];

interface Props {
  current?: ShipmentStatus;
}

export function ShipmentStatusFilter({ current }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setStatus(value: ShipmentStatus | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {FILTERS.map(({ label, value }) => {
        const isActive = current === value;
        return (
          <button
            key={label}
            onClick={() => setStatus(value)}
            className={`text-[11px] font-medium px-2.5 py-1 transition-colors ${
              isActive
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
