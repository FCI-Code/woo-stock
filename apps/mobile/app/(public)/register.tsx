import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { CopyButton } from '@/components/ui/CopyButton';
import type { TenantRegistrationResponse } from '@woo-stock/shared-types';

export default function RegisterScreen() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<TenantRegistrationResponse | null>(null);
  const { register } = useAuth();

  async function handleRegister() {
    if (!storeUrl.trim()) return;

    setError('');
    setLoading(true);
    try {
      const result = await register(name.trim() || undefined, storeUrl.trim());
      setCredentials(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  async function handleAccessDashboard() {
    if (!credentials) return;
    setLoading(true);
    try {
      await login(credentials.api_key);
      router.replace('/(dashboard)/(home)');
    } catch {
      setError('Erro ao acessar dashboard');
      setLoading(false);
    }
  }

  if (credentials) {
    return (
      <ScrollView className="flex-1 bg-slate-50 px-6 pt-6">
        <View className="bg-emerald-50 p-4 rounded-lg mb-6">
          <Text className="text-emerald-700 text-sm font-medium">
            Conta criada com sucesso!
          </Text>
        </View>

        <View className="bg-amber-50 p-4 rounded-lg mb-6">
          <Text className="text-amber-700 text-xs">
            Salve estas credenciais agora. Elas não serão exibidas novamente.
          </Text>
        </View>

        <CredentialRow label="Chave de API" value={credentials.api_key} />
        <CredentialRow label="Webhook Secret" value={credentials.webhook_secret} />
        <CredentialRow label="Webhook URL" value={credentials.webhook_url} />

        <Pressable
          onPress={handleAccessDashboard}
          disabled={loading}
          className="mt-6 mb-12 h-12 bg-slate-900 rounded items-center justify-center active:bg-slate-700 disabled:opacity-50"
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-semibold text-sm">
              Acessar Dashboard
            </Text>
          )}
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-bold text-slate-900 mb-2">
          Criar Conta
        </Text>
        <Text className="text-sm text-slate-500 mb-6">
          Conecte sua loja WooCommerce ao WooStock.
        </Text>

        {error ? (
          <View className="mb-4 p-3 bg-red-50 rounded">
            <Text className="text-red-700 text-sm">{error}</Text>
          </View>
        ) : null}

        <Text className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
          Nome da Loja (opcional)
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Minha Loja"
          placeholderTextColor="#94a3b8"
          className="h-12 px-4 bg-white rounded border border-slate-200 text-slate-900 text-sm mb-4"
        />

        <Text className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
          URL da Loja *
        </Text>
        <TextInput
          value={storeUrl}
          onChangeText={setStoreUrl}
          placeholder="https://minhaloja.com.br"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          keyboardType="url"
          className="h-12 px-4 bg-white rounded border border-slate-200 text-slate-900 text-sm mb-6"
        />

        <Pressable
          onPress={handleRegister}
          disabled={loading || !storeUrl.trim()}
          className="h-12 bg-slate-900 rounded items-center justify-center active:bg-slate-700 disabled:opacity-50"
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-semibold text-sm">
              Criar Conta
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push('/(public)/login')}
          className="mt-4 mb-8 items-center"
        >
          <Text className="text-slate-500 text-sm">
            Já tem conta?{' '}
            <Text className="text-orange-600 font-medium">Entrar</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function CredentialRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-4 bg-white rounded-lg border border-slate-200 p-4">
      <Text className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
        {label}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 font-mono text-xs text-slate-700 mr-2" numberOfLines={1}>
          {value}
        </Text>
        <CopyButton value={value} />
      </View>
    </View>
  );
}
