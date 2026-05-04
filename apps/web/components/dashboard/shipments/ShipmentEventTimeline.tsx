import type { ShipmentEvent } from '@/types/shipment';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  events: ShipmentEvent[];
}

export function ShipmentEventTimeline({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-slate-400">Nenhum evento registrado.</p>
      </div>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
  );

  return (
    <div className="divide-y divide-slate-100">
      {sorted.map((event) => (
        <div key={event.id} className="px-5 py-3 flex gap-4">
          <div className="w-32 shrink-0 text-[11px] text-slate-400 tabular-nums pt-0.5">
            {formatDateTime(event.occurred_at)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-800">{event.description}</p>
            {event.location && (
              <p className="text-xs text-slate-400 mt-0.5">{event.location}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
