import type { IconProps } from '@clerk/mosaic/components/icon';
import { Icon } from '@clerk/mosaic/components/icon';
import { ArrowRight } from '@clerk/mosaic/icons/glyphs/arrow-right';
import { iconRegistry } from '@clerk/mosaic/icons/registry';
import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './icon.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Icon',
  source: 'packages/mosaic/src/components/icon/icon.tsx',
  styles: {
    _variants: {
      size: { sm: {}, md: {}, lg: {}, inherit: {} },
    },
    _defaultVariants: {
      size: 'md',
    },
  },
};

// Story functions accept Record<string,unknown> (knob values) and cast to IconProps.
// The cast is unavoidable: knobs are dynamically typed; Icon has a strict prop interface.
// `name` is required and not a variant, so each story pins it.
function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as IconProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <Icon
      {...knobsAsProps(props)}
      name='chevron-right'
      role='img'
      aria-label='Next'
    />
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <span
          key={size}
          style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}
        >
          <Icon
            name='chevron-right'
            size={size}
            aria-hidden
          />
          <code>{size}</code>
        </span>
      ))}
      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 24 }}>
        <Icon
          name='chevron-right'
          size='inherit'
          aria-hidden
        />
        <code>inherit</code>
      </span>
    </div>
  );
}

export function Colors() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, color: 'var(--cl-color-positive)' }}>
      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
        <Icon
          name='checkmark-circle'
          size='lg'
          aria-hidden
        />
        Inherited color
      </span>
      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
        <Icon
          name='device-phone'
          size='lg'
          aria-hidden
        />
        Fixed palette
      </span>
    </div>
  );
}

export function Names() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 120px), 1fr))',
        gap: 8,
        width: '100%',
      }}
    >
      {(Object.keys(iconRegistry) as Array<keyof typeof iconRegistry>).map(name => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            minWidth: 0,
            minHeight: 104,
            padding: '20px 8px 12px',
            border: '1px solid color-mix(in srgb, currentColor 10%, transparent)',
            borderRadius: 8,
            textAlign: 'center',
          }}
        >
          <Icon
            name={name}
            size='lg'
            aria-hidden
          />
          <code style={{ fontSize: 11, lineHeight: 1.5, overflowWrap: 'anywhere' }}>{name}</code>
        </div>
      ))}
    </div>
  );
}

export function Override() {
  return (
    // Overrides are elements, not render functions: Mosaic injects its sizing className and
    // `data-size` into the element via cloneElement, so the replacement only supplies its own
    // content and need not be an `svg`. Passing an element (vs a function) also lets overrides
    // be supplied from a Server Component, since elements serialize across the RSC boundary.
    <MosaicProvider
      icons={{
        'chevron-right': <ArrowRight />,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          Next
          <Icon
            name='chevron-right'
            placement='inline-end'
            aria-hidden
          />
        </span>
        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <Icon
            name='chevron-left'
            aria-hidden
          />
          Previous
        </span>
      </div>
    </MosaicProvider>
  );
}
