import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTenantProfile } from '@/lib/tenant';
import { SettingsForm } from '@/components/dashboard/settings/SettingsForm';

export const metadata: Metadata = {
  title: 'Configurações — WooStock',
};

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get('wsk_api_key')?.value;
  if (!apiKey) redirect('/login');

  const tenant = await getTenantProfile(apiKey).catch(() => null);
  if (!tenant) redirect('/login');

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-6">
      <SettingsForm tenant={tenant} />
    </div>
  );
}
