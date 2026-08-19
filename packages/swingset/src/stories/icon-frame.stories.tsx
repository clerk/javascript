import { Icon, IconFrame } from '@clerk/ui/mosaic/components/icon';
import { colorVars, space } from '@clerk/ui/mosaic/styles';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './icon-frame.stories?raw';

const providerIconUrl = (provider: string) => `https://img.clerk.com/static/${provider}.svg`;

function ProviderLogo({ provider }: { provider: string }) {
  return (
    <img
      alt=''
      src={providerIconUrl(provider)}
      style={{ display: 'block', height: space['5'], objectFit: 'contain', width: space['5'] }}
    />
  );
}

export const meta: StoryMeta = {
  group: 'Components',
  title: 'IconFrame',
  source: 'packages/ui/src/mosaic/components/icon/icon-frame.tsx',
  styleEngine: 'stylex',
};

export function Default() {
  return (
    <IconFrame>
      <Icon name='check' />
    </IconFrame>
  );
}

export function IconSizes() {
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
      <IconFrame>
        <Icon
          name='check'
          size='sm'
        />
      </IconFrame>
      <IconFrame>
        <Icon
          name='check'
          size='md'
        />
      </IconFrame>
      <IconFrame>
        <Icon
          name='check'
          size='lg'
        />
      </IconFrame>
    </div>
  );
}

export function CustomSurface() {
  return (
    <IconFrame
      style={{
        backgroundColor: colorVars['--cl-color-primary'],
        color: colorVars['--cl-color-primary-foreground'],
      }}
    >
      <Icon
        name='check'
        size='lg'
      />
    </IconFrame>
  );
}

export function MultipleTreatments() {
  return (
    <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <IconFrame aria-label='Default'>
        <Icon name='check' />
      </IconFrame>
      <IconFrame
        aria-label='Neutral'
        style={{
          backgroundColor: colorVars['--cl-color-neutral-faded'],
          color: colorVars['--cl-color-neutral'],
        }}
      >
        <Icon name='check' />
      </IconFrame>
      <IconFrame
        aria-label='Positive'
        style={{
          backgroundColor: colorVars['--cl-color-positive-faded'],
          color: colorVars['--cl-color-positive'],
        }}
      >
        <Icon name='check' />
      </IconFrame>
      <IconFrame
        aria-label='Warning'
        style={{
          backgroundColor: colorVars['--cl-color-warning-faded'],
          color: colorVars['--cl-color-warning'],
        }}
      >
        <Icon name='alert-circle' />
      </IconFrame>
      <IconFrame
        aria-label='Negative'
        style={{
          backgroundColor: colorVars['--cl-color-negative-faded'],
          color: colorVars['--cl-color-negative'],
        }}
      >
        <Icon name='close' />
      </IconFrame>
    </div>
  );
}

export function BrandIcons() {
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
      <IconFrame aria-label='Apple'>
        <ProviderLogo provider='apple' />
      </IconFrame>
      <IconFrame aria-label='GitHub'>
        <ProviderLogo provider='github' />
      </IconFrame>
    </div>
  );
}
