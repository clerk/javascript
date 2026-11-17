'use client';

import { CopyIcon, useFlash } from './copy-button';

export function CopyPageButton({ href }: { href: string }) {
  const [label, flash] = useFlash<string>();

  return (
    <button
      type='button'
      onClick={() =>
        void copyMarkdown(href).then(
          () => flash('Copied'),
          () => flash('Copy failed'),
        )
      }
      className='text-muted-foreground hover:text-foreground flex w-full items-center gap-2.5 py-1.5 text-start text-sm transition-colors'
    >
      <CopyIcon className='size-4 shrink-0' />
      <span aria-live='polite'>{label ?? 'Copy Markdown'}</span>
    </button>
  );
}

function copyMarkdown(href: string): Promise<void> {
  const blob = fetch(href).then(async response => {
    if (!response.ok) {
      throw new Error(`Fetching ${href} failed with ${response.status}`);
    }
    return new Blob([await response.text()], { type: 'text/plain' });
  });
  return navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
}
