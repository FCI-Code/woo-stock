import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TenantProfile, TenantUpdatePayload } from '@woo-stock/shared-types';
import { updateTenant } from '@/lib/api/tenant';
import { queryKeys } from '@/lib/query-keys';

interface Props {
  tenant: TenantProfile;
}

export function SettingsForm({ tenant }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: tenant.name ?? '',
    store_url: tenant.store_url,
    origin_zip: tenant.origin_zip ?? '',
    woo_consumer_key: '',
    woo_consumer_secret: '',
    melhor_envio_token: '',
  });
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: TenantUpdatePayload) => updateTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  function handleSave() {
    const payload: TenantUpdatePayload = {};
    if (form.name) payload.name = form.name;
    if (form.store_url) payload.store_url = form.store_url;
    if (form.origin_zip) payload.origin_zip = form.origin_zip;
    if (form.woo_consumer_key) payload.woo_consumer_key = form.woo_consumer_key;
    if (form.woo_consumer_secret) payload.woo_consumer_secret = form.woo_consumer_secret;
    if (form.melhor_envio_token) payload.melhor_envio_token = form.melhor_envio_token;
    mutation.mutate(payload);
  }

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-slate-50"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        {success && (
          <View className="p-3 bg-emerald-50 rounded">
            <Text className="text-emerald-700 text-sm">
              Configurações salvas com sucesso!
            </Text>
          </View>
        )}
        {mutation.error && (
          <View className="p-3 bg-red-50 rounded">
            <Text className="text-red-700 text-sm">
              {mutation.error.message}
            </Text>
          </View>
        )}

        <Field
          label="Nome da Loja"
          value={form.name}
          onChangeText={(v) => updateField('name', v)}
        />
        <Field
          label="URL da Loja"
          value={form.store_url}
          onChangeText={(v) => updateField('store_url', v)}
          keyboardType="url"
          autoCapitalize="none"
        />
        <Field
          label="CEP de Origem"
          value={form.origin_zip}
          onChangeText={(v) => updateField('origin_zip', v)}
          keyboardType="numeric"
        />
        <Field
          label="WooCommerce Consumer Key"
          value={form.woo_consumer_key}
          onChangeText={(v) => updateField('woo_consumer_key', v)}
          secureTextEntry
          placeholder="ck_..."
          autoCapitalize="none"
        />
        <Field
          label="WooCommerce Consumer Secret"
          value={form.woo_consumer_secret}
          onChangeText={(v) => updateField('woo_consumer_secret', v)}
          secureTextEntry
          placeholder="cs_..."
          autoCapitalize="none"
        />
        <Field
          label="Token Melhor Envio"
          value={form.melhor_envio_token}
          onChangeText={(v) => updateField('melhor_envio_token', v)}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable
          onPress={handleSave}
          disabled={mutation.isPending}
          className="h-12 bg-slate-900 rounded items-center justify-center active:bg-slate-700 disabled:opacity-50"
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-semibold text-sm">Salvar</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  ...inputProps
}: {
  label: string;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View>
      <Text className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#94a3b8"
        className="h-12 px-4 bg-white rounded border border-slate-200 text-slate-900 text-sm"
        {...inputProps}
      />
    </View>
  );
}
