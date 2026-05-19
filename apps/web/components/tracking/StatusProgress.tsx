import type { ShipmentStatus } from '@/types/tracking';

const STEPS: { status: ShipmentStatus; label: string }[] = [
  { status: 'quoted', label: 'Cotado' },
  { status: 'label_generated', label: 'Etiqueta' },
  { status: 'posted', label: 'Postado' },
  { status: 'in_transit', label: 'Em Trânsito' },
  { status: 'delivered', label: 'Entregue' },
];

const STATUS_ORDER: Record<ShipmentStatus, number> = {
  pending: -1,
  quoted: 0,
  label_generated: 1,
  posted: 2,
  in_transit: 3,
  delivered: 4,
  error: -1,
};

interface Props {
  current: ShipmentStatus;
}

export function StatusProgress({ current }: Props) {
  if (current === 'pending') {
    return (
      <div className="px-5 py-3 border-b border-slate-100">
        <p className="text-xs text-slate-500 font-medium">
          Pedido recebido, aguardando processamento.
        </p>
      </div>
    );
  }

  if (current === 'error') {
    return (
      <div className="px-5 py-3 border-b border-slate-100">
        <p className="text-xs text-red-600 font-medium">
          Houve um problema com este envio.
        </p>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER[current];

  return (
    <div className="px-5 py-4 border-b border-slate-100">
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;

          return (
            <div key={step.status} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={[
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                    isDone
                      ? 'bg-slate-900 text-white'
                      : isActive
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-200 text-slate-400',
                  ].join(' ')}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span
                  className={[
                    'text-[9px] mt-1 text-center leading-tight hidden sm:block',
                    isActive
                      ? 'text-orange-600 font-semibold'
                      : isDone
                        ? 'text-slate-600'
                        : 'text-slate-300',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={[
                    'h-px flex-1 mx-1 mb-4 sm:mb-5',
                    i < currentIndex ? 'bg-slate-900' : 'bg-slate-200',
                  ].join(' ')}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
