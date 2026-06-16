import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { getTracking } from '@/lib/api/tracking';
import { queryKeys } from '@/lib/query-keys';
import { StatusProgress } from '@/components/tracking/StatusProgress';
import { StatusBanner } from '@/components/tracking/StatusBanner';
import { TrackingTimeline } from '@/components/tracking/TrackingTimeline';
import { CopyButton } from '@/components/ui/CopyButton';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function TrackingScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.tracking(code!),
    queryFn: () => getTracking(code!),
    enabled: !!code,
  });

  if (isLoading) return <LoadingIndicator />;

  if (error || !data) {
    return (
      <View className="flex-1 bg-slate-50 justify-center">
        <ErrorMessage
          message={
            error?.message ?? 'Código de rastreio não encontrado.'
          }
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <View className="px-4 py-6 gap-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-slate-400 uppercase tracking-wider">
              Código de Rastreio
            </Text>
            <Text className="font-mono text-base text-slate-900 mt-0.5">
              {data.tracking_code}
            </Text>
          </View>
          <CopyButton value={data.tracking_code} />
        </View>

        <StatusBanner
          status={data.current_status}
          estimatedDays={data.estimated_days}
        />

        <StatusProgress currentStatus={data.current_status} />

        <View className="bg-white rounded-lg border border-slate-200 p-4 gap-2">
          {data.carrier && (
            <Row label="Transportadora" value={data.carrier} />
          )}
          {data.service && (
            <Row label="Serviço" value={data.service} />
          )}
          <Row label="Pedido" value={`#${data.order.woo_order_id}`} />
          <Row label="Cliente" value={data.order.customer_name} />
        </View>

        {data.label_url && (
          <Pressable
            onPress={() => WebBrowser.openBrowserAsync(data.label_url!)}
            className="bg-white rounded-lg border border-slate-200 p-4 active:bg-slate-50"
          >
            <Text className="text-orange-600 text-sm font-medium">
              Baixar Etiqueta PDF →
            </Text>
          </Pressable>
        )}

        {data.timeline.length > 0 && (
          <View className="bg-white rounded-lg border border-slate-200 p-4">
            <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
              Histórico
            </Text>
            <TrackingTimeline events={data.timeline} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-xs text-slate-400">{label}</Text>
      <Text className="text-sm text-slate-700 font-medium">{value}</Text>
    </View>
  );
}
