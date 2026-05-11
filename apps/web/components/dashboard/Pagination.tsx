'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  total: number;
  page: number;
  limit: number;
}

export function Pagination({ total, page, limit }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`?${params.toString()}`);
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="text-xs px-3 py-1.5 border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Anterior
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => goTo(p)}
          className={`text-xs px-3 py-1.5 border transition-colors ${
            p === page
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="text-xs px-3 py-1.5 border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Próxima →
      </button>
    </div>
  );
}
