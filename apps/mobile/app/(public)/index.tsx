import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';

export default function HomeScreen() {
  const { tenant } = useAuth();
  const [code, setCode] = useState('');

  function handleSearch() {
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/(public)/tracking/${trimmed}`);
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <Text className="text-3xl font-bold text-slate-900 text-center">
            WooStock
          </Text>
          <Text className="text-base text-slate-500 text-center mt-2 mb-8">
            Rastreie seu pedido
          </Text>

          <View className="bg-white rounded-lg border border-slate-200 p-4">
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Código de rastreio"
              placeholderTextColor="#94a3b8"
              autoCapitalize="characters"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              className="h-12 px-4 bg-slate-50 rounded border border-slate-200 text-slate-900 font-mono text-sm"
            />
            <Pressable
              onPress={handleSearch}
              className="mt-3 h-12 bg-slate-900 rounded items-center justify-center active:bg-slate-700"
            >
              <Text className="text-white font-semibold text-sm">
                Rastrear
              </Text>
            </Pressable>
          </View>

          <View className="mt-6 flex-row justify-center gap-4">
            {tenant ? (
              <Pressable onPress={() => router.replace('/(dashboard)/(home)')}>
                <Text className="text-orange-600 font-medium text-sm">
                  Ir para Dashboard
                </Text>
              </Pressable>
            ) : (
              <>
                <Pressable onPress={() => router.push('/(public)/login')}>
                  <Text className="text-orange-600 font-medium text-sm">
                    Entrar
                  </Text>
                </Pressable>
                <Pressable onPress={() => router.push('/(public)/register')}>
                  <Text className="text-slate-500 font-medium text-sm">
                    Criar conta
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
