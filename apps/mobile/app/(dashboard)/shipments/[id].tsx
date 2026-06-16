import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { getShipment } from '@/lib/api/shipments';
import { queryKeys } from '@/lib/query-keys';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CopyButton } from '@/components/ui/CopyButton';
import { ShipmentEventTimeline } from '@/components/shipments/ShipmentEventTimeline';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function ShipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: shipment, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.shipments.detail(id!),
    queryFn: () => getShipment(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingIndicator />;
  if (error || !shipment) {
    return (
      <ErrorMessage
        message={error?.message ?? 'Envio não encontrado'}
        onRetry={refetch}
      />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <View className="px-4 py-4 gap-4">
        <View className="bg-white rounded-lg border border-slate-200 p-4 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Status
            </Text>
            <StatusBadge status={shipment.status} />
          </View>

          {shipment.tracking_code && (
            <View>
              <Text className="text-xs text-slate-400 mb-1">
                Código de Rastreio
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="font-mono text-sm text-slate-800">
                  {shipment.tracking_code}
                </Text>
                <CopyButton value={shipment.tracking_code} />
              </View>
            </View>
          )}

          {shipment.carrier && (
            <Row label="Transportadora" value={shipment.carrier} />
          )}
          {shipment.service && (
            <Row label="Serviço" value={shipment.service} />
          )}
          {shipment.shipping_cost != null && (
            <Row
              label="Custo"
              value={`R$ ${shipment.shipping_cost.toFixed(2)}`}
            />
          )}
          {shipment.estimated_days != null && (
            <Row
              label="Prazo Estimado"
              value={`${shipment.estimated_days} dias úteis`}
            />
          )}

          <Pressable
            onPress={() =>
              router.push(`/(dashboard)/orders/${shipment.order_id}`)
            }
          >
            <Text className="text-orange-600 text-xs font-medium">
              Ver pedido →
            </Text>
          </Pressable>
        </View>

        {shipment.label_url && (
          <Pressable
            onPress={() => WebBrowser.openBrowserAsync(shipment.label_url!)}
            className="bg-white rounded-lg border border-slate-200 p-4 active:bg-slate-50"
          >
            <Text className="text-orange-600 text-sm font-medium">
              Baixar Etiqueta PDF →
            </Text>
          </Pressable>
        )}

        {shipment.events.length > 0 && (
          <View className="bg-white rounded-lg border border-slate-200 p-4">
            <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
              Linha do Tempo
            </Text>
            <ShipmentEventTimeline events={shipment.events} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-xs text-slate-400">{label}</Text>
      <Text className="text-sm text-slate-700">{value}</Text>
    </View>
  );
}
