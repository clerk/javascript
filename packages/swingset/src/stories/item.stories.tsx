/** @jsxImportSource @emotion/react */
import { Avatar } from '@clerk/ui/mosaic/components/avatar';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import { Item } from '@clerk/ui/mosaic/components/item';
import { scrollAreaRoot, scrollAreaViewport } from '@clerk/ui/mosaic/components/scroll-area';
import { radiusVars } from '@clerk/ui/mosaic/styles';
import * as stylex from '@stylexjs/stylex';
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

export function Default() {
  return (
    <Item.Root>
      <Item.Media>
        <Avatar.Root
          shape='square'
          size='fit'
        >
          <Avatar.Fallback>T</Avatar.Fallback>
        </Avatar.Root>
      </Item.Media>
      <Item.Content>
        <Item.Label>Test Organization</Item.Label>
        <Item.Description>Member</Item.Description>
      </Item.Content>
      <Item.Actions>
        <Button
          variant='outline'
          size='sm'
        >
          Manage
        </Button>
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
          size='fit'
        >
          <Avatar.Fallback>T</Avatar.Fallback>
        </Avatar.Root>
      </Item.Media>
      <Item.Content>
        <Item.Label>Test Organization</Item.Label>
        <Item.Description>Member</Item.Description>
      </Item.Content>
    </Item.Root>
  );
}

export function Sizes() {
  return (
    <div className='w-full'>
      {(['md', 'xs'] as const).map(size => (
        <Item.Root
          key={size}
          size={size}
        >
          <Item.Media>
            <Avatar.Root
              shape='square'
              size='fit'
            >
              <Avatar.Fallback>T</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Label>Test Organization</Item.Label>
          </Item.Content>
        </Item.Root>
      ))}
    </div>
  );
}

export function Group() {
  return (
    <div className='w-full'>
      <Item.Group>
        <Item.Root>
          <Item.Media>
            <Avatar.Root
              size='fit'
              shape='circle'
            >
              <Avatar.Fallback>C</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Label>Cameron Walker</Item.Label>
            <Item.Description>cameron@clerk.com</Item.Description>
          </Item.Content>
          <Item.Actions>
            <Button
              variant='outline'
              size='sm'
            >
              Invite
            </Button>
          </Item.Actions>
        </Item.Root>
      </Item.Group>
      <Item.Separator />
      <Item.Group>
        <Item.Root size='xs'>
          <Item.Content>
            <Item.Description>cameron.walker@gmail.com</Item.Description>
          </Item.Content>
          <Item.Actions>
            <Button
              variant='ghost'
              color='neutral'
              size='sm'
              shape='square'
            >
              <Icon name='ellipsis' />
            </Button>
          </Item.Actions>
        </Item.Root>
        <Item.Root size='xs'>
          <Item.Media>
            <Avatar.Root
              size='fit'
              shape='square'
            >
              <Avatar.Image
                src='https://github.com/clerk.png'
                alt='Clerk Cloud'
              />
              <Avatar.Fallback>C</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Label>Clerk</Item.Label>
          </Item.Content>
          <Icon
            name='check'
            size='md'
          />
        </Item.Root>
        <Item.Root
          size='xs'
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
            <Avatar.Root
              size='fit'
              shape='square'
            >
              <Avatar.Image
                src='https://github.com/clerk.png'
                alt='Clerk Cloud'
              />
              <Avatar.Fallback>C</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Label>Clerk</Item.Label>
          </Item.Content>
        </Item.Root>
      </Item.Group>
      <Item.Separator />
      <Item.Group>
        <Item.Root
          size='xs'
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
            <Avatar.Root
              size='fit'
              shape='square'
            >
              <Avatar.Fallback>D</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Label>DesignCloud</Item.Label>
          </Item.Content>
        </Item.Root>
      </Item.Group>
      <Item.Separator />
      <Item.Group>
        <Item.Root
          size='xs'
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
            <Icon
              name='plus'
              size='sm'
            />
          </Item.Media>
          <Item.Content>
            <Item.Label variant='secondary'>Add account</Item.Label>
          </Item.Content>
        </Item.Root>
        <Item.Root
          size='xs'
          render={({ children, ...props }) => (
            <button
              type='button'
              {...props}
            >
              {children}
            </button>
          )}
        >
          <Item.Media>
            <Icon
              name='log-out'
              size='sm'
            />
          </Item.Media>
          <Item.Content>
            <Item.Label variant='secondary'>Sign out of all accounts</Item.Label>
          </Item.Content>
        </Item.Root>
      </Item.Group>
    </div>
  );
}

const organizations = [
  'Clerk',
  'Acme Corporation',
  'Globex',
  'Initech',
  'Umbrella Health',
  'DesignCloud',
  'Stark Industries',
  'Wayne Enterprises',
  'Cyberdyne Systems',
  'Soylent Industries',
  'Tyrell Corporation',
  'Weyland-Yutani',
];

// `Item.Group` is the canonical scroll surface, so this shows the atoms doing the minimum: cap a
// height, spread them on, and the group fades its own edges. The Scroll Area page under Styles
// carries the full surface — the gutter argument, the resting state, and the theming tokens.
export function Scrolling() {
  // `stylex.props()` returns a `className`, so it has to be MERGED with any class of your own
  // rather than spread beside one — whichever comes last in JSX wins outright.
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full border`}
      style={{ height: 200, borderRadius: radiusVars['--cl-radius-sm'] }}
    >
      <Item.Group {...stylex.props(...scrollAreaViewport())}>
        {organizations.map(name => (
          <Item.Root
            key={name}
            size='xs'
            render={({ children, ...props }) => (
              <button
                {...props}
                type='button'
              >
                {children}
              </button>
            )}
          >
            <Item.Media>
              <Avatar.Root
                size='fit'
                shape='square'
              >
                <Avatar.Image
                  src='https://github.com/clerk.png'
                  alt=''
                />
                <Avatar.Fallback>{name[0]}</Avatar.Fallback>
              </Avatar.Root>
            </Item.Media>
            <Item.Content>
              <Item.Label>{name}</Item.Label>
            </Item.Content>
          </Item.Root>
        ))}
      </Item.Group>
    </div>
  );
}
