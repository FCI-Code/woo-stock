import { View, Text, Pressable } from 'react-native';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: Props) {
  return (
    <View className="mx-4 my-4 p-4 bg-red-50 rounded-lg">
      <Text className="text-red-700 text-sm">{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} className="mt-3">
          <Text className="text-red-600 text-xs font-medium">
            Tentar novamente
          </Text>
        </Pressable>
      )}
    </View>
  );
}
