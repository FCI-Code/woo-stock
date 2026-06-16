import { View, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/lib/api/orders';
import { queryKeys } from '@/lib/query-keys';
import { OrderDetailCard } from '@/components/orders/OrderDetailCard';
import { QuoteFlow } from '@/components/orders/QuoteFlow';
import { ShipmentSummary } from '@/components/shipments/ShipmentSummary';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.orders.detail(id!),
    queryFn: () => getOrder(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingIndicator />;
  if (error || !order) {
    return (
      <ErrorMessage
        message={error?.message ?? 'Pedido não encontrado'}
        onRetry={refetch}
      />
    );
  }

  const hasShipment =
    order.shipment && order.shipment.status !== 'quoted';

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <View className="px-4 py-4 gap-4">
        <OrderDetailCard order={order} />

        {hasShipment ? (
          <ShipmentSummary shipment={order.shipment!} />
        ) : (
          <QuoteFlow orderId={order.id} />
        )}
      </View>
    </ScrollView>
  );
}
