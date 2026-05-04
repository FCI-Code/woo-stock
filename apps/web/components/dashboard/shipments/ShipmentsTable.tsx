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

export function ShipmentsTable({ shipments }: Props) {
  if (shipments.length === 0) {
    return (
      <div className="bg-white border border-slate-200 px-5 py-10 text-center">
        <p className="text-sm text-slate-400">Nenhum envio encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Código
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden sm:table-cell">
              Transportadora
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Status
            </th>
            <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">
              Custo
            </th>
            <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Data
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {shipments.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/shipments/${s.id}`}
                  className="font-mono text-xs text-slate-800 hover:text-orange-600 transition-colors"
                >
                  {s.tracking_code ?? <span className="text-slate-400">Sem código</span>}
                </Link>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">
                {s.carrier && s.service ? `${s.carrier} · ${s.service}` : (s.carrier ?? '—')}
              </td>
              <td className="px-4 py-3">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 ${STATUS_STYLE[s.status]}`}>
                  {STATUS_LABEL[s.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 text-right tabular-nums hidden md:table-cell">
                {s.shipping_cost != null && s.shipping_cost > 0
                  ? `R$ ${s.shipping_cost.toFixed(2)}`
                  : '—'}
              </td>
              <td className="px-4 py-3 text-xs text-slate-400 text-right tabular-nums">
                {formatDate(s.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
