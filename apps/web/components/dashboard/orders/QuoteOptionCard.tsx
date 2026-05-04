import type { QuoteOption } from '@/types/shipping';

interface Props {
  option: QuoteOption;
  selected: boolean;
  onSelect: () => void;
}

export function QuoteOptionCard({ option, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 border transition-colors ${
        selected
          ? 'border-orange-500 bg-orange-50/50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {option.company_picture && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={option.company_picture}
              alt={option.carrier ?? option.service}
              className="w-8 h-8 object-contain shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {option.carrier ?? option.service}
            </p>
            <p className="text-xs text-slate-500 truncate">{option.service}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-slate-900">
            R$ {option.cost.toFixed(2)}
          </p>
          {option.estimated_days != null && (
            <p className="text-[11px] text-slate-400">{option.estimated_days} dias úteis</p>
          )}
        </div>
      </div>
    </button>
  );
}
