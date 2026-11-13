import type { CaptchaProps } from '@clerk/mosaic/components/captcha';
import { Captcha } from '@clerk/mosaic/components/captcha';
import { useTheme } from 'next-themes';
import { useRef } from 'react';

import { useTestTurnstile } from '@/lib/test-turnstile';
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

function TurnstileCaptcha({ size }: Pick<CaptchaProps, 'size'>) {
  const ref = useRef<HTMLDivElement>(null);
  const status = useTestTurnstile(() => ref.current);

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
