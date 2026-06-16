import { ScrollView, Pressable, Text } from 'react-native';
import type { OrderStatus } from '@woo-stock/shared-types';

const FILTERS: { label: string; value: OrderStatus | undefined }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Recebido', value: 'received' },
  { label: 'Cotando', value: 'quoting' },
  { label: 'Pronto', value: 'ready_to_ship' },
  { label: 'Enviado', value: 'shipped' },
  { label: 'Trânsito', value: 'in_transit' },
  { label: 'Entregue', value: 'delivered' },
  { label: 'Erro', value: 'error' },
];

interface Props {
  selected: OrderStatus | undefined;
  onSelect: (status: OrderStatus | undefined) => void;
}

export function OrderStatusFilter({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 py-2"
      contentContainerStyle={{ gap: 8 }}
    >
      {FILTERS.map((f) => {
        const isActive = selected === f.value;
        return (
          <Pressable
            key={f.label}
            onPress={() => onSelect(f.value)}
            className={`px-3 py-1.5 rounded-full border ${
              isActive
                ? 'bg-slate-900 border-slate-900'
                : 'bg-white border-slate-200'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isActive ? 'text-white' : 'text-slate-600'
              }`}
            >
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
