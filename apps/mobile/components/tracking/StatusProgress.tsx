import { View, Text } from 'react-native';
import type { ShipmentStatus } from '@woo-stock/shared-types';

const STEPS: { key: ShipmentStatus; label: string }[] = [
  { key: 'quoted', label: 'Cotado' },
  { key: 'label_generated', label: 'Etiqueta' },
  { key: 'posted', label: 'Postado' },
  { key: 'in_transit', label: 'Trânsito' },
  { key: 'delivered', label: 'Entregue' },
];

const STATUS_ORDER: ShipmentStatus[] = [
  'pending',
  'quoted',
  'label_generated',
  'posted',
  'in_transit',
  'delivered',
];

function getStepIndex(status: ShipmentStatus): number {
  return STATUS_ORDER.indexOf(status);
}

interface Props {
  currentStatus: ShipmentStatus;
}

export function StatusProgress({ currentStatus }: Props) {
  const currentIndex = getStepIndex(currentStatus);

  return (
    <View className="flex-row items-center justify-between px-2">
      {STEPS.map((step, i) => {
        const stepIndex = getStepIndex(step.key);
        const isActive = currentIndex >= stepIndex;
        const isLast = i === STEPS.length - 1;

        return (
          <View key={step.key} className="flex-1 items-center">
            <View className="flex-row items-center w-full">
              <View
                className={`w-3 h-3 rounded-full ${
                  isActive ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
              {!isLast && (
                <View
                  className={`flex-1 h-0.5 ${
                    currentIndex > stepIndex ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </View>
            <Text
              className={`text-[10px] mt-1 ${
                isActive ? 'text-slate-700 font-medium' : 'text-slate-400'
              }`}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
