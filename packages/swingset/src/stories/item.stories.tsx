/** @jsxImportSource @emotion/react */
import { Avatar } from '@clerk/ui/mosaic/components/avatar';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Item } from '@clerk/ui/mosaic/components/item';
import * as React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './item.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Item',
  source: 'packages/ui/src/mosaic/components/item/item.tsx',
};

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

function CheckMarkIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox='0 0 16 16'
      width='1em'
      height='1em'
      fill='none'
      {...props}
    >
      <path
        fill='currentColor'
        fillRule='evenodd'
        d='M12.136 3.607a.75.75 0 0 1 .257 1.029l-4.5 7.5a.75.75 0 0 1-1.173.144l-3-3a.75.75 0 0 1 1.06-1.06l2.321 2.32 4.006-6.676a.75.75 0 0 1 1.029-.257'
        clipRule='evenodd'
      />
    </svg>
  );
}

function EllipsisIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox='0 0 16 16'
      width='1em'
      height='1em'
      fill='none'
      {...props}
    >
      <path
        d='M2.75 8.01978V8.01001C2.75 7.31965 3.30964 6.76001 4 6.76001C4.69036 6.76001 5.25 7.31965 5.25 8.01001V8.01978C5.25 8.71013 4.69036 9.26978 4 9.26978C3.30964 9.26978 2.75 8.71013 2.75 8.01978Z'
        fill='#747686'
      />
      <path
        d='M6.75 8.00977V8C6.75 7.30964 7.30964 6.75 8 6.75C8.69036 6.75 9.25 7.30964 9.25 8V8.00977C9.25 8.70012 8.69036 9.25977 8 9.25977C7.30964 9.25977 6.75 8.70012 6.75 8.00977Z'
        fill='#747686'
      />
      <path
        d='M10.75 8.00977V8C10.75 7.30964 11.3096 6.75 12 6.75C12.6904 6.75 13.25 7.30964 13.25 8V8.00977C13.25 8.70012 12.6904 9.25977 12 9.25977C11.3096 9.25977 10.75 8.70012 10.75 8.00977Z'
        fill='#747686'
      />
      <rect
        width='0.0001'
        height='0.0001'
        fill='#747686'
      />
    </svg>
  );
}

export function Default() {
  return (
    <Item.Root>
      <Item.Media>
        <Avatar.Root
          shape='square'
          size='md'
        >
          <Avatar.Fallback>T</Avatar.Fallback>
        </Avatar.Root>
      </Item.Media>
      <Item.Content>
        <Item.Title>Test Organization</Item.Title>
        <Item.Description>Member</Item.Description>
      </Item.Content>
      <Item.Actions>
        <Button variant='outline'>Manage</Button>
      </Item.Actions>
    </Item.Root>
  );
}

export function Interactive() {
  return (
    <Item.Root
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
        <Avatar.Root
          shape='square'
          size='md'
        >
          <Avatar.Fallback>T</Avatar.Fallback>
        </Avatar.Root>
      </Item.Media>
      <Item.Content>
        <Item.Title>Test Organization</Item.Title>
        <Item.Description>Member</Item.Description>
      </Item.Content>
      <Item.Media style={{ width: '1.75rem' }}>
        <ArrowIcon />
      </Item.Media>
    </Item.Root>
  );
}

export function Group() {
  return (
    <div className='w-full'>
      <Item.Group>
        <Item.Root>
          <Item.Media>
            <Avatar.Root shape='circle'>
              <Avatar.Fallback>C</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title>Cameron Walker</Item.Title>
          </Item.Content>
          <Item.Actions>
            <Button variant='outline'>Invite</Button>
          </Item.Actions>
        </Item.Root>
      </Item.Group>
      <Item.Separator />
      <Item.Group>
        <Item.Root size='flush'>
          <Item.Content>
            <Item.Description>cameron@clerk.com</Item.Description>
          </Item.Content>
          <Item.Actions>
            <Button
              size='sm'
              shape='square'
              variant='ghost'
            >
              <EllipsisIcon />
            </Button>
          </Item.Actions>
        </Item.Root>
        <Item.Root>
          <Item.Media>
            <Avatar.Root shape='square'>
              <Avatar.Image
                src='https://github.com/clerk.png'
                alt='Clerk Cloud'
              />
              <Avatar.Fallback>C</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title>Clerk</Item.Title>
            <Item.Description>24 members &bull; Basic</Item.Description>
          </Item.Content>
          <Item.Media>
            <CheckMarkIcon width='28px' />
          </Item.Media>
        </Item.Root>
        <Item.Root
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
            <Avatar.Root shape='square'>
              <Avatar.Image
                src='https://github.com/clerk.png'
                alt='Clerk Cloud'
              />
              <Avatar.Fallback>C</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title>Clerk</Item.Title>
            <Item.Description>24 members &bull; Basic</Item.Description>
          </Item.Content>
        </Item.Root>
      </Item.Group>
      <Item.Separator />
      <Item.Group>
        <Item.Root
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
            <Avatar.Root shape='square'>
              <Avatar.Fallback>D</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title>DesignCloud</Item.Title>
            <Item.Description>12 members &bull; Pro</Item.Description>
          </Item.Content>
        </Item.Root>
      </Item.Group>
    </div>
  );
}
