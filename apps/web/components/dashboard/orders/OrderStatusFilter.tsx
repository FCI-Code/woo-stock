'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { OrderStatus } from '@/types/order';

const FILTERS: { label: string; value: OrderStatus | undefined }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Recebido', value: 'received' },
  { label: 'Cotando', value: 'quoting' },
  { label: 'Pronto p/ Envio', value: 'ready_to_ship' },
  { label: 'Enviado', value: 'shipped' },
  { label: 'Em Trânsito', value: 'in_transit' },
  { label: 'Entregue', value: 'delivered' },
  { label: 'Erro', value: 'error' },
];

interface Props {
  current?: OrderStatus;
}

export function OrderStatusFilter({ current }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setStatus(value: OrderStatus | undefined) {
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
