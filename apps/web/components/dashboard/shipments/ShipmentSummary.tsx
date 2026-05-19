import Link from 'next/link';
import type { Shipment } from '@/types/shipment';
import type { ShipmentStatus } from '@/types/tracking';
import { CopyButton } from '@/components/ui/CopyButton';

const STATUS_LABEL: Record<ShipmentStatus, string> = {
  pending: 'Aguardando',
  quoted: 'Cotado',
  label_generated: 'Etiqueta Gerada',
  posted: 'Postado',
  in_transit: 'Em Trânsito',
  delivered: 'Entregue',
  error: 'Erro',
};

const STATUS_STYLE: Record<ShipmentStatus, string> = {
  pending: 'bg-slate-100 text-slate-600',
  quoted: 'bg-amber-50 text-amber-700',
  label_generated: 'bg-amber-50 text-amber-700',
  posted: 'bg-sky-50 text-sky-700',
  in_transit: 'bg-orange-50 text-orange-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  error: 'bg-red-50 text-red-700',
};

interface Props {
  shipment: Shipment;
}

export function ShipmentSummary({ shipment }: Props) {
  return (
    <div className="bg-white border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Envio
        </p>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 ${STATUS_STYLE[shipment.status]}`}>
          {STATUS_LABEL[shipment.status]}
        </span>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3">
        {shipment.tracking_code && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 w-24 shrink-0">Rastreio</span>
            <span className="font-mono text-sm text-slate-800 flex-1">{shipment.tracking_code}</span>
            <CopyButton value={shipment.tracking_code} />
          </div>
        )}

        {(shipment.carrier || shipment.service) && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 w-24 shrink-0">Transportadora</span>
            <span className="text-sm text-slate-700">
              {[shipment.carrier, shipment.service].filter(Boolean).join(' · ')}
            </span>
          </div>
        )}

        {shipment.shipping_cost != null && shipment.shipping_cost > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 w-24 shrink-0">Custo</span>
            <span className="text-sm text-slate-700">R$ {shipment.shipping_cost.toFixed(2)}</span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
          <Link
            href={`/dashboard/shipments/${shipment.id}`}
            className="text-xs text-orange-600 hover:text-orange-700 transition-colors"
          >
            Ver detalhes →
          </Link>

          {shipment.label_url && (
            <a
              href={shipment.label_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              Baixar Etiqueta PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
