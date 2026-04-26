import Link from 'next/link';
import type { TrackingData } from '@/types/tracking';
import { StatusBanner } from './StatusBanner';
import { StatusProgress } from './StatusProgress';
import { TrackingTimeline } from './TrackingTimeline';

interface Props {
  data: TrackingData;
}

export function TrackingView({ data }: Props) {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-5 py-3 flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest uppercase text-slate-900 font-mono">
          WooStock
        </span>
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Rastrear outro
        </Link>
      </header>

      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
            Código de rastreio
          </p>
          <p className="text-xl font-mono font-bold text-slate-900 mt-0.5">
            {data.tracking_code}
          </p>
        </div>

        <div className="bg-white border border-slate-200 overflow-hidden">
          <StatusProgress current={data.current_status} />
          <StatusBanner
            status={data.current_status}
            estimatedDays={data.estimated_days}
          />

          {(data.carrier || data.service) && (
            <div className="px-5 py-3 border-t border-slate-100 flex gap-6">
              {data.carrier && (
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
                    Transportadora
                  </p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">
                    {data.carrier}
                  </p>
                </div>
              )}
              {data.service && (
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
                    Serviço
                  </p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">
                    {data.service}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
                  Pedido
                </p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">
                  #{data.order.woo_order_id}
                </p>
              </div>
            </div>
          )}

          {data.timeline.length > 0 && (
            <div className="border-t border-slate-100">
              <TrackingTimeline events={data.timeline} />
            </div>
          )}
        </div>

        {data.label_url && (
          <div className="mt-3 text-right">
            <a
              href={data.label_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
            >
              Ver etiqueta PDF
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
