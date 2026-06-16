import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

interface Props {
  value: string;
  label?: string;
}

export function CopyButton({ value, label = 'Copiar' }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await Clipboard.setStringAsync(value);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Pressable
      onPress={handleCopy}
      className="px-3 py-1.5 bg-slate-100 rounded active:bg-slate-200"
    >
      <Text className="text-xs text-slate-600 font-medium">
        {copied ? 'Copiado!' : label}
      </Text>
    </Pressable>
  );
}
