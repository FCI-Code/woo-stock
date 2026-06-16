import { useState } from 'react';
import { View, FlatList, RefreshControl, Pressable, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { OrderStatus } from '@woo-stock/shared-types';
import { getOrders } from '@/lib/api/orders';
import { queryKeys } from '@/lib/query-keys';
import { OrderStatusFilter } from '@/components/orders/OrderStatusFilter';
import { OrderCard } from '@/components/orders/OrderCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const PAGE_SIZE = 20;

export default function OrdersScreen() {
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.orders.list({ status, page }),
    queryFn: () => getOrders({ status, page, limit: PAGE_SIZE }),
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  function handleStatusChange(newStatus: OrderStatus | undefined) {
    setStatus(newStatus);
    setPage(1);
  }

  if (error) {
    return <ErrorMessage message={error.message} onRetry={refetch} />;
  }

  return (
    <View className="flex-1 bg-slate-50">
      <OrderStatusFilter selected={status} onSelect={handleStatusChange} />

      {isLoading ? (
        <LoadingIndicator />
      ) : !data?.items.length ? (
        <EmptyState message="Nenhum pedido encontrado" />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListFooterComponent={
            totalPages > 1 ? (
              <View className="flex-row items-center justify-center gap-4 py-4">
                <Pressable
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-white rounded border border-slate-200 disabled:opacity-40"
                >
                  <Text className="text-xs text-slate-600">Anterior</Text>
                </Pressable>
                <Text className="text-xs text-slate-500">
                  {page} / {totalPages}
                </Text>
                <Pressable
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-white rounded border border-slate-200 disabled:opacity-40"
                >
                  <Text className="text-xs text-slate-600">Próxima</Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
