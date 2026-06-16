/** @jsxImportSource @emotion/react */
import { Heading, headingRecipe } from '@clerk/ui/mosaic/components/heading';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Heading',
  source: 'packages/ui/src/mosaic/components/heading.tsx',
  styles: headingRecipe,
};

export function Default({
  size,
  intent,
}: {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  intent?: 'primary' | 'mutedForeground' | 'destructive';
}) {
  return (
    <Heading
      size={size}
      intent={intent}
    >
      This is a heading
    </Heading>
  );
}
