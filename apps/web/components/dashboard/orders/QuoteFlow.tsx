'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { quoteShipping, generateLabel } from '@/lib/shipping';
import { QuoteOptionCard } from './QuoteOptionCard';
import type { QuoteResult, QuoteOption } from '@/types/shipping';

type State =
  | { step: 'idle' }
  | { step: 'quoting' }
  | { step: 'quoted'; result: QuoteResult }
  | { step: 'generating'; result: QuoteResult; selected: QuoteOption }
  | { step: 'done'; tracking_code: string | null; label_url: string | null }
  | { step: 'error'; message: string };

interface Props {
  orderId: string;
}

export function QuoteFlow({ orderId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<State>({ step: 'idle' });

  function handleQuote() {
    setState({ step: 'quoting' });
    startTransition(async () => {
      const res = await quoteShipping(orderId);
      if ('error' in res) {
        setState({ step: 'error', message: res.error });
      } else {
        setState({ step: 'quoted', result: res.data });
      }
    });
  }

  function handleSelectOption(option: QuoteOption) {
    if (state.step !== 'quoted') return;
    setState({ step: 'quoted', result: state.result });
    setSelectedOption(option);
  }

  const [selectedOption, setSelectedOption] = useState<QuoteOption | null>(null);

  function handleGenerateLabel() {
    if (state.step !== 'quoted' || !selectedOption) return;
    const quoteResult = state.result;
    setState({ step: 'generating', result: quoteResult, selected: selectedOption });
    startTransition(async () => {
      const res = await generateLabel(orderId, {
        carrier: selectedOption.carrier ?? selectedOption.service,
        service: selectedOption.service,
      });
      if ('error' in res) {
        setState({ step: 'error', message: res.error });
      } else {
        setState({
          step: 'done',
          tracking_code: res.data.tracking_code,
          label_url: res.data.label_url,
        });
        router.refresh();
      }
    });
  }

  if (state.step === 'done') {
    return (
      <div className="bg-white border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Etiqueta Gerada
          </p>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2">
            Etiqueta gerada com sucesso!
          </div>
          {state.tracking_code && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Código de Rastreio</span>
              <span className="font-mono text-sm text-slate-800">{state.tracking_code}</span>
            </div>
          )}
          {state.label_url && (
            <a
              href={state.label_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-600 hover:text-orange-700 transition-colors"
            >
              Baixar Etiqueta PDF →
            </a>
          )}
        </div>
      </div>
    );
  }

  if (state.step === 'error') {
    return (
      <div className="bg-white border border-slate-200">
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="bg-red-50 text-red-700 text-sm px-3 py-2">{state.message}</div>
          <button
            onClick={() => setState({ step: 'idle' })}
            className="self-start text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (state.step === 'quoted') {
    const options = state.result.options;
    return (
      <div className="bg-white border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Opções de Frete
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {options.map((option) => (
            <QuoteOptionCard
              key={option.id}
              option={option}
              selected={selectedOption?.id === option.id}
              onSelect={() => setSelectedOption(option)}
            />
          ))}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={handleGenerateLabel}
            disabled={!selectedOption || isPending}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Gerando…' : 'Gerar Etiqueta'}
          </button>
          <button
            onClick={() => { setState({ step: 'idle' }); setSelectedOption(null); }}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Envio
        </p>
      </div>
      <div className="px-5 py-4">
        {(state.step === 'quoting' || state.step === 'generating') ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            {state.step === 'quoting' ? 'Cotando fretes…' : 'Gerando etiqueta…'}
          </div>
        ) : (
          <button
            onClick={handleQuote}
            disabled={isPending}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cotar Frete
          </button>
        )}
      </div>
    </div>
  );
}
