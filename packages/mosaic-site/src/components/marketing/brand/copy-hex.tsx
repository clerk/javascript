'use client';
import * as React from 'react';
export function CopyHex({ hex, className }: { hex: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type='button'
      className={className}
      onClick={() => {
        void navigator.clipboard.writeText(hex).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        });
      }}
    >
      {copied ? 'Copied' : hex}
    </button>
  );
}
