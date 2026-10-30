import { ProviderButton, ProviderButtonGroup } from '@clerk/mosaic/components/provider-button';

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

function Group({ count, isPending, ...props }: Record<string, unknown>) {
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

export function Default(props: Record<string, unknown>) {
  return <Group {...props} />;
}

export function One(props: Record<string, unknown>) {
  return (
    <Group
      {...props}
      count={1}
    />
  );
}

export function Many(props: Record<string, unknown>) {
  return (
    <Group
      {...props}
      count={7}
    />
  );
}

export function Stacked(props: Record<string, unknown>) {
  return (
    <Group
      {...props}
      count={3}
      layout='stacked'
    />
  );
}

export function Pending(props: Record<string, unknown>) {
  return (
    <Group
      {...props}
      count={2}
      disabled
      isPending
    />
  );
}
