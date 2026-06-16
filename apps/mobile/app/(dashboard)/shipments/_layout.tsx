import { Stack } from 'expo-router';

export default function ShipmentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f8fafc' },
        headerTintColor: '#0f172a',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Envios' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhes do Envio' }} />
    </Stack>
  );
}
