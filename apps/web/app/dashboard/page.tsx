import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
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
    <div className="max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-6 lg:flex-row lg:items-start">
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
  );
}
