import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import type { Shipment } from '@woo-stock/shared-types';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Props {
  shipment: Shipment;
}

export function ShipmentCard({ shipment }: Props) {
  return (
    <Pressable
      onPress={() => router.push(`/(dashboard)/shipments/${shipment.id}`)}
      className="bg-white border border-slate-200 rounded-lg p-4 active:bg-slate-50"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-mono text-sm text-slate-800" numberOfLines={1}>
          {shipment.tracking_code ?? '—'}
        </Text>
        <StatusBadge status={shipment.status} />
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-slate-500">
          {shipment.carrier ?? ''} {shipment.service ?? ''}
        </Text>
        {shipment.shipping_cost != null && (
          <Text className="text-xs font-medium text-slate-700">
            R$ {shipment.shipping_cost.toFixed(2)}
          </Text>
        )}
      </View>
      <Text className="text-xs text-slate-400 mt-1">
        {new Date(shipment.created_at).toLocaleDateString('pt-BR')}
      </Text>
    </Pressable>
  );
}
