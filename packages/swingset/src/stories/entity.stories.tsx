import { Avatar } from '@clerk/mosaic/components/avatar';
import { Badge } from '@clerk/mosaic/components/badge';
import { Entity } from '@clerk/mosaic/components/entity';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './entity.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Entity',
  source: 'packages/mosaic/src/components/entity/entity.tsx',
};

export function Default() {
  return (
    <Entity.Root>
      <Entity.Media>
        <Avatar.Root size='fit'>
          <Avatar.Fallback />
        </Avatar.Root>
      </Entity.Media>
      <Entity.Content>
        <Entity.Label>Cameron Walker</Entity.Label>
        <Entity.Description>cameron@clerk.com</Entity.Description>
      </Entity.Content>
    </Entity.Root>
  );
}

export function WithBadge() {
  return (
    <Entity.Root>
      <Entity.Media>
        <Avatar.Root size='fit'>
          <Avatar.Fallback />
        </Avatar.Root>
      </Entity.Media>
      <Entity.Content>
        <Entity.Label>
          Cameron Walker
          <Badge>Default</Badge>
        </Entity.Label>
        <Entity.Description>cameron@clerk.com</Entity.Description>
      </Entity.Content>
    </Entity.Root>
  );
}

export function LabelOnly() {
  return (
    <Entity.Root>
      <Entity.Media>
        <Avatar.Root size='fit'>
          <Avatar.Fallback />
        </Avatar.Root>
      </Entity.Media>
      <Entity.Content>
        <Entity.Label>cameron@clerk.com</Entity.Label>
      </Entity.Content>
    </Entity.Root>
  );
}

export function Truncation() {
  return (
    <div style={{ width: 220 }}>
      <Entity.Root>
        <Entity.Media>
          <Avatar.Root size='fit'>
            <Avatar.Fallback />
          </Avatar.Root>
        </Entity.Media>
        <Entity.Content>
          <Entity.Label>
            Cameron Alexander Walker-Montgomery
            <Badge>Default</Badge>
          </Entity.Label>
          <Entity.Description>cameron.alexander.walker@clerk.com</Entity.Description>
        </Entity.Content>
      </Entity.Root>
    </div>
  );
}
