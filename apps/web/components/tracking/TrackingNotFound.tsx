import Link from 'next/link';

interface Props {
  trackingCode: string;
}

export function TrackingNotFound({ trackingCode }: Props) {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-5 py-3">
        <span className="text-xs font-bold tracking-widest uppercase text-slate-900 font-mono">
          WooStock
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <p className="text-6xl font-black text-slate-200 mb-4">404</p>
          <p className="text-slate-700 font-medium mb-1">
            Código não encontrado
          </p>
          <p className="text-sm text-slate-400 mb-6">
            Não localizamos nenhum envio com o código{' '}
            <span className="font-mono text-slate-600">{trackingCode}</span>.
            Verifique se o código está correto.
          </p>
          <Link
            href="/"
            className="inline-block text-sm font-medium text-slate-900 border border-slate-300 px-5 py-2 hover:bg-slate-100 transition-colors"
          >
            Tentar outro código
          </Link>
        </div>
      </div>
    </main>
  );
}
