import { ActivityIndicator, View } from 'react-native';

export function LoadingIndicator() {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator size="large" color="#0f172a" />
    </View>
  );
}
