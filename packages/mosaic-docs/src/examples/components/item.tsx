'use client';

import { Avatar } from '@clerk/mosaic/components/avatar';
import { Badge } from '@clerk/mosaic/components/badge';
import { Icon } from '@clerk/mosaic/components/icon';
import { Item } from '@clerk/mosaic/components/item';
import { Building } from '@clerk/mosaic/icons/glyphs/building';
import { ChevronRight } from '@clerk/mosaic/icons/glyphs/chevron-right';

export default function ItemExample() {
  return (
    <Item.Group>
      <Item.Root>
        <Item.Media>
          <Avatar.Root size='fit'>
            <Avatar.Image
              src='https://github.com/clerk.png'
              alt=''
            />
            <Avatar.Fallback />
          </Avatar.Root>
        </Item.Media>
        <Item.Content>
          <Item.Label>Clerk</Item.Label>
          <Item.Description>12 members</Item.Description>
        </Item.Content>
        <Item.Actions>
          <Badge color='neutral'>Admin</Badge>
        </Item.Actions>
      </Item.Root>
      <Item.Root render={<button type='button' />}>
        <Item.Media>
          <Icon glyph={Building} />
        </Item.Media>
        <Item.Content>
          <Item.Label variant='interactive'>Create organization</Item.Label>
        </Item.Content>
        <Item.Actions>
          <Icon glyph={ChevronRight} />
        </Item.Actions>
      </Item.Root>
    </Item.Group>
  );
}
