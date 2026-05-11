import type { OrderDetail, OrderStatus } from '@/types/order';

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

interface Props {
  order: OrderDetail;
}

export function OrderDetailCard({ order }: Props) {
  const addr = order.shipping_address;

  return (
    <div className="bg-white border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Pedido #{order.woo_order_id}
        </p>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 ${STATUS_STYLE[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="px-5 py-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-400">Cliente</span>
          <span className="text-sm text-slate-800">{order.customer_name}</span>
          <span className="text-xs text-slate-500">{order.customer_email}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-400">Endereço de Entrega</span>
          <span className="text-sm text-slate-800">
            {addr.street}
            {addr.complement ? `, ${addr.complement}` : ''}
          </span>
          <span className="text-xs text-slate-500">
            {addr.city} — {addr.state}, {addr.postcode}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-400">Peso Total</span>
          <span className="text-sm text-slate-800">{order.total_weight} kg</span>
        </div>
      </div>

      {order.items.length > 0 && (
        <div className="border-t border-slate-100">
          <div className="px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Itens
            </p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-1 font-medium">Produto</th>
                  <th className="pb-1 font-medium text-right">Qtd</th>
                  <th className="pb-1 font-medium text-right">Preço</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-1.5 text-slate-700">{item.name}</td>
                    <td className="py-1.5 text-right text-slate-500 tabular-nums">{item.qty}</td>
                    <td className="py-1.5 text-right text-slate-500 tabular-nums">
                      R$ {Number(item.price ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
