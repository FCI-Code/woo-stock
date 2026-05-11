'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  isLoggedIn: boolean;
}

export function TrackingSearchForm({ isLoggedIn }: Props) {
  const router = useRouter();
  const [code, setCode] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) {
      router.push(`/tracking/${trimmed}`);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">
        Rastreie seu pedido
      </h1>
      <p className="text-sm text-slate-400 mb-8">
        Insira o código de rastreio enviado por e-mail.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: BR123456789BR"
          autoFocus
          className="flex-1 px-4 py-3 bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-colors font-mono"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors shrink-0"
        >
          Rastrear
        </button>
      </form>

      {!isLoggedIn && (
        <div className="mt-10 pt-6 border-t border-slate-200 flex items-center gap-4">
          <p className="text-xs text-slate-400">Você é lojista?</p>
          <Link
            href="/login"
            className="text-xs text-slate-600 font-medium hover:text-slate-900 transition-colors"
          >
            Acessar dashboard
          </Link>
          <Link
            href="/register"
            className="text-xs text-orange-500 font-medium hover:text-orange-700 transition-colors"
          >
            Criar conta
          </Link>
        </div>
      )}
    </div>
  );
}
