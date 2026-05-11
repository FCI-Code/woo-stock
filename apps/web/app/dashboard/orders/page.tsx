import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getOrders } from '@/lib/orders';
import { OrdersTable } from '@/components/dashboard/orders/OrdersTable';
import { OrderStatusFilter } from '@/components/dashboard/orders/OrderStatusFilter';
import { Pagination } from '@/components/dashboard/Pagination';
import type { OrderStatus } from '@/types/order';

export const metadata: Metadata = {
  title: 'Pedidos — WooStock',
};

const VALID_STATUSES: OrderStatus[] = [
  'received',
  'quoting',
  'ready_to_ship',
  'shipped',
  'in_transit',
  'delivered',
  'error',
];

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function OrdersPage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get('wsk_api_key')?.value;
  if (!apiKey) redirect('/login');

  const { status: rawStatus, page: rawPage } = await searchParams;

  const status = VALID_STATUSES.includes(rawStatus as OrderStatus)
    ? (rawStatus as OrderStatus)
    : undefined;

  const page = Math.max(1, parseInt(rawPage ?? '1', 10) || 1);

  const data = await getOrders(apiKey, { status, page, limit: 20 }).catch(() => ({
    items: [],
    total: 0,
    page,
    limit: 20,
  }));

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Pedidos
        </p>
        <span className="text-xs text-slate-400">{data.total} total</span>
      </div>

      <Suspense fallback={null}>
        <OrderStatusFilter current={status} />
      </Suspense>

      <OrdersTable orders={data.items} />

      <Suspense fallback={null}>
        <Pagination total={data.total} page={data.page} limit={data.limit} />
      </Suspense>
    </div>
  );
}
