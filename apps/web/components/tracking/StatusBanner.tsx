import type { ShipmentStatus } from '@/types/tracking';

const STATUS_CONFIG: Record<
  ShipmentStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  quoted: {
    label: 'Cotado',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  label_generated: {
    label: 'Etiqueta Gerada',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  posted: {
    label: 'Postado',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
  },
  in_transit: {
    label: 'Em Trânsito',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  delivered: {
    label: 'Entregue',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  error: {
    label: 'Erro no Envio',
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
  },
};

interface Props {
  status: ShipmentStatus;
  estimatedDays: number | null;
}

export function StatusBanner({ status, estimatedDays }: Props) {
  const config = STATUS_CONFIG[status];

  return (
    <div className={`border ${config.border} ${config.bg} px-5 py-4`}>
      <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1">
        Status atual
      </p>
      <p className={`text-2xl font-bold ${config.text}`}>{config.label}</p>
      {estimatedDays !== null &&
        status !== 'delivered' &&
        status !== 'error' && (
          <p className="text-sm text-slate-500 mt-1">
            Previsão de entrega:{' '}
            <span className="font-medium text-slate-700">
              {estimatedDays} {estimatedDays === 1 ? 'dia útil' : 'dias úteis'}
            </span>
          </p>
        )}
      {status === 'delivered' && (
        <p className="text-sm text-emerald-700 mt-1 font-medium">
          Pedido entregue com sucesso.
        </p>
      )}
    </div>
  );
}
