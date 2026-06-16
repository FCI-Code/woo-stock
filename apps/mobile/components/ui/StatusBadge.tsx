import { View, Text } from 'react-native';
import { STATUS_COLORS, STATUS_LABELS } from '@/constants/colors';

interface Props {
  status: string;
}

export function StatusBadge({ status }: Props) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  const label = STATUS_LABELS[status] ?? status;

  return (
    <View className={`px-2.5 py-1 rounded-full ${colors.bg}`}>
      <Text className={`text-xs font-medium ${colors.text}`}>{label}</Text>
    </View>
  );
}
