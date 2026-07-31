/** @jsxImportSource @emotion/react */
import { Avatar } from '@clerk/ui/mosaic/components/avatar';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Icon } from '@clerk/ui/mosaic/components/icon';
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
        <Item.Title>Test Organization</Item.Title>
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
        <Item.Title>Test Organization</Item.Title>
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
            <Item.Title>Test Organization</Item.Title>
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
            <Item.Title>Cameron Walker</Item.Title>
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
            <Item.Title>Clerk</Item.Title>
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
            <Item.Title>Clerk</Item.Title>
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
            <Item.Title>DesignCloud</Item.Title>
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
            <Item.Label>Add account</Item.Label>
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
            <Item.Label>Sign out of all accounts</Item.Label>
          </Item.Content>
        </Item.Root>
      </Item.Group>
    </div>
  );
}
