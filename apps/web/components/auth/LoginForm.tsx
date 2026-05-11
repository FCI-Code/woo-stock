'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login } from '@/lib/auth';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    void login(formData).then((result) => {
      if (result && 'error' in result) {
        setError(result.error);
        setPending(false);
      }
    });
  }

  return (
    <div className="w-full max-w-sm">
      <p className="text-[10px] font-bold tracking-widest uppercase text-orange-500 font-mono mb-6">
        WooStock
      </p>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Entrar</h1>
      <p className="text-sm text-slate-400 mb-8">
        Use a API key gerada no cadastro.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            API Key
          </label>
          <input
            name="api_key"
            type="password"
            required
            placeholder="wsk_live_..."
            autoComplete="current-password"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-colors font-mono"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="py-3 bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 mt-2"
        >
          {pending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-xs text-slate-400 mt-6">
        Não tem uma conta?{' '}
        <Link href="/register" className="text-slate-700 underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
