import type { IconProps } from '@clerk/mosaic/components/icon';
import { Icon } from '@clerk/mosaic/components/icon';
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
      size: { sm: {}, md: {}, lg: {} },
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
    />
  );
}

export function Sizes(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Icon
        {...knobsAsProps(props)}
        name='chevron-right'
        size='sm'
      />
      <Icon
        {...knobsAsProps(props)}
        name='chevron-right'
        size='md'
      />
      <Icon
        {...knobsAsProps(props)}
        name='chevron-right'
        size='lg'
      />
    </div>
  );
}

const deviceIllustrationNames: IconProps['name'][] = ['device-phone', 'device-laptop'];

function IconGallery({ names }: { names: readonly IconProps['name'][] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 120px), 1fr))',
        gap: 8,
        width: '100%',
      }}
    >
      {names.map(name => (
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

export function Names() {
  const names = (Object.keys(iconRegistry) as Array<keyof typeof iconRegistry>).filter(
    name => !deviceIllustrationNames.includes(name),
  );
  return <IconGallery names={names} />;
}

export function DeviceIllustrations() {
  return <IconGallery names={deviceIllustrationNames} />;
}

export function Override() {
  return (
    // Overrides are elements, not render functions: Mosaic injects its sizing className and
    // `data-size` into the element via cloneElement, so the replacement only supplies its own
    // content and need not be an `svg`. Passing an element (vs a function) also lets overrides
    // be supplied from a Server Component, since elements serialize across the RSC boundary.
    <MosaicProvider
      icons={{
        'chevron-right': (
          <svg
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <circle
              cx={10}
              cy={10}
              r={6}
            />
          </svg>
        ),
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Icon name='chevron-right' />
        <Icon name='chevron-left' />
      </div>
    </MosaicProvider>
  );
}
