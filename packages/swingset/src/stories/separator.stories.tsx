import { Separator } from '@clerk/mosaic/components/separator';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './separator.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Separator',
  source: 'packages/mosaic/src/components/separator/separator.tsx',
};

export function Default() {
  return <Separator />;
}

export function Labelled() {
  return <Separator>or</Separator>;
}
