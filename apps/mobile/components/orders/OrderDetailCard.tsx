import { View, Text } from 'react-native';
import type { OrderDetail } from '@woo-stock/shared-types';

interface Props {
  order: OrderDetail;
}

export function OrderDetailCard({ order }: Props) {
  const addr = order.shipping_address;

  return (
    <View className="bg-white rounded-lg border border-slate-200 p-4 gap-4">
      <Section title="Cliente">
        <Text className="text-sm text-slate-700">{order.customer_name}</Text>
        <Text className="text-xs text-slate-500">{order.customer_email}</Text>
      </Section>

      <Section title="Endereço de Entrega">
        <Text className="text-sm text-slate-700">{addr.street}</Text>
        {addr.complement ? (
          <Text className="text-xs text-slate-500">{addr.complement}</Text>
        ) : null}
        <Text className="text-xs text-slate-500">
          {addr.city}, {addr.state} - {addr.postcode}
        </Text>
      </Section>

      <Section title="Itens">
        {order.items.map((item, i) => (
          <View key={i} className="flex-row justify-between py-1">
            <Text className="flex-1 text-xs text-slate-700" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-xs text-slate-500 ml-2">
              {item.qty}x R$ {item.price.toFixed(2)}
            </Text>
          </View>
        ))}
      </Section>

      <View className="flex-row justify-between pt-2 border-t border-slate-100">
        <Text className="text-xs text-slate-400">Peso total</Text>
        <Text className="text-sm text-slate-700 font-medium">
          {order.total_weight}g
        </Text>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
        {title}
      </Text>
      {children}
    </View>
  );
}
