import { CustomRecipeExample } from '@/components/motion-explorer/CustomRecipeExample';
import { MotionExplorer } from '@/components/motion-explorer/MotionExplorer';
import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Styles',
  status: 'wip',
  substatus: 'needs design',
  title: 'Motion',
  source: 'packages/mosaic/docs/motion.md',
};

export function Default() {
  return <MotionExplorer />;
}

export function CustomRecipe() {
  return <CustomRecipeExample />;
}
