import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { TenantProfile, TenantRegistrationResponse } from '@woo-stock/shared-types';
import { getStoredApiKey, setStoredApiKey, deleteStoredApiKey } from '@/lib/api-client';
import { validateApiKey, registerTenant } from '@/lib/api/auth';

interface AuthState {
  apiKey: string | null;
  tenant: TenantProfile | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (apiKey: string) => Promise<void>;
  register: (name: string | undefined, storeUrl: string) => Promise<TenantRegistrationResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    apiKey: null,
    tenant: null,
    isLoading: true,
  });

  useEffect(() => {
    (async () => {
      const storedKey = await getStoredApiKey();
      if (!storedKey) {
        setState({ apiKey: null, tenant: null, isLoading: false });
        return;
      }
      try {
        const tenant = await validateApiKey(storedKey);
        setState({ apiKey: storedKey, tenant, isLoading: false });
      } catch {
        await deleteStoredApiKey();
        setState({ apiKey: null, tenant: null, isLoading: false });
      }
    })();
  }, []);

  const login = useCallback(async (apiKey: string) => {
    const tenant = await validateApiKey(apiKey);
    await setStoredApiKey(apiKey);
    setState({ apiKey, tenant, isLoading: false });
  }, []);

  const register = useCallback(
    async (name: string | undefined, storeUrl: string) => {
      const result = await registerTenant({
        name: name || undefined,
        store_url: storeUrl,
      });
      return result;
    },
    [],
  );

  const logout = useCallback(async () => {
    await deleteStoredApiKey();
    setState({ apiKey: null, tenant: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
