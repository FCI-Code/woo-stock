'use client';

import { useState } from 'react';

interface Props {
  value: string;
  label?: string;
}

export function CopyButton({ value, label = 'Copiar' }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="text-[10px] font-semibold tracking-wide uppercase text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 border border-slate-200 hover:border-slate-400"
    >
      {copied ? 'Copiado!' : label}
    </button>
  );
}
