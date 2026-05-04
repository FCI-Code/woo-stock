import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/auth';
import { getTenantProfile } from '@/lib/tenant';
import { NavLinks } from '@/components/dashboard/NavLinks';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get('wsk_api_key')?.value;
  if (!apiKey) redirect('/login');

  const tenant = await getTenantProfile(apiKey).catch(() => null);
  if (!tenant) redirect('/login');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-5 py-3 flex items-center justify-between shrink-0">
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
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Rastreamento
          </Link>
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

      <div className="flex flex-1 min-h-0">
        <nav className="hidden md:flex flex-col w-48 shrink-0 border-r border-slate-200 bg-white pt-4 pb-6 px-2 gap-0.5">
          <NavLinks />
        </nav>
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
