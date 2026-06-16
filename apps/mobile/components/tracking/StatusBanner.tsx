import { View, Text } from 'react-native';
import type { ShipmentStatus } from '@woo-stock/shared-types';
import { STATUS_LABELS } from '@/constants/colors';

interface Props {
  status: ShipmentStatus;
  estimatedDays: number | null;
}

export function StatusBanner({ status, estimatedDays }: Props) {
  const isDelivered = status === 'delivered';

  return (
    <View
      className={`p-4 rounded-lg ${isDelivered ? 'bg-emerald-50' : 'bg-orange-50'}`}
    >
      <Text
        className={`text-lg font-bold ${
          isDelivered ? 'text-emerald-700' : 'text-orange-700'
        }`}
      >
        {STATUS_LABELS[status] ?? status}
      </Text>
      {estimatedDays && !isDelivered ? (
        <Text className="text-sm text-slate-500 mt-1">
          Previsão: {estimatedDays} dias úteis
        </Text>
      ) : null}
    </View>
  );
}
