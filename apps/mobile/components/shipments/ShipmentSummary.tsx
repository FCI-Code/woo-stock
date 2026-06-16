import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import type { Shipment } from '@woo-stock/shared-types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CopyButton } from '@/components/ui/CopyButton';

interface Props {
  shipment: Shipment;
}

export function ShipmentSummary({ shipment }: Props) {
  return (
    <Pressable
      onPress={() => router.push(`/(dashboard)/shipments/${shipment.id}`)}
      className="bg-white rounded-lg border border-slate-200 p-4 gap-2 active:bg-slate-50"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Envio
        </Text>
        <StatusBadge status={shipment.status} />
      </View>

      {shipment.tracking_code && (
        <View className="flex-row items-center justify-between">
          <Text className="font-mono text-sm text-slate-700">
            {shipment.tracking_code}
          </Text>
          <CopyButton value={shipment.tracking_code} />
        </View>
      )}

      {shipment.carrier && (
        <Text className="text-xs text-slate-500">
          {shipment.carrier} — {shipment.service}
        </Text>
      )}

      <Text className="text-xs text-orange-600 font-medium mt-1">
        Ver detalhes →
      </Text>
    </Pressable>
  );
}
