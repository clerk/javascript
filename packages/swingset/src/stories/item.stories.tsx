/** @jsxImportSource @emotion/react */
import { Button } from '@clerk/ui/mosaic/components/button';
import { Item } from '@clerk/ui/mosaic/components/item';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './item.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Item',
  source: 'packages/ui/src/mosaic/components/item/item.tsx',
};

// A square org/account avatar sized for the media slot (36px). Since `Item.Media`
// fits its child, the avatar's own dimensions drive the slot width.
function Avatar({ initial }: { initial: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: 'var(--cl-radius-inner)',
        backgroundColor: 'var(--cl-color-primary)',
        color: 'var(--cl-color-primary-foreground)',
        fontSize: '0.875rem',
        fontWeight: 600,
      }}
    >
      {initial}
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M5 12h14M13 5l7 7-7 7' />
    </svg>
  );
}

export function Default() {
  return (
    <Item>
      <Item.Media>
        <Avatar initial='T' />
      </Item.Media>
      <Item.Content>
        <Item.Title>Test Organization</Item.Title>
        <Item.Description>Member</Item.Description>
      </Item.Content>
      <Item.Actions>
        <Button variant='outline'>Manage</Button>
      </Item.Actions>
    </Item>
  );
}

export function Interactive() {
  return (
    <Item
      render={({ children, ...props }) => (
        <a
          {...props}
          href='#settings'
        >
          {children}
        </a>
      )}
    >
      <Item.Media>
        <Avatar initial='T' />
      </Item.Media>
      <Item.Content>
        <Item.Title>Test Organization</Item.Title>
        <Item.Description>Member</Item.Description>
      </Item.Content>
      <Item.Media style={{ width: '1.75rem' }}>
        <ArrowIcon />
      </Item.Media>
    </Item>
  );
}

export function Group() {
  return (
    <Item.Group>
      <Item
        render={({ children, ...props }) => (
          <a
            {...props}
            href='#one'
          >
            {children}
          </a>
        )}
      >
        <Item.Media>
          <Avatar initial='C' />
        </Item.Media>
        <Item.Content>
          <Item.Title>Clerk</Item.Title>
        </Item.Content>
      </Item>
      <Item.Separator />
      <Item
        render={({ children, ...props }) => (
          <a
            {...props}
            href='#two'
          >
            {children}
          </a>
        )}
      >
        <Item.Media>
          <Avatar initial='C' />
        </Item.Media>
        <Item.Content>
          <Item.Title>Clerk Cloud</Item.Title>
        </Item.Content>
      </Item>
    </Item.Group>
  );
}
