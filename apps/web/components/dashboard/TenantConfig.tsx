import type { TenantProfile } from '@/types/tenant';
import { CopyButton } from '@/components/ui/CopyButton';

interface Props {
  tenant: TenantProfile;
  maskedApiKey: string;
  webhookUrl: string;
}

export function TenantConfig({ tenant, maskedApiKey, webhookUrl }: Props) {
  return (
    <div className="bg-white border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Configuração da loja
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        <ConfigRow label="URL da loja" value={tenant.store_url} />

        <div className="px-5 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
              API Key
            </p>
            <p className="text-sm font-mono text-slate-700 truncate">
              {maskedApiKey}
            </p>
          </div>
          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wide shrink-0">
            Oculto
          </span>
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Webhook URL
            </p>
            <CopyButton value={webhookUrl} />
          </div>
          <p className="text-sm font-mono text-slate-700 break-all">
            {webhookUrl}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Configure este endpoint no WooCommerce → Configurações → Avançado →
            Webhooks
          </p>
        </div>

        {tenant.origin_zip && (
          <ConfigRow label="CEP de origem" value={tenant.origin_zip} />
        )}

        <div className="px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Status
          </p>
          <span
            className={`inline-block text-xs font-semibold px-2 py-0.5 ${
              tenant.status === 'active'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {tenant.status === 'active' ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  );
}
