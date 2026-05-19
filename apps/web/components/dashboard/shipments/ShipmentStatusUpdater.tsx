'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ShipmentStatus } from '@/types/tracking';
import { updateShipmentStatus } from '@/lib/shipments';

const STATUS_OPTIONS: { value: ShipmentStatus; label: string }[] = [
  { value: 'quoted', label: 'Cotado' },
  { value: 'label_generated', label: 'Etiqueta Gerada' },
  { value: 'posted', label: 'Postado' },
  { value: 'in_transit', label: 'Em Trânsito' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'error', label: 'Erro' },
];

const STATUS_DESCRIPTIONS: Record<ShipmentStatus, string> = {
  pending: 'Pedido está pronto pra envio',
  quoted: 'Frete foi cotado',
  label_generated: 'Etiqueta foi gerada',
  posted: 'Pacote foi postado',
  in_transit: 'Pacote está em trânsito',
  delivered: 'Pacote foi entregue',
  error: 'Ocorreu um erro no envio',
};

interface Props {
  shipmentId: string;
  currentStatus: ShipmentStatus;
  apiKey: string;
  onStatusUpdated?: () => void;
}

export function ShipmentStatusUpdater({
  shipmentId,
  currentStatus,
  apiKey,
  onStatusUpdated,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus>(currentStatus);
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (selectedStatus === currentStatus) {
      setError('Selecione um status diferente do atual');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const description = STATUS_DESCRIPTIONS[selectedStatus];
      await updateShipmentStatus(apiKey, shipmentId, selectedStatus, description, location);
      setSuccess(true);
      setIsOpen(false);
      setLocation('');
      setSelectedStatus(selectedStatus);
        onStatusUpdated?.();
        try { router.refresh(); } catch (e) { /* ignore */ }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200">
      <div className="px-5 py-4 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Atualizar Status
        </p>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-700 transition-colors"
        >
          {isOpen ? 'Cancelar' : 'Mudar Status'}
        </button>
      </div>

      {(success || error) && (
        <div className={`px-5 py-3 text-sm ${success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {success && '✓ Status atualizado com sucesso!'}
          {error && `✕ ${error}`}
        </div>
      )}

      {isOpen && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/40 sm:px-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:pr-2">
              <label className="text-xs text-slate-400 font-medium mb-2 block">
                Novo Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ShipmentStatus)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-200 bg-white text-sm text-slate-900 disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:pl-2">
              <label className="text-xs text-slate-400 font-medium mb-2 block">
                Localização (opcional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: São Paulo, SP"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-slate-900 text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
