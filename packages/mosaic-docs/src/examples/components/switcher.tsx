'use client';

import { Icon } from '@clerk/mosaic/components/icon';
import { Switcher } from '@clerk/mosaic/components/switcher';
import { Checkmark } from '@clerk/mosaic/icons/glyphs/checkmark';
import { Plus } from '@clerk/mosaic/icons/glyphs/plus';

export default function SwitcherExample() {
  return (
    <Switcher.Root>
      <Switcher.Trigger
        aria-label='Open account menu'
        avatar={
          <Switcher.BadgedAvatar
            name='Acme'
            badge={{ name: 'Alice Smith', imageUrl: 'https://github.com/clerk.png' }}
            size='sm'
          />
        }
        name='Acme'
        badge='Pro'
        variant='full'
      />
      <Switcher.Popup aria-label='Account menu'>
        <Switcher.Header
          avatar={
            <Switcher.BadgedAvatar
              name='Acme'
              badge={{ name: 'Alice Smith', imageUrl: 'https://github.com/clerk.png' }}
              size='md'
            />
          }
          title='Acme'
          description='alice@example.com'
        />
        <Switcher.Separator />
        <Switcher.Group>
          <Switcher.Item render={<button type='button' />}>
            <Switcher.ItemMedia>
              <Switcher.Avatar
                name='Acme'
                shape='square'
                size='fit'
              />
            </Switcher.ItemMedia>
            <Switcher.ItemContent>
              <Switcher.ItemLabel>Acme</Switcher.ItemLabel>
            </Switcher.ItemContent>
            <Switcher.ItemTrailing>
              <Icon glyph={Checkmark} />
            </Switcher.ItemTrailing>
          </Switcher.Item>
          <Switcher.Item render={<button type='button' />}>
            <Switcher.ItemMedia>
              <Switcher.Avatar
                name='Globex'
                shape='square'
                size='fit'
              />
            </Switcher.ItemMedia>
            <Switcher.ItemContent>
              <Switcher.ItemLabel>Globex</Switcher.ItemLabel>
            </Switcher.ItemContent>
          </Switcher.Item>
        </Switcher.Group>
        <Switcher.Separator />
        <Switcher.Group>
          <Switcher.Item render={<button type='button' />}>
            <Switcher.ItemMedia>
              <Icon glyph={Plus} />
            </Switcher.ItemMedia>
            <Switcher.ItemContent>
              <Switcher.ItemLabel variant='interactive'>Create organization</Switcher.ItemLabel>
            </Switcher.ItemContent>
          </Switcher.Item>
        </Switcher.Group>
      </Switcher.Popup>
    </Switcher.Root>
  );
}
