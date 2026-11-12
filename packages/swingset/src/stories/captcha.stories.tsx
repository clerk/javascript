import type { CaptchaProps } from '@clerk/mosaic/components/captcha';
import { Captcha } from '@clerk/mosaic/components/captcha';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './captcha.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Captcha',
  source: 'packages/mosaic/src/components/captcha/captcha.tsx',
  styles: {
    _variants: {
      size: { normal: {}, flexible: {}, compact: {} },
    },
    _defaultVariants: { size: 'normal' },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as CaptchaProps;
}

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const FORCE_INTERACTIVE_SITEKEY = '3x00000000000000000000FF';

interface Turnstile {
  render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
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

function TurnstileCaptcha({ size }: Pick<CaptchaProps, 'size'>) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Loading Turnstile');

  useEffect(() => {
    let id: string | undefined;
    let turnstile: Turnstile | undefined;
    let cancelled = false;
    const element = ref.current;
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

  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <Captcha
        ref={ref}
        size={size}
      />
      <span style={{ fontSize: 13, opacity: 0.7 }}>{status}</span>
    </div>
  );
}

export function Default(props: Record<string, unknown>) {
  const { size } = knobsAsProps(props);
  const { resolvedTheme } = useTheme();
  return (
    <TurnstileCaptcha
      key={`${resolvedTheme}-${size}`}
      size={size}
    />
  );
}
