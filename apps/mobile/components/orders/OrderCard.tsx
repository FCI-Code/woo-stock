import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import type { Order } from '@woo-stock/shared-types';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Props {
  order: Order;
}

export function OrderCard({ order }: Props) {
  return (
    <Pressable
      onPress={() => router.push(`/(dashboard)/orders/${order.id}`)}
      className="bg-white border border-slate-200 rounded-lg p-4 active:bg-slate-50"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-semibold text-slate-900">
          Pedido #{order.woo_order_id}
        </Text>
        <StatusBadge status={order.status} />
      </View>
      <Text className="text-xs text-slate-500">{order.customer_name}</Text>
      <Text className="text-xs text-slate-400 mt-0.5">
        {new Date(order.created_at).toLocaleDateString('pt-BR')}
      </Text>
    </Pressable>
  );
}
