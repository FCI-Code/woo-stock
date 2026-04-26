import Link from 'next/link';
import { cookies } from 'next/headers';
import { TrackingSearchForm } from '@/components/home/TrackingSearchForm';

export default async function HomePage() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get('wsk_api_key')?.value);

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-5 py-3 flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest uppercase text-slate-900 font-mono">
          WooStock
        </span>
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            Entrar
          </Link>
        )}
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <TrackingSearchForm isLoggedIn={isLoggedIn} />
      </div>
    </main>
  );
}
