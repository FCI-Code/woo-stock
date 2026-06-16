import { View, Text } from 'react-native';

interface Props {
  message: string;
}

export function EmptyState({ message }: Props) {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <Text className="text-slate-400 text-sm">{message}</Text>
    </View>
  );
}
