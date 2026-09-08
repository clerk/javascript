import type { IconFrameProps } from '@clerk/ui/mosaic/components/icon';
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
  styles: {
    _variants: {
      bordered: { true: {}, false: {} },
      filled: { true: {}, false: {} },
      size: { sm: {}, md: {}, lg: {}, xl: {} },
    },
    _defaultVariants: {
      bordered: true,
      filled: false,
      size: 'xl',
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as IconFrameProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <IconFrame {...knobsAsProps(props)}>
      <Icon name='check' />
    </IconFrame>
  );
}

export function Sizes() {
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
      <IconFrame size='sm'>
        <Icon
          name='check'
          size='sm'
        />
      </IconFrame>
      <IconFrame size='md'>
        <Icon
          name='check'
          size='md'
        />
      </IconFrame>
      <IconFrame size='lg'>
        <Icon
          name='check'
          size='md'
        />
      </IconFrame>
      <IconFrame size='xl'>
        <Icon
          name='check'
          size='lg'
        />
      </IconFrame>
    </div>
  );
}

export function Treatments() {
  return (
    <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <IconFrame
        aria-label='Unframed'
        bordered={false}
      >
        <Icon name='check' />
      </IconFrame>
      <IconFrame aria-label='Bordered'>
        <Icon name='check' />
      </IconFrame>
      <IconFrame
        aria-label='Filled'
        bordered={false}
        filled
      >
        <Icon name='check' />
      </IconFrame>
      <IconFrame
        aria-label='Bordered and filled'
        filled
      >
        <Icon name='check' />
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

export function BrandIcons() {
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
      <IconFrame aria-label='Google'>
        <ProviderLogo provider='google' />
      </IconFrame>
      <IconFrame aria-label='MetaMask'>
        <ProviderLogo provider='metamask' />
      </IconFrame>
    </div>
  );
}
