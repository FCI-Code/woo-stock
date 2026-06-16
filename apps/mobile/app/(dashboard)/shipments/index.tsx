import { useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { ShipmentStatus } from '@woo-stock/shared-types';
import { getShipments } from '@/lib/api/shipments';
import { queryKeys } from '@/lib/query-keys';
import { ShipmentStatusFilter } from '@/components/shipments/ShipmentStatusFilter';
import { ShipmentCard } from '@/components/shipments/ShipmentCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function ShipmentsScreen() {
  const [status, setStatus] = useState<ShipmentStatus | undefined>();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.shipments.list(status),
    queryFn: () => getShipments(status),
  });

  if (error) {
    return <ErrorMessage message={error.message} onRetry={refetch} />;
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ShipmentStatusFilter selected={status} onSelect={setStatus} />

      {isLoading ? (
        <LoadingIndicator />
      ) : !data?.length ? (
        <EmptyState message="Nenhum envio encontrado" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ShipmentCard shipment={item} />}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      )}
    </View>
  );
}
