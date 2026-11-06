import type { LinkProps } from '@clerk/mosaic/components/link';
import { Link } from '@clerk/mosaic/components/link';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './link.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'Link',
  source: 'packages/mosaic/src/components/link/link.tsx',
  styles: {
    _variants: {
      color: { primary: {}, neutral: {}, negative: {} },
      size: { xs: {}, sm: {}, md: {}, lg: {} },
    },
    _defaultVariants: {
      color: 'primary',
      size: 'md',
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as LinkProps;
}

export function Primary(props: Record<string, unknown>) {
  return (
    <Link
      {...knobsAsProps(props)}
      href='#'
    >
      Learn more
    </Link>
  );
}

export function External(props: Record<string, unknown>) {
  return (
    <Link
      {...knobsAsProps(props)}
      href='https://clerk.com'
      target='_blank'
      rel='noopener noreferrer'
    >
      Open Gmail
    </Link>
  );
}

export function ExternalWrapping(props: Record<string, unknown>) {
  return (
    <div style={{ width: 160, resize: 'horizontal', overflow: 'auto' }}>
      <Link
        {...knobsAsProps(props)}
        href='https://clerk.com'
        target='_blank'
        rel='noopener noreferrer'
      >
        Read the guide to verifying your email address
      </Link>
    </div>
  );
}
