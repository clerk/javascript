import { useEffect, useState } from 'react';

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const FORCE_INTERACTIVE_SITEKEY = '3x00000000000000000000FF';

interface Turnstile {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
}

function loadTurnstile(): Promise<Turnstile> {
  const existing = (window as { turnstile?: Turnstile }).turnstile;
  if (existing) {
    return Promise.resolve(existing);
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.onload = () => resolve((window as { turnstile?: Turnstile }).turnstile as Turnstile);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function useTestTurnstile(getElement: () => HTMLElement | null | undefined): string {
  const [status, setStatus] = useState('Loading Turnstile');

  useEffect(() => {
    let id: string | undefined;
    let turnstile: Turnstile | undefined;
    let cancelled = false;
    const element = getElement();
    if (!element) {
      return undefined;
    }
    element.style.maxHeight = '0';
    void loadTurnstile()
      .then(loaded => {
        if (cancelled) {
          return;
        }
        turnstile = loaded;
        id = loaded.render(element, {
          sitekey: FORCE_INTERACTIVE_SITEKEY,
          appearance: 'interaction-only',
          theme: element.dataset.clTheme ?? 'auto',
          size: element.dataset.clSize ?? 'normal',
          retry: 'never',
          'before-interactive-callback': () => {
            element.style.maxHeight = 'unset';
            element.style.minHeight = element.dataset.clSize === 'compact' ? '140px' : '68px';
            element.style.marginBottom = '1.5rem';
            element.dataset.clInteractive = 'true';
            setStatus('Interactive challenge shown');
          },
          callback: () => {
            delete element.dataset.clInteractive;
            setStatus('Solved');
          },
        });
        setStatus('Waiting for Turnstile');
      })
      .catch(() => setStatus('Turnstile could not load'));
    return () => {
      cancelled = true;
      if (turnstile && id) {
        turnstile.remove(id);
      }
    };
  }, []);

  return status;
}
