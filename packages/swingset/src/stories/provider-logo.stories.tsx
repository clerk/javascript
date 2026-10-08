import type { ProviderLogoGlyph, ProviderLogoProps } from '@clerk/mosaic/components/provider-logo';
import { ProviderLogo } from '@clerk/mosaic/components/provider-logo';
import { enterpriseLogos } from '@clerk/mosaic/components/provider-logo/enterprise.generated';
import { oauthLogos } from '@clerk/mosaic/components/provider-logo/oauth.generated';
import { phoneLogos } from '@clerk/mosaic/components/provider-logo/phone.generated';
import { web3Logos } from '@clerk/mosaic/components/provider-logo/web3.generated';
import { colorVars, space } from '@clerk/mosaic/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './provider-logo.stories?raw';

const glyphsById = new Map<string, ProviderLogoGlyph>(
  [oauthLogos, web3Logos, phoneLogos, enterpriseLogos]
    .flatMap(group => Object.values(group))
    .map(glyph => [glyph.id, glyph]),
);
const glyphs = [...glyphsById.values()];

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
      glyph: Object.fromEntries(glyphs.map(glyph => [glyph.id, {}])),
      size: { sm: {}, md: {}, lg: {}, inherit: {} },
    },
    _defaultVariants: {
      glyph: 'google',
      size: 'md',
    },
  },
};

function knobsAsProps({ glyph, ...props }: Record<string, unknown>): ProviderLogoProps {
  return { ...props, glyph: glyphsById.get(String(glyph)) ?? oauthLogos.google };
}

export function Default(props: Record<string, unknown>) {
  return <ProviderLogo {...knobsAsProps(props)} />;
}

export function Sizes() {
  return (
    <div {...stylex.props(styles.row)}>
      <ProviderLogo
        glyph={oauthLogos.github}
        size='sm'
      />
      <ProviderLogo
        glyph={oauthLogos.github}
        size='md'
      />
      <ProviderLogo
        glyph={oauthLogos.github}
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
          {glyphs.map(glyph => (
            <ProviderLogo
              key={glyph.id}
              glyph={glyph}
              size='lg'
            />
          ))}
        </div>
      ))}
    </div>
  );
}
