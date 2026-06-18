/** @jsxImportSource @emotion/react */
import type { BadgeProps } from '@clerk/ui/mosaic/components/badge';
import { Badge, badgeRecipe } from '@clerk/ui/mosaic/components/badge';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './badge.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Badge',
  source: 'packages/ui/src/mosaic/components/badge.tsx',
  styles: badgeRecipe,
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as BadgeProps;
}

export function Primary(props: Record<string, unknown>) {
  return <Badge {...knobsAsProps(props)}>Badge</Badge>;
}

export function Intents(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Badge
        {...knobsAsProps(props)}
        intent='default'
      >
        Badge
      </Badge>
      <Badge
        {...knobsAsProps(props)}
        intent='primary'
      >
        Badge
      </Badge>
      <Badge
        {...knobsAsProps(props)}
        intent='positive'
      >
        Badge
      </Badge>
      <Badge
        {...knobsAsProps(props)}
        intent='negative'
      >
        Badge
      </Badge>
    </div>
  );
}
