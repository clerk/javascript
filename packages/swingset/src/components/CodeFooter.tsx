'use client';

import { CheckIcon, ChevronsDownUpIcon, ChevronsUpDownIcon, CopyIcon } from 'lucide-react';
import { useRef, useState } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { useShikiHtml } from './CodeBlock';

interface CodeFooterProps {
  /** The example's usage snippet (from `extractStorySource` → `toUsageSnippet`). */
  source: string;
}

/**
 * A collapsible "code" footer attached to a `<Story>` example card. Collapsed by default to
 * just a "View code" toggle; expanding reveals the example's source with a height animation
 * (Base UI's `--collapsible-panel-height` + `data-starting/ending-style`). Copy button lives
 * inside the revealed panel.
 */
export function CodeFooter({ source }: CodeFooterProps) {
  const code = source.trimEnd();
  const html = useShikiHtml(code, 'tsx');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function copy() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className='border-t'
    >
      <CollapsibleTrigger className='text-muted-foreground hover:text-foreground hover:bg-muted/40 flex w-full items-center justify-center gap-1 px-2 py-1.5 text-xs'>
        {open ? <ChevronsDownUpIcon className='size-3' /> : <ChevronsUpDownIcon className='size-3' />}
        {open ? 'Collapse code' : 'View code'}
      </CollapsibleTrigger>

      <CollapsibleContent className='h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0'>
        <div className='group relative border-t bg-[var(--shiki-background)] text-sm'>
          <button
            type='button'
            onClick={copy}
            className='absolute right-2 top-2 z-10 flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs text-white/60 opacity-0 transition-opacity hover:bg-white/20 hover:text-white group-hover:opacity-100'
          >
            {copied ? <CheckIcon className='size-3' /> : <CopyIcon className='size-3' />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          {html ? (
            // safe: shiki output is developer-controlled source code
            <div
              dangerouslySetInnerHTML={{ __html: html }}
              className='[&>pre]:bg-transparent! [&>pre]:overflow-auto [&>pre]:p-4'
            />
          ) : (
            <pre className='overflow-auto p-4 text-[var(--shiki-foreground)]'>
              <code>{code}</code>
            </pre>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
