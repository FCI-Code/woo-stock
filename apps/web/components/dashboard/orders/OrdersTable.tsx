import Link from 'next/link';
import type { Order, OrderStatus } from '@/types/order';

const STATUS_LABEL: Record<OrderStatus, string> = {
  received: 'Recebido',
  quoting: 'Cotando',
  ready_to_ship: 'Pronto p/ Envio',
  shipped: 'Enviado',
  in_transit: 'Em Trânsito',
  delivered: 'Entregue',
  error: 'Erro',
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  received: 'bg-slate-100 text-slate-600',
  quoting: 'bg-amber-50 text-amber-700',
  ready_to_ship: 'bg-sky-50 text-sky-700',
  shipped: 'bg-orange-50 text-orange-700',
  in_transit: 'bg-orange-50 text-orange-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  error: 'bg-red-50 text-red-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

interface Props {
  orders: Order[];
}

export function OrdersTable({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="bg-white border border-slate-200 px-5 py-10 text-center">
        <p className="text-sm text-slate-400">Nenhum pedido encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Nº Pedido
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden sm:table-cell">
              Cliente
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Status
            </th>
            <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Data
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="font-mono text-xs text-orange-600 hover:text-orange-700 transition-colors font-medium"
                >
                  #{order.woo_order_id}
                </Link>
              </td>
              <td className="px-4 py-3 text-xs text-slate-700 hidden sm:table-cell">
                {order.customer_name}
              </td>
              <td className="px-4 py-3">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 ${STATUS_STYLE[order.status]}`}>
                  {STATUS_LABEL[order.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-400 text-right tabular-nums">
                {formatDate(order.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
