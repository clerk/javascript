'use client';

import { useEffect, useRef, useState } from 'react';
import type { Highlighter } from 'shiki';
import { createHighlighter } from 'shiki';
import { createCssVariablesTheme } from 'shiki/theme-css-variables';

const cssVariablesTheme = createCssVariablesTheme({ name: 'css-variables', variablePrefix: '--shiki-' });

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [cssVariablesTheme],
      langs: ['tsx', 'typescript', 'bash', 'css'],
    });
  }
  return highlighterPromise;
}

interface CodeBlockProps {
  children?: string;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const lang = className?.replace('language-', '') ?? 'text';
  const code = typeof children === 'string' ? children.trimEnd() : '';
  const [html, setHtml] = useState('');
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void getHighlighter().then(hl => {
      setHtml(hl.codeToHtml(code, { lang, theme: 'css-variables' }));
    });
  }, [code, lang]);

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
    <div className='not-prose group relative my-4 overflow-hidden rounded-lg border border-white/10 bg-[var(--shiki-background)] text-sm'>
      <button
        type='button'
        onClick={copy}
        className='absolute right-2 top-2 z-10 rounded bg-white/10 px-2 py-1 text-xs text-white/60 opacity-0 transition-opacity hover:bg-white/20 hover:text-white group-hover:opacity-100'
      >
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
  );
}
