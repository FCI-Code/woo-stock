import type { TimelineEvent } from '@/types/tracking';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month} ${hours}:${minutes}`;
}

interface Props {
  events: TimelineEvent[];
}

export function TrackingTimeline({ events }: Props) {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
  );

  return (
    <div className="px-5 py-4">
      <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-4">
        Histórico de Eventos
      </p>

      <div className="divide-y divide-slate-100">
        {sorted.map((event, i) => (
          <div key={i} className="flex gap-4 py-3">
            <span className="text-xs text-slate-400 tabular-nums shrink-0 w-24 pt-px">
              {formatDate(event.occurred_at)}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-slate-800 leading-snug">
                {event.description}
                {event.type === 'preparation' && (
                  <span className="ml-1.5 text-[10px] text-slate-400 font-normal">
                    (preparação)
                  </span>
                )}
              </p>
              {event.location && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {event.location}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
