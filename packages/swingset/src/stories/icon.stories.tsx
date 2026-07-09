/** @jsxImportSource @emotion/react */
import type { MosaicIconRenderer } from '@clerk/ui/mosaic/appearance';
import type { IconProps } from '@clerk/ui/mosaic/components/icon';
import { Icon, iconRecipe } from '@clerk/ui/mosaic/components/icon';
import { iconRegistry } from '@clerk/ui/mosaic/icons/registry';
import { MosaicProvider } from '@clerk/ui/mosaic/MosaicProvider';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './icon.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Icon',
  source: 'packages/ui/src/mosaic/components/icon.tsx',
  styles: iconRecipe,
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

export function Names() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      {(Object.keys(iconRegistry) as Array<keyof typeof iconRegistry>).map(name => (
        <div
          key={name}
          style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', fontSize: 12 }}
        >
          <Icon
            name={name}
            size='lg'
          />
          <code>{name}</code>
        </div>
      ))}
    </div>
  );
}

// Mosaic's styling (sizing/color) applies to the override just like the built-in glyph, so the
// replacement only needs its viewBox + paths — spread `props` to receive the sizing className and
// `data-cl-slot`. Defined at module scope (not inline in the story) to keep a stable component type.
const CircleGlyph: MosaicIconRenderer = props => (
  <svg
    {...props}
    viewBox='0 0 20 20'
    fill='currentColor'
  >
    <circle
      cx={10}
      cy={10}
      r={6}
    />
  </svg>
);

export function Override() {
  return (
    <MosaicProvider appearance={{ icons: { 'chevron-right': CircleGlyph } }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Icon name='chevron-right' />
        <Icon name='chevron-left' />
      </div>
    </MosaicProvider>
  );
}
