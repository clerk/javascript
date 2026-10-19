import { Avatar } from '@clerk/mosaic/components/avatar';
import { Button } from '@clerk/mosaic/components/button';
import type { SkeletonProps } from '@clerk/mosaic/components/skeleton';
import { Skeleton } from '@clerk/mosaic/components/skeleton';
import { Text } from '@clerk/mosaic/components/text';
import { Fragment } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './skeleton.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'Skeleton',
  source: 'packages/mosaic/src/components/skeleton/skeleton.tsx',
  styles: {
    _variants: {
      shape: { rounded: {}, pill: {}, square: {} },
      visible: { true: {}, false: {} },
    },
    _defaultVariants: {
      shape: 'rounded',
      visible: 'true',
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return { ...props, visible: props.visible !== 'false' && props.visible !== false } as unknown as SkeletonProps;
}

export function Primary(props: Record<string, unknown>) {
  return (
    <Skeleton {...knobsAsProps(props)}>
      <Button>Save changes</Button>
    </Skeleton>
  );
}

export function TextContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Text size='base'>
        <Skeleton>Active devices</Skeleton>
      </Text>
      <Text>
        <Skeleton>Chrome on macOS</Skeleton>
      </Text>
      <Text
        size='xs'
        color='foreground-secondary'
      >
        <Skeleton>San Francisco, US</Skeleton>
      </Text>
    </div>
  );
}

export function MultilineText() {
  const paragraph =
    'Signed in from a new device. If this was not you, sign out of every session and change your password right away.';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 320px))', gap: 24 }}>
      {(['xs', 'sm', 'base', 'lg'] as const).map(size => (
        <Fragment key={size}>
          <Text size={size}>{paragraph}</Text>
          <Text size={size}>
            <Skeleton>{paragraph}</Skeleton>
          </Text>
        </Fragment>
      ))}
      <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 20 }}>{paragraph}</p>
      <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 20 }}>
        <Skeleton>{paragraph}</Skeleton>
      </p>
    </div>
  );
}

export function Elements() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Skeleton shape='pill'>
        <Avatar.Root size='md'>
          <Avatar.Fallback>PB</Avatar.Fallback>
        </Avatar.Root>
      </Skeleton>
      <Skeleton>
        <Button size='sm'>Edit</Button>
      </Skeleton>
      <Skeleton>
        <p style={{ margin: 0, maxWidth: 240 }}>
          A paragraph long enough to wrap onto a second line becomes one block.
        </p>
      </Skeleton>
    </div>
  );
}

export function Shapes() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Skeleton
        shape='rounded'
        width={48}
        height={48}
      />
      <Skeleton
        shape='pill'
        width={48}
        height={48}
      />
      <Skeleton
        shape='square'
        width={48}
        height={48}
      />
    </div>
  );
}

export function HoldSpace() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Text>
        <Skeleton>Chrome on macOS</Skeleton>
      </Text>
      <Skeleton visible={false}>
        <Button size='sm'>Edit</Button>
      </Skeleton>
      <Text>
        <Skeleton>Signed in</Skeleton>
      </Text>
    </div>
  );
}

export function NotShown() {
  return (
    <Text>
      <Skeleton show={false}>Chrome on macOS</Skeleton>
    </Text>
  );
}
