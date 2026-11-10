import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';

import type { StoryMeta } from '@/lib/types';

import { usePrototype } from './fixtures/switcher';

export { default as __source } from './user-button.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  title: 'UserButton',
  label: 'User button',
  status: 'stable',
  source: 'packages/mosaic/src/features/user-button/user-button.tsx',
};

export function Default(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  return (
    <SwitcherView
      {...prototype}
      mode='user'
    />
  );
}

export function IconTrigger(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  return (
    <SwitcherView
      {...prototype}
      mode='user'
      showTriggerLabel={false}
    />
  );
}

export function IconTriggerSingleSession(_args: Record<string, unknown>) {
  const prototype = usePrototype({ singleSession: true });

  return (
    <SwitcherView
      {...prototype}
      mode='user'
      showTriggerLabel={false}
    />
  );
}
