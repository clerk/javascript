import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';

import type { StoryMeta } from '@/lib/types';

import { nestLabsWithClerkApp, personalAccount, usePrototype } from './fixtures/switcher';

export { default as __source } from './organization-switcher.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Switcher',
  title: 'OrganizationSwitcher',
  label: 'Organization switcher',
  status: 'stable',
  source: 'packages/mosaic/src/features/organization-switcher/organization-switcher.tsx',
};

export function Default(_args: Record<string, unknown>) {
  const prototype = usePrototype({ organizations: nestLabsWithClerkApp, hidePersonal: true });

  return (
    <SwitcherView
      {...prototype}
      mode='organization'
    />
  );
}

export function IconTrigger(_args: Record<string, unknown>) {
  const prototype = usePrototype({ organizations: nestLabsWithClerkApp, hidePersonal: true });

  return (
    <SwitcherView
      {...prototype}
      mode='organization'
      renderTriggerLabel={false}
    />
  );
}

export function WithPersonalAccount(_args: Record<string, unknown>) {
  const prototype = usePrototype({ organizations: nestLabsWithClerkApp });

  return (
    <SwitcherView
      {...prototype}
      mode='organization'
    />
  );
}

export function NoOrganizationSelected(_args: Record<string, unknown>) {
  const prototype = usePrototype({ organizations: personalAccount, hidePersonal: true });

  return (
    <SwitcherView
      {...prototype}
      mode='organization'
    />
  );
}
