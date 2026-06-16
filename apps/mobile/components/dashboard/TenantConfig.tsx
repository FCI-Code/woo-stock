import { View, Text } from 'react-native';
import type { TenantProfile } from '@woo-stock/shared-types';
import { CopyButton } from '@/components/ui/CopyButton';
import { API_URL } from '@/constants/api';

interface Props {
  tenant: TenantProfile;
}

export function TenantConfig({ tenant }: Props) {
  const webhookUrl = `${API_URL}/webhooks/woocommerce/${tenant.id}`;

  return (
    <View className="bg-white rounded-lg border border-slate-200 p-4 gap-3">
      <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Configuração da Loja
      </Text>

      <Row label="URL da Loja" value={tenant.store_url} />
      <Row label="CEP Origem" value={tenant.origin_zip ?? 'Não configurado'} />
      <Row
        label="Status"
        value={tenant.status === 'active' ? 'Ativo' : 'Inativo'}
      />

      <View>
        <Text className="text-xs text-slate-400 mb-1">Webhook URL</Text>
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 font-mono text-xs text-slate-600 mr-2" numberOfLines={1}>
            {webhookUrl}
          </Text>
          <CopyButton value={webhookUrl} />
        </View>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-xs text-slate-400">{label}</Text>
      <Text className="text-sm text-slate-700">{value}</Text>
    </View>
  );
}
