import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { quoteShipping, generateLabel } from '@/lib/api/shipping';
import { QuoteOptionCard } from './QuoteOptionCard';
import { queryKeys } from '@/lib/query-keys';
import type { QuoteResult, QuoteOption } from '@woo-stock/shared-types';

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
  const queryClient = useQueryClient();
  const [state, setState] = useState<State>({ step: 'idle' });
  const [selectedOption, setSelectedOption] = useState<QuoteOption | null>(null);

  async function handleQuote() {
    setState({ step: 'quoting' });
    try {
      const result = await quoteShipping(orderId);
      setState({ step: 'quoted', result });
    } catch (e) {
      setState({
        step: 'error',
        message: e instanceof Error ? e.message : 'Erro ao cotar frete',
      });
    }
  }

  async function handleGenerateLabel() {
    if (state.step !== 'quoted' || !selectedOption) return;
    const quoteResult = state.result;
    setState({ step: 'generating', result: quoteResult, selected: selectedOption });
    try {
      const result = await generateLabel(orderId, {
        carrier: selectedOption.carrier ?? selectedOption.service,
        service: selectedOption.service,
      });
      setState({
        step: 'done',
        tracking_code: result.tracking_code,
        label_url: result.label_url,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
    } catch (e) {
      setState({
        step: 'error',
        message: e instanceof Error ? e.message : 'Erro ao gerar etiqueta',
      });
    }
  }

  if (state.step === 'done') {
    return (
      <View className="bg-white rounded-lg border border-slate-200 p-4 gap-3">
        <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Etiqueta Gerada
        </Text>
        <View className="bg-emerald-50 p-3 rounded">
          <Text className="text-emerald-700 text-sm">
            Etiqueta gerada com sucesso!
          </Text>
        </View>
        {state.tracking_code && (
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-slate-400">Rastreio:</Text>
            <Text className="font-mono text-sm text-slate-800">
              {state.tracking_code}
            </Text>
          </View>
        )}
        {state.label_url && (
          <Pressable
            onPress={() => WebBrowser.openBrowserAsync(state.label_url!)}
          >
            <Text className="text-orange-600 text-sm font-medium">
              Baixar Etiqueta PDF →
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (state.step === 'error') {
    return (
      <View className="bg-white rounded-lg border border-slate-200 p-4 gap-3">
        <View className="bg-red-50 p-3 rounded">
          <Text className="text-red-700 text-sm">{state.message}</Text>
        </View>
        <Pressable onPress={() => setState({ step: 'idle' })}>
          <Text className="text-slate-500 text-xs">← Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  if (state.step === 'quoted') {
    return (
      <View className="bg-white rounded-lg border border-slate-200 p-4 gap-3">
        <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Opções de Frete
        </Text>
        {state.result.options.map((option) => (
          <QuoteOptionCard
            key={option.id}
            option={option}
            selected={selectedOption?.id === option.id}
            onSelect={() => setSelectedOption(option)}
          />
        ))}
        <View className="flex-row items-center gap-3 pt-2">
          <Pressable
            onPress={handleGenerateLabel}
            disabled={!selectedOption}
            className="flex-1 h-11 bg-slate-900 rounded items-center justify-center active:bg-slate-700 disabled:opacity-50"
          >
            <Text className="text-white text-xs font-medium">
              Gerar Etiqueta
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setState({ step: 'idle' });
              setSelectedOption(null);
            }}
          >
            <Text className="text-slate-400 text-xs">Cancelar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg border border-slate-200 p-4">
      <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
        Envio
      </Text>
      {state.step === 'quoting' || state.step === 'generating' ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color="#0f172a" />
          <Text className="text-sm text-slate-500">
            {state.step === 'quoting' ? 'Cotando fretes…' : 'Gerando etiqueta…'}
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={handleQuote}
          className="h-11 bg-slate-900 rounded items-center justify-center active:bg-slate-700"
        >
          <Text className="text-white text-xs font-medium">Cotar Frete</Text>
        </Pressable>
      )}
    </View>
  );
}
