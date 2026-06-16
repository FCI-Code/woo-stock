import { useQuery } from '@tanstack/react-query';
import { getTenantProfile } from '@/lib/api/tenant';
import { queryKeys } from '@/lib/query-keys';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function SettingsScreen() {
  const { data: tenant, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.tenant,
    queryFn: getTenantProfile,
  });

  if (isLoading) return <LoadingIndicator />;
  if (error || !tenant) {
    return (
      <ErrorMessage
        message={error?.message ?? 'Erro ao carregar configurações'}
        onRetry={refetch}
      />
    );
  }

  return <SettingsForm tenant={tenant} />;
}
