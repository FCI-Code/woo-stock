import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';

export default function LoginScreen() {
  const { login } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const trimmed = apiKey.trim();
    if (!trimmed) return;

    setError('');
    setLoading(true);
    try {
      await login(trimmed);
      router.replace('/(dashboard)/(home)');
    } catch {
      setError('Chave de API inválida. Verifique e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-bold text-slate-900 mb-2">
          Acessar Dashboard
        </Text>
        <Text className="text-sm text-slate-500 mb-6">
          Insira sua chave de API gerada no cadastro.
        </Text>

        {error ? (
          <View className="mb-4 p-3 bg-red-50 rounded">
            <Text className="text-red-700 text-sm">{error}</Text>
          </View>
        ) : null}

        <Text className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
          Chave de API
        </Text>
        <TextInput
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="wsk_live_..."
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          returnKeyType="go"
          onSubmitEditing={handleLogin}
          className="h-12 px-4 bg-white rounded border border-slate-200 text-slate-900 font-mono text-sm"
        />

        <Pressable
          onPress={handleLogin}
          disabled={loading || !apiKey.trim()}
          className="mt-4 h-12 bg-slate-900 rounded items-center justify-center active:bg-slate-700 disabled:opacity-50"
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-semibold text-sm">Entrar</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push('/(public)/register')}
          className="mt-4 items-center"
        >
          <Text className="text-slate-500 text-sm">
            Não tem conta?{' '}
            <Text className="text-orange-600 font-medium">Criar conta</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
