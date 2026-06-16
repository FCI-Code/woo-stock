import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { Shipment } from '@woo-stock/shared-types';
import { useAuth } from '@/contexts/auth-context';
import { getShipments } from '@/lib/api/shipments';
import { queryKeys } from '@/lib/query-keys';
import { TenantConfig } from '@/components/dashboard/TenantConfig';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';

export default function DashboardHomeScreen() {
  const { tenant, logout } = useAuth();

  const {
    data: shipments,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: queryKeys.shipments.all,
    queryFn: () => getShipments(),
  });

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <View className="px-4 py-4 gap-4">
        {tenant && <TenantConfig tenant={tenant} />}

        <View className="bg-white rounded-lg border border-slate-200 p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Envios Recentes
            </Text>
            <Pressable onPress={() => router.push('/(dashboard)/shipments')}>
              <Text className="text-xs text-orange-600 font-medium">
                Ver todos
              </Text>
            </Pressable>
          </View>

          {isLoading ? (
            <LoadingIndicator />
          ) : !shipments?.length ? (
            <Text className="text-sm text-slate-400 py-4 text-center">
              Nenhum envio ainda
            </Text>
          ) : (
            <View className="gap-2">
              {shipments.slice(0, 5).map((s: Shipment) => (
                <Pressable
                  key={s.id}
                  onPress={() =>
                    router.push(`/(dashboard)/shipments/${s.id}`)
                  }
                  className="flex-row items-center justify-between py-2 border-b border-slate-50 active:bg-slate-50"
                >
                  <View className="flex-1 mr-2">
                    <Text className="font-mono text-xs text-slate-700" numberOfLines={1}>
                      {s.tracking_code ?? '—'}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">
                      {s.carrier ?? ''} {s.service ?? ''}
                    </Text>
                  </View>
                  <StatusBadge status={s.status} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Pressable
          onPress={logout}
          className="items-center py-3"
        >
          <Text className="text-red-500 text-sm font-medium">Sair</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
