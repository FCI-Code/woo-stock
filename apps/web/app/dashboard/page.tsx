import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logout } from '@/lib/auth';
import { getTenantProfile } from '@/lib/tenant';
import { getShipments } from '@/lib/shipments';
import { TenantConfig } from '@/components/dashboard/TenantConfig';
import { ShipmentsList } from '@/components/dashboard/ShipmentsList';

export const metadata: Metadata = {
  title: 'Dashboard — WooStock',
};

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

function maskApiKey(key: string) {
  if (key.length < 20) return '****';
  return key.slice(0, 14) + '••••••••' + key.slice(-4);
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get('wsk_api_key')?.value;

  if (!apiKey) redirect('/login');

  const [tenant, shipments] = await Promise.all([
    getTenantProfile(apiKey).catch(() => null),
    getShipments(apiKey).catch(() => []),
  ]);

  if (!tenant) redirect('/login');

  const webhookUrl = `${API_URL}/webhooks/woocommerce/${tenant.id}`;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-widest uppercase text-slate-900 font-mono">
            WooStock
          </span>
          {tenant.name && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-xs text-slate-500">{tenant.name}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Rastreamento
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="lg:w-80 shrink-0">
          <TenantConfig
            tenant={tenant}
            maskedApiKey={maskApiKey(apiKey)}
            webhookUrl={webhookUrl}
          />
        </div>

        <div className="flex-1 min-w-0">
          <ShipmentsList shipments={shipments} />
        </div>
      </div>
    </main>
  );
}
