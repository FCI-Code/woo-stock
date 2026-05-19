import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getOrder } from '@/lib/orders';
import { OrderDetailCard } from '@/components/dashboard/orders/OrderDetailCard';
import { ShipmentSummary } from '@/components/dashboard/shipments/ShipmentSummary';
import { QuoteFlow } from '@/components/dashboard/orders/QuoteFlow';

export const metadata: Metadata = {
  title: 'Detalhe do Pedido — WooStock',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get('wsk_api_key')?.value;
  if (!apiKey) redirect('/login');

  const { id } = await params;
  const order = await getOrder(apiKey, id).catch(() => null);
  if (!order) notFound();

  const hasActiveShipment =
    (order.shipment !== null)

  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-6 flex flex-col gap-4">
      <Link
        href="/dashboard/orders"
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors self-start"
      >
        ← Voltar para Pedidos
      </Link>

      <OrderDetailCard order={order} />

      {hasActiveShipment ? (
        <ShipmentSummary shipment={order.shipment!} />
      ) : (
        <QuoteFlow orderId={order.id} />
      )}
    </div>
  );
}
