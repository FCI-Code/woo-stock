export const queryKeys = {
  tenant: ['tenant'] as const,
  orders: {
    all: ['orders'] as const,
    list: (params: { status?: string; page?: number }) =>
      ['orders', 'list', params] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  shipments: {
    all: ['shipments'] as const,
    list: (status?: string) => ['shipments', 'list', status] as const,
    detail: (id: string) => ['shipments', 'detail', id] as const,
  },
  tracking: (code: string) => ['tracking', code] as const,
};
