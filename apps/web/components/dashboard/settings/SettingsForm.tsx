'use client';

import { useState, useTransition } from 'react';
import { updateTenant } from '@/lib/tenant-actions';
import type { TenantProfile } from '@/types/tenant';

interface Props {
  tenant: TenantProfile;
}

export function SettingsForm({ tenant }: Props) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: true } | { error: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const res = await updateTenant(formData);
      setResult(res);
    });
  }

  return (
    <form action={handleSubmit} className="bg-white border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Configurações da Loja
        </p>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Nome da Loja"
            name="name"
            defaultValue={tenant.name ?? ''}
            placeholder="Minha Loja"
          />
          <Field
            label="URL da Loja"
            name="store_url"
            defaultValue={tenant.store_url}
            placeholder="https://minha-loja.com"
            type="url"
          />
        </div>

        <Field
          label="CEP de Origem"
          name="origin_zip"
          defaultValue={tenant.origin_zip ?? ''}
          placeholder="00000-000"
          hint="CEP usado para calcular fretes"
        />

        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Integração WooCommerce
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SecretField
              label="Consumer Key"
              name="woo_consumer_key"
              placeholder="ck_••••••••••••••••••••••"
            />
            <SecretField
              label="Consumer Secret"
              name="woo_consumer_secret"
              placeholder="cs_••••••••••••••••••••••"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Melhor Envio
          </p>
          <SecretField
            label="Token de Acesso"
            name="melhor_envio_token"
            placeholder="eyJ0eXAiOiJKV1QiLCJhbGci…"
            hint="Token de produção ou sandbox do Melhor Envio"
          />
        </div>

        {result && (
          <div
            className={`text-xs px-3 py-2 ${
              'ok' in result
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {'ok' in result ? 'Configurações salvas com sucesso.' : result.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="self-start px-5 py-2.5 bg-slate-900 text-white text-xs font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Salvando…' : 'Salvar Configurações'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = 'text',
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="px-3 py-2 bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-colors"
      />
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function SecretField({
  label,
  name,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <input
        type="password"
        name={name}
        placeholder={placeholder}
        autoComplete="off"
        className="px-3 py-2 bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-colors font-mono"
      />
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}
