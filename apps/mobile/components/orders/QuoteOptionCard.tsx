import { View, Text, Pressable, Image } from 'react-native';
import type { QuoteOption } from '@woo-stock/shared-types';

interface Props {
  option: QuoteOption;
  selected: boolean;
  onSelect: () => void;
}

export function QuoteOptionCard({ option, selected, onSelect }: Props) {
  return (
    <Pressable
      onPress={onSelect}
      className={`flex-row items-center p-4 rounded-lg border ${
        selected ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
      }`}
    >
      {option.company_picture && (
        <Image
          source={{ uri: option.company_picture }}
          className="w-10 h-10 rounded mr-3"
          resizeMode="contain"
        />
      )}
      <View className="flex-1">
        <Text className="text-sm font-medium text-slate-800">
          {option.carrier ?? option.service}
        </Text>
        <Text className="text-xs text-slate-500">{option.service}</Text>
      </View>
      <View className="items-end">
        <Text className="text-sm font-bold text-slate-900">
          R$ {option.cost.toFixed(2)}
        </Text>
        {option.estimated_days && (
          <Text className="text-xs text-slate-400">
            {option.estimated_days} dias
          </Text>
        )}
      </View>
    </Pressable>
  );
}
