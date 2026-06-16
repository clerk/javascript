/** @jsxImportSource @emotion/react */
import { Text, textRecipe } from '@clerk/ui/mosaic/components/text';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Text',
  source: 'packages/ui/src/mosaic/components/text.tsx',
  styles: textRecipe,
};

export function Default({
  size,
  intent,
}: {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  intent?: 'primary' | 'mutedForeground' | 'destructive';
}) {
  return (
    <Text
      size={size}
      intent={intent}
    >
      This is a text block.
    </Text>
  );
}
