import { ScrollView, Pressable, Text } from 'react-native';
import type { ShipmentStatus } from '@woo-stock/shared-types';

const FILTERS: { label: string; value: ShipmentStatus | undefined }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Pendente', value: 'pending' },
  { label: 'Cotado', value: 'quoted' },
  { label: 'Etiqueta', value: 'label_generated' },
  { label: 'Postado', value: 'posted' },
  { label: 'Trânsito', value: 'in_transit' },
  { label: 'Entregue', value: 'delivered' },
  { label: 'Erro', value: 'error' },
];

interface Props {
  selected: ShipmentStatus | undefined;
  onSelect: (status: ShipmentStatus | undefined) => void;
}

export function ShipmentStatusFilter({ selected, onSelect }: Props) {
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
