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

function BuildingIcon() {
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
      <path d='M3 21h18M6 21V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v17M9 7h.01M9 11h.01M9 15h.01' />
    </svg>
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
      <Item.Media variant='icon'>
        <BuildingIcon />
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

export function Variants() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Item variant='default'>
        <Item.Content>
          <Item.Title>Default</Item.Title>
          <Item.Description>Transparent background, no border</Item.Description>
        </Item.Content>
      </Item>
      <Item variant='outline'>
        <Item.Content>
          <Item.Title>Outline</Item.Title>
          <Item.Description>Bordered container</Item.Description>
        </Item.Content>
      </Item>
      <Item variant='muted'>
        <Item.Content>
          <Item.Title>Muted</Item.Title>
          <Item.Description>Subtle filled background</Item.Description>
        </Item.Content>
      </Item>
    </div>
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
      <Item.Media variant='icon'>
        <BuildingIcon />
      </Item.Media>
      <Item.Content>
        <Item.Title>Test Organization</Item.Title>
        <Item.Description>Member</Item.Description>
      </Item.Content>
      <Item.Media>
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
        <Item.Content>
          <Item.Title>Clerk Cloud</Item.Title>
        </Item.Content>
      </Item>
    </Item.Group>
  );
}
