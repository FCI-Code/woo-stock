import Link from 'next/link';
import type { Shipment } from '@/types/shipment';
import type { ShipmentStatus } from '@/types/tracking';

const STATUS_LABEL: Record<ShipmentStatus, string> = {
  quoted: 'Cotado',
  label_generated: 'Etiqueta Gerada',
  posted: 'Postado',
  in_transit: 'Em Trânsito',
  delivered: 'Entregue',
  error: 'Erro',
};

const STATUS_STYLE: Record<ShipmentStatus, string> = {
  quoted: 'bg-amber-50 text-amber-700',
  label_generated: 'bg-amber-50 text-amber-700',
  posted: 'bg-sky-50 text-sky-700',
  in_transit: 'bg-orange-50 text-orange-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  error: 'bg-red-50 text-red-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

interface Props {
  shipments: Shipment[];
}

export function ShipmentsList({ shipments }: Props) {
  return (
    <div className="bg-white border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Envios
        </p>
        <span className="text-xs text-slate-400">{shipments.length} total</span>
      </div>

      {shipments.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-slate-400">Nenhum envio encontrado.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {shipments.map((s) => (
            <ShipmentRow key={s.id} shipment={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function ShipmentRow({ shipment: s }: { shipment: Shipment }) {
  return (
    <div className="px-5 py-3 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-0.5">
          {s.tracking_code ? (
            <Link
              href={`/tracking/${s.tracking_code}`}
              className="text-sm font-mono font-medium text-slate-800 hover:text-orange-600 transition-colors"
            >
              {s.tracking_code}
            </Link>
          ) : (
            <span className="text-sm font-mono text-slate-400">
              Sem código ainda
            </span>
          )}
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 ${STATUS_STYLE[s.status]}`}
          >
            {STATUS_LABEL[s.status]}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          {s.carrier && s.service
            ? `${s.carrier} · ${s.service}`
            : (s.carrier ?? 'Transportadora não definida')}
          {s.shipping_cost != null && s.shipping_cost > 0
            ? ` · R$ ${s.shipping_cost.toFixed(2)}`
            : ''}
        </p>
      </div>

      <span className="text-xs text-slate-400 tabular-nums shrink-0">
        {formatDate(s.created_at)}
      </span>
    </div>
  );
}
