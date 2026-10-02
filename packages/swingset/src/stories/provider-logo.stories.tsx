import type { ProviderLogoProps } from '@clerk/mosaic/components/provider-logo';
import { ProviderLogo, providerLogoIds } from '@clerk/mosaic/components/provider-logo';
import { colorVars, space } from '@clerk/mosaic/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './provider-logo.stories?raw';

const styles = stylex.create({
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: space['4'],
  },
  schemes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
    gap: space['3'],
    width: '100%',
  },
  light: {
    colorScheme: 'light',
  },
  dark: {
    colorScheme: 'dark',
  },
  panel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(2.5rem, 1fr))',
    gap: space['4'],
    justifyItems: 'center',
    padding: space['4'],
    borderRadius: space['2'],
    backgroundColor: colorVars['--cl-color-background'],
    color: colorVars['--cl-color-foreground'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--cl-color-border'],
  },
});

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'ProviderLogo',
  source: 'packages/mosaic/src/components/provider-logo/provider-logo.tsx',
  styles: {
    _variants: {
      provider: Object.fromEntries(providerLogoIds.map(id => [id, {}])),
      size: { sm: {}, md: {}, lg: {}, inherit: {} },
    },
    _defaultVariants: {
      provider: 'google',
      size: 'md',
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as ProviderLogoProps;
}

export function Default(props: Record<string, unknown>) {
  return <ProviderLogo {...knobsAsProps(props)} />;
}

export function Sizes() {
  return (
    <div {...stylex.props(styles.row)}>
      <ProviderLogo
        provider='github'
        size='sm'
      />
      <ProviderLogo
        provider='github'
        size='md'
      />
      <ProviderLogo
        provider='github'
        size='lg'
      />
    </div>
  );
}

export function ColorSchemes() {
  return (
    <div {...stylex.props(styles.schemes)}>
      {(['light', 'dark'] as const).map(scheme => (
        <div
          key={scheme}
          {...stylex.props(styles.panel, styles[scheme])}
        >
          {providerLogoIds.map(id => (
            <ProviderLogo
              key={id}
              provider={id}
              size='lg'
            />
          ))}
        </div>
      ))}
    </div>
  );
}
