import { Avatar } from '@clerk/mosaic/components/avatar';
import { Button } from '@clerk/mosaic/components/button';
import { Icon } from '@clerk/mosaic/components/icon';
import { Item } from '@clerk/mosaic/components/item';
import { ChevronRight } from '@clerk/mosaic/icons/glyphs/chevron-right';
import { space } from '@clerk/mosaic/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './item.stories?raw';

const styles = stylex.create({
  iconWidth: {
    width: space['7'],
  },
});

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Item',
  source: 'packages/mosaic/src/components/item/item.tsx',
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

export function Group() {
  return (
    <div className='w-full'>
      <Item.Group>
        <Item.Root>
          <Item.Media>
            <Avatar.Root
              size='fit'
              shape='square'
            >
              <Avatar.Image
                src='https://github.com/clerk.png'
                alt='Clerk'
              />
              <Avatar.Fallback>C</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Label>Clerk</Item.Label>
            <Item.Description>Admin</Item.Description>
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
        <Item.Root
          render={({ children, ...props }) => (
            <a
              {...props}
              href='#designcloud'
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
            <Item.Description>Member</Item.Description>
          </Item.Content>
          <Icon
            glyph={ChevronRight}
            size='md'
            xstyle={styles.iconWidth}
          />
        </Item.Root>
      </Item.Group>
    </div>
  );
}
