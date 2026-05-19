import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getShipment } from '@/lib/shipments';
import { ShipmentEventTimeline } from '@/components/dashboard/shipments/ShipmentEventTimeline';
import { ShipmentStatusUpdater } from '@/components/dashboard/shipments/ShipmentStatusUpdater';
import type { ShipmentStatus } from '@/types/tracking';

export const metadata: Metadata = {
  title: 'Detalhe do Envio — WooStock',
};

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
  params: Promise<{ id: string }>;
}

export default async function ShipmentDetailPage({ params }: Props) {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get('wsk_api_key')?.value;
  if (!apiKey) redirect('/login');

  const { id } = await params;
  const shipment = await getShipment(apiKey, id).catch(() => null);
  if (!shipment) notFound();

  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-6 flex flex-col gap-4">
      <Link
        href="/dashboard/shipments"
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors self-start"
      >
        ← Voltar para Envios
      </Link>

      <div className="bg-white border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Envio
          </p>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 ${STATUS_STYLE[shipment.status]}`}>
              {STATUS_LABEL[shipment.status]}
            </span>
            <ShipmentStatusUpdater
              shipmentId={shipment.id}
              currentStatus={shipment.status}
              apiKey={apiKey}
            />
          </div>
        </div>

        <div className="px-5 py-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label="Código de Rastreio">
            {shipment.tracking_code ? (
              <span className="font-mono text-sm text-slate-800">{shipment.tracking_code}</span>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </InfoRow>

          <InfoRow label="Transportadora">
            <span className="text-sm text-slate-800">
              {shipment.carrier && shipment.service
                ? `${shipment.carrier} · ${shipment.service}`
                : (shipment.carrier ?? '—')}
            </span>
          </InfoRow>

          {shipment.shipping_cost != null && shipment.shipping_cost > 0 && (
            <InfoRow label="Custo">
              <span className="text-sm text-slate-800">
                R$ {shipment.shipping_cost.toFixed(2)}
              </span>
            </InfoRow>
          )}

          {shipment.estimated_days != null && (
            <InfoRow label="Prazo">
              <span className="text-sm text-slate-800">{shipment.estimated_days} dias úteis</span>
            </InfoRow>
          )}

          <InfoRow label="Pedido">
            <Link
              href={`/dashboard/orders/${shipment.order_id}`}
              className="text-sm text-orange-600 hover:text-orange-700 transition-colors font-mono"
            >
              Ver Pedido
            </Link>
          </InfoRow>

          {shipment.label_url && (
            <InfoRow label="Etiqueta">
              <a
                href={shipment.label_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-600 hover:text-orange-700 transition-colors"
              >
                Baixar PDF
              </a>
            </InfoRow>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Histórico de Eventos
          </p>
        </div>
        <ShipmentEventTimeline events={shipment.events} />
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-slate-400">{label}</span>
      {children}
    </div>
  );
}
