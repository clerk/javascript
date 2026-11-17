import { ProviderButton, ProviderButtonGroup } from '@clerk/mosaic/components/provider-button';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './provider-button.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'ProviderButton',
  source: 'packages/mosaic/src/components/provider-button/provider-button.tsx',
  styles: {
    _variants: {
      layout: { inline: {}, stacked: {} },
      disabled: { true: {}, false: {} },
      isPending: { true: {}, false: {} },
      count: { 1: {}, 2: {}, 3: {}, 5: {}, 6: {}, 7: {} },
    },
    _defaultVariants: {
      layout: 'inline',
      disabled: 'false',
      isPending: 'false',
      count: '2',
    },
  },
};

const PROVIDERS = ['Google', 'GitHub', 'Apple', 'Microsoft', 'Discord', 'Slack', 'GitLab'];

function ProviderIcon({ name }: { name: string }) {
  return (
    <svg
      aria-hidden
      viewBox='0 0 16 16'
      width={16}
      height={16}
    >
      <circle
        cx='8'
        cy='8'
        r='8'
        fill='currentColor'
        opacity='0.2'
      />
      <text
        x='8'
        y='11.5'
        fontSize='10'
        textAnchor='middle'
        fill='currentColor'
      >
        {name[0]}
      </text>
    </svg>
  );
}

export function Default({ count, isPending, ...props }: Record<string, unknown>) {
  return (
    <div style={{ width: 400, maxWidth: '100%' }}>
      <ProviderButtonGroup {...(props as Record<string, never>)}>
        {PROVIDERS.slice(0, Number(count)).map((name, index) => (
          <ProviderButton
            key={name}
            icon={<ProviderIcon name={name} />}
            longLabel={`Continue with ${name}`}
            shortLabel={name}
            isPending={Boolean(isPending) && index === 0}
          />
        ))}
      </ProviderButtonGroup>
    </div>
  );
}

export function One() {
  return (
    <div style={{ width: 400, maxWidth: '100%' }}>
      <ProviderButtonGroup>
        <ProviderButton
          icon={<ProviderIcon name='Google' />}
          longLabel='Continue with Google'
          shortLabel='Google'
        />
      </ProviderButtonGroup>
    </div>
  );
}

export function Many() {
  return (
    <div style={{ width: 400, maxWidth: '100%' }}>
      <ProviderButtonGroup>
        {PROVIDERS.map(name => (
          <ProviderButton
            key={name}
            icon={<ProviderIcon name={name} />}
            longLabel={`Continue with ${name}`}
            shortLabel={name}
          />
        ))}
      </ProviderButtonGroup>
    </div>
  );
}

export function Stacked() {
  return (
    <div style={{ width: 400, maxWidth: '100%' }}>
      <ProviderButtonGroup layout='stacked'>
        {PROVIDERS.slice(0, 3).map(name => (
          <ProviderButton
            key={name}
            icon={<ProviderIcon name={name} />}
            longLabel={`Continue with ${name}`}
            shortLabel={name}
          />
        ))}
      </ProviderButtonGroup>
    </div>
  );
}

export function LastUsed() {
  return (
    <div style={{ width: 400, maxWidth: '100%' }}>
      <ProviderButtonGroup
        lastUsed={
          <ProviderButton
            icon={<ProviderIcon name='Google' />}
            longLabel='Continue with Google'
            shortLabel='Google'
            badge='Last used'
          />
        }
      >
        {PROVIDERS.slice(1, 4).map(name => (
          <ProviderButton
            key={name}
            icon={<ProviderIcon name={name} />}
            longLabel={`Continue with ${name}`}
            shortLabel={name}
          />
        ))}
      </ProviderButtonGroup>
    </div>
  );
}

export function LongLabels() {
  return (
    <div style={{ width: 240, maxWidth: '100%' }}>
      <ProviderButtonGroup layout='stacked'>
        <ProviderButton
          icon={<ProviderIcon name='Acme' />}
          longLabel='Continue with Acme Corporation Enterprise SSO'
          shortLabel='Acme Corporation'
        />
        <ProviderButton
          icon={<ProviderIcon name='Northwind' />}
          longLabel='Continue with Northwind Traders Identity Provider'
          shortLabel='Northwind Traders'
          isPending
        />
      </ProviderButtonGroup>
    </div>
  );
}

export function Pending() {
  const [pending, setPending] = useState<string | null>(null);

  const start = (name: string) => {
    setPending(name);
    setTimeout(() => setPending(null), 2000);
  };

  return (
    <div style={{ width: 400, maxWidth: '100%' }}>
      <ProviderButtonGroup disabled={pending !== null}>
        {PROVIDERS.slice(0, 2).map(name => (
          <ProviderButton
            key={name}
            icon={<ProviderIcon name={name} />}
            longLabel={`Continue with ${name}`}
            shortLabel={name}
            isPending={pending === name}
            onClick={() => start(name)}
          />
        ))}
      </ProviderButtonGroup>
    </div>
  );
}
