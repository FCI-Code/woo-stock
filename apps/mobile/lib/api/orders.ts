import { apiFetch } from '@/lib/api-client';
import type { OrdersPage, OrderDetail, OrderStatus } from '@woo-stock/shared-types';

export function getOrders(params?: {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}): Promise<OrdersPage> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  return apiFetch<OrdersPage>(`/orders${query ? `?${query}` : ''}`);
}

export function getOrder(id: string): Promise<OrderDetail> {
  return apiFetch<OrderDetail>(`/orders/${id}`);
}
