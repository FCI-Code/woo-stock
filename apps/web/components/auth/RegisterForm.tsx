'use client';

import { useState } from 'react';
import Link from 'next/link';
import { register, loginWithKey } from '@/lib/auth';
import { CopyButton } from '@/components/ui/CopyButton';
import type { TenantRegistrationResponse } from '@/types/tenant';

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [credentials, setCredentials] =
    useState<TenantRegistrationResponse | null>(null);
  const [entering, setEntering] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    void register(formData).then((result) => {
      if ('error' in result) {
        setError(result.error);
        setPending(false);
        return;
      }
      setCredentials(result.data);
      setPending(false);
    });
  }

  function handleEnter() {
    if (!credentials) return;
    setEntering(true);
    void loginWithKey(credentials.api_key).then((result) => {
      if (result && 'error' in result) {
        setError(result.error);
        setEntering(false);
      }
    });
  }

  if (credentials) {
    return (
      <div className="w-full max-w-lg">
        <div className="bg-emerald-50 border border-emerald-200 px-5 py-4 mb-6">
          <p className="text-sm font-semibold text-emerald-800 mb-1">
            Conta criada com sucesso.
          </p>
          <p className="text-xs text-emerald-700">
            Guarde as informações abaixo — a API key e o Webhook Secret{' '}
            <strong>não serão exibidos novamente</strong>.
          </p>
        </div>

        <div className="bg-white border border-slate-200 divide-y divide-slate-100">
          <CredentialRow
            label="API Key"
            value={credentials.api_key}
            mono
            sensitive
          />
          <CredentialRow
            label="Webhook Secret"
            value={credentials.webhook_secret}
            mono
            sensitive
          />
          <CredentialRow
            label="Webhook URL"
            value={credentials.webhook_url}
            mono
          />
        </div>

        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

        <button
          onClick={handleEnter}
          disabled={entering}
          className="mt-5 w-full py-3 bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {entering ? 'Entrando...' : 'Acessar Dashboard'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <p className="text-[10px] font-bold tracking-widest uppercase text-orange-500 font-mono mb-6">
        WooStock
      </p>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Criar conta</h1>
      <p className="text-sm text-slate-400 mb-8">
        Conecte sua loja WooCommerce ao WooStock.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Nome da loja
          </label>
          <input
            name="name"
            type="text"
            placeholder="Minha Loja"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            URL da loja <span className="text-red-500">*</span>
          </label>
          <input
            name="store_url"
            type="url"
            required
            placeholder="https://minhaloja.com"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="py-3 bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 mt-2"
        >
          {pending ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="text-xs text-slate-400 mt-6">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-slate-700 underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function CredentialRow({
  label,
  value,
  mono,
  sensitive,
}: {
  label: string;
  value: string;
  mono?: boolean;
  sensitive?: boolean;
}) {
  const [revealed, setRevealed] = useState(!sensitive);

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <div className="flex items-center gap-2">
          {sensitive && (
            <button
              onClick={() => setRevealed((r) => !r)}
              className="text-[10px] font-semibold tracking-wide uppercase text-slate-400 hover:text-slate-700 transition-colors"
            >
              {revealed ? 'Ocultar' : 'Revelar'}
            </button>
          )}
          <CopyButton value={value} />
        </div>
      </div>
      <p
        className={`text-sm break-all ${mono ? 'font-mono' : ''} ${!revealed ? 'blur-sm select-none' : 'text-slate-800'}`}
      >
        {value}
      </p>
    </div>
  );
}
