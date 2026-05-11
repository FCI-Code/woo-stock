import Link from 'next/link';

export function TrackingError() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-5 py-3">
        <span className="text-xs font-bold tracking-widest uppercase text-slate-900 font-mono">
          WooStock
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <p className="text-slate-700 font-medium mb-1">
            Serviço indisponível
          </p>
          <p className="text-sm text-slate-400 mb-6">
            Não foi possível consultar o status do seu pedido. Tente novamente
            em alguns instantes.
          </p>
          <Link
            href="/"
            className="inline-block text-sm font-medium text-slate-900 border border-slate-300 px-5 py-2 hover:bg-slate-100 transition-colors"
          >
            Voltar
          </Link>
        </div>
      </div>
    </main>
  );
}
