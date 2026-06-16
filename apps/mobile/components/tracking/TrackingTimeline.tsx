import { View, Text } from 'react-native';
import type { TimelineEvent } from '@woo-stock/shared-types';

interface Props {
  events: TimelineEvent[];
}

export function TrackingTimeline({ events }: Props) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
  );

  return (
    <View>
      {sorted.map((event, i) => {
        const isLast = i === sorted.length - 1;
        const date = new Date(event.occurred_at);

        return (
          <View key={`${event.occurred_at}-${i}`} className="flex-row">
            <View className="items-center mr-3">
              <View className="w-2.5 h-2.5 rounded-full bg-slate-400 mt-1" />
              {!isLast && <View className="w-0.5 flex-1 bg-slate-200" />}
            </View>
            <View className={`flex-1 ${!isLast ? 'pb-4' : ''}`}>
              <Text className="text-sm font-medium text-slate-800">
                {event.description}
              </Text>
              {event.location ? (
                <Text className="text-xs text-slate-500 mt-0.5">
                  {event.location}
                </Text>
              ) : null}
              <Text className="text-xs text-slate-400 mt-0.5">
                {date.toLocaleDateString('pt-BR')} às{' '}
                {date.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
