export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  received: { bg: 'bg-slate-100', text: 'text-slate-700' },
  pending: { bg: 'bg-slate-100', text: 'text-slate-700' },
  quoting: { bg: 'bg-amber-50', text: 'text-amber-700' },
  quoted: { bg: 'bg-amber-50', text: 'text-amber-700' },
  ready_to_ship: { bg: 'bg-amber-50', text: 'text-amber-700' },
  label_generated: { bg: 'bg-amber-50', text: 'text-amber-700' },
  posted: { bg: 'bg-sky-50', text: 'text-sky-700' },
  shipped: { bg: 'bg-sky-50', text: 'text-sky-700' },
  in_transit: { bg: 'bg-orange-50', text: 'text-orange-700' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  error: { bg: 'bg-red-50', text: 'text-red-700' },
};

export const STATUS_LABELS: Record<string, string> = {
  received: 'Recebido',
  pending: 'Pendente',
  quoting: 'Cotando',
  quoted: 'Cotado',
  ready_to_ship: 'Pronto p/ Envio',
  label_generated: 'Etiqueta Gerada',
  posted: 'Postado',
  shipped: 'Enviado',
  in_transit: 'Em Trânsito',
  delivered: 'Entregue',
  error: 'Erro',
};
