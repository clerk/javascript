/** @jsxImportSource @emotion/react */
import { Button } from '@clerk/ui/mosaic/components/button';
import { Menu } from '@clerk/ui/mosaic/components/menu';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './menu.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Menu',
  source: 'packages/ui/src/mosaic/components/menu/menu.tsx',
  styleEngine: 'stylex',
};

const menuTrigger = (props: Omit<React.HTMLAttributes<HTMLElement>, 'color'>) => (
  <Button
    variant='outline'
    {...props}
  >
    Actions
  </Button>
);

export function Default() {
  return (
    <div style={{ paddingBlockEnd: '10rem' }}>
      <Menu trigger={menuTrigger}>
        <Menu.Item label='Edit' />
        <Menu.Item label='Duplicate' />
        <Menu.Separator />
        <Menu.Item label='Delete' />
      </Menu>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ paddingBlockEnd: '10rem' }}>
      <Menu trigger={menuTrigger}>
        <Menu.Item label='Edit' />
        <Menu.Item
          label='Duplicate'
          disabled
        />
        <Menu.Item label='Delete' />
      </Menu>
    </div>
  );
}

export function Submenu() {
  return (
    <div style={{ paddingBlockEnd: '12rem' }}>
      <Menu.Root>
        <Menu.Trigger render={menuTrigger} />
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Edit' />
              <Menu.Root>
                <Menu.SubTrigger>Share</Menu.SubTrigger>
                <Menu.Portal>
                  <Menu.Positioner>
                    <Menu.Popup>
                      <Menu.Item label='Copy link' />
                      <Menu.Item label='Email' />
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
              <Menu.Separator />
              <Menu.Item label='Delete' />
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
