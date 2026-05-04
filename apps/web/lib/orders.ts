import type { OrdersPage, OrderDetail, OrderStatus } from '@/types/order';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export async function getOrders(
  apiKey: string,
  params?: { status?: OrderStatus; page?: number; limit?: number },
): Promise<OrdersPage> {
  const url = new URL(`${API_URL}/orders`);
  if (params?.status) url.searchParams.set('status', params.status);
  if (params?.page) url.searchParams.set('page', String(params.page));
  if (params?.limit) url.searchParams.set('limit', String(params.limit));

  const res = await fetch(url.toString(), {
    headers: { 'X-API-Key': apiKey },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch orders');

  return res.json() as Promise<OrdersPage>;
}

export async function getOrder(apiKey: string, id: string): Promise<OrderDetail> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: { 'X-API-Key': apiKey },
    next: { tags: ['order', id] },
  });

  if (!res.ok) throw new Error('Failed to fetch order');

  return res.json() as Promise<OrderDetail>;
}
