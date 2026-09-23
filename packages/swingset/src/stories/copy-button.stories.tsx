import { CopyButton } from '@clerk/mosaic/components/copy-button';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './copy-button.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'CopyButton',
  source: 'packages/mosaic/src/components/copy-button/copy-button.tsx',
  styles: {
    _variants: {
      color: { primary: {}, neutral: {}, negative: {} },
      variant: { filled: {}, outline: {}, ghost: {}, link: {} },
      size: { xs: {}, sm: {}, md: {}, lg: {} },
      shape: { default: {}, square: {}, circle: {} },
    },
    _defaultVariants: {
      color: 'neutral',
      variant: 'ghost',
      size: 'xs',
      shape: 'square',
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as Record<string, never>;
}

export function Default(props: Record<string, unknown>) {
  return (
    <CopyButton
      {...knobsAsProps(props)}
      value='clerkWorkspace-177654156132154'
    />
  );
}

export function Inline(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 14 }}>
      <span>clerkWorkspace-177654156132154</span>
      <CopyButton
        {...knobsAsProps(props)}
        value='clerkWorkspace-177654156132154'
        label='Copy slug'
      />
    </div>
  );
}

export function Labelled(props: Record<string, unknown>) {
  return (
    <CopyButton
      {...knobsAsProps(props)}
      value='sk_test_0000000000000000000000000000'
      label='Copy API key'
      copiedLabel='API key copied'
      variant='outline'
      size='sm'
    />
  );
}
