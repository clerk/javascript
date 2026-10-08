import { Icon } from '@clerk/mosaic/components/icon';
import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';
import { useEffect, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { nestLabsWithClerkApp, usePrototype } from './fixtures/switcher';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './user-button.stories?raw';

export const meta: StoryMeta = {
  group: 'User Button',
  title: 'UserButton',
  label: 'User button',
  status: 'stable',
  source: 'packages/mosaic/src/features/switcher/switcher.view.tsx',
};

// ─── Mode: Combined ─────────────────────────────────────────────────────────

export function Combined(_args: Record<string, unknown>) {
  const prototype = usePrototype({ hidePersonal: true });

  return (
    <SwitcherView
      {...prototype}
      mode='combined'
    />
  );
}

export function CombinedIconTrigger(_args: Record<string, unknown>) {
  const prototype = usePrototype({ hidePersonal: true });

  return (
    <SwitcherView
      {...prototype}
      mode='combined'
      renderTriggerLabel={false}
    />
  );
}

export function CombinedSingleAccount(_args: Record<string, unknown>) {
  const prototype = usePrototype({ organizations: nestLabsWithClerkApp, singleSession: true, hidePersonal: true });

  return (
    <SwitcherView
      {...prototype}
      mode='combined'
    />
  );
}

// ─── Mode: User only ────────────────────────────────────────────────────────

export function User(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  return (
    <SwitcherView
      {...prototype}
      mode='user'
    />
  );
}

export function UserAvatarTrigger(_args: Record<string, unknown>) {
  const prototype = usePrototype();

  return (
    <SwitcherView
      {...prototype}
      mode='user'
      renderTriggerLabel={false}
    />
  );
}

export function UserAvatarSingleSession(_args: Record<string, unknown>) {
  const prototype = usePrototype({ singleSession: true });

  return (
    <SwitcherView
      {...prototype}
      mode='user'
      renderTriggerLabel={false}
    />
  );
}

// ─── Beyond the frames ──────────────────────────────────────────────────────

export function WithoutTriggerBadge(_args: Record<string, unknown>) {
  const prototype = usePrototype({ hidePersonal: true });

  return (
    <SwitcherView
      {...prototype}
      renderTriggerBadge={false}
    />
  );
}

export function SingleSession(_args: Record<string, unknown>) {
  const prototype = usePrototype({ singleSession: true, hidePersonal: true });

  // What an instance in single-session mode hands the view: one account, and neither of the two
  // actions that only make sense with a second one. The foot signs out of just that account.
  return (
    <SwitcherView
      {...prototype}
      mode='combined'
      onAddAccount={undefined}
      onSignOutAll={undefined}
    />
  );
}

export function CustomMenuItems(_args: Record<string, unknown>) {
  const prototype = usePrototype({ singleSession: true, hidePersonal: true });

  // The app's own rows join the foot, and `menuItemOrder` puts them wherever it names them. Ids for
  // rows the surface does not carry are ignored, so one order can cover every mode.
  return (
    <SwitcherView
      {...prototype}
      mode='combined'
      // One account resolves the accounts row to "Add account", which is the form `menuItemOrder`
      // names by either id.
      customMenuItems={[
        {
          id: 'settings',
          label: 'App settings',
          icon: (
            <Icon
              name='cog-6-teeth'
              size='sm'
            />
          ),
          onClick: () => {},
        },
        // `icon` takes any node, so an app brings its own glyph rather than picking from Mosaic's set.
        {
          id: 'docs',
          label: 'Documentation',
          icon: (
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M2.5 3.5h4a2 2 0 0 1 2 2v7a1.5 1.5 0 0 0-1.5-1.5h-4.5Z' />
              <path d='M14.5 3.5h-4a2 2 0 0 0-2 2v7a1.5 1.5 0 0 1 1.5-1.5h4.5Z' />
            </svg>
          ),
          href: 'https://clerk.com/docs',
        },
      ]}
      menuItemOrder={['docs', 'addAccount', 'signOut', 'settings']}
    />
  );
}

// Longer than the action latency above: this one is there to be caught, not to be got past.
const ORGANIZATIONS_LATENCY_MS = 2500;

/**
 * The organization list's first page landing under a popup that is already open. The other examples
 * are handed their organizations on the first render, so the placeholder they would show has
 * nothing to show it. The wait restarts on every open, so it can be watched more than once.
 */
export function LoadingOrganizations(_args: Record<string, unknown>) {
  const prototype = usePrototype({ hidePersonal: true });
  const [organizationsLoading, setOrganizationsLoading] = useState(false);

  useEffect(() => {
    if (!prototype.open) {
      return;
    }
    setOrganizationsLoading(true);
    const timer = setTimeout(() => setOrganizationsLoading(false), ORGANIZATIONS_LATENCY_MS);
    return () => clearTimeout(timer);
  }, [prototype.open]);

  return (
    <SwitcherView
      {...prototype}
      mode='combined'
      organizationsLoading={organizationsLoading}
    />
  );
}
