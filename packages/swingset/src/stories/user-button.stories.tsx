import { Button } from '@clerk/mosaic/components/button';
import { Icon } from '@clerk/mosaic/components/icon';
import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';
import { BadgedAvatar } from '@clerk/mosaic/features/switcher/switcher-avatar.view';
import type {
  UserProfileModalContentProps,
  UserProfileModalOptions,
} from '@clerk/mosaic/features/user-profile/user-profile.modal.types';
import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';
import { Cog6Teeth } from '@clerk/mosaic/icons/glyphs/cog-6-teeth';
import { defineModalSurface } from '@clerk/mosaic/modals/define-modal-surface';
import type { ModalSurfaces } from '@clerk/mosaic/modals/modal.types';
import { ModalHost } from '@clerk/mosaic/modals/modal-host';
import { useModal } from '@clerk/mosaic/modals/use-modal';
import { useEffect, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationProfileFixture } from './fixtures/organization-profile';
import { nestLabsWithClerkApp, usePrototype } from './fixtures/switcher';
import { useUserProfileFixture } from './fixtures/user-profile';

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
      triggerVariant='full'
    />
  );
}

export function CombinedCondensedTrigger(_args: Record<string, unknown>) {
  const prototype = usePrototype({ hidePersonal: true });

  return (
    <SwitcherView
      {...prototype}
      mode='combined'
      triggerVariant='condensed'
    />
  );
}

export function CombinedIconTrigger(_args: Record<string, unknown>) {
  const prototype = usePrototype({ hidePersonal: true });

  return (
    <SwitcherView
      {...prototype}
      mode='combined'
      showTriggerLabel={false}
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
      showTriggerLabel={false}
    />
  );
}

export function UserAvatarSingleSession(_args: Record<string, unknown>) {
  const prototype = usePrototype({ singleSession: true });

  return (
    <SwitcherView
      {...prototype}
      mode='user'
      showTriggerLabel={false}
    />
  );
}

// ─── Beyond the frames ──────────────────────────────────────────────────────

export function WithoutTriggerBadge(_args: Record<string, unknown>) {
  const prototype = usePrototype({ hidePersonal: true });

  return (
    <SwitcherView
      {...prototype}
      triggerVariant='full'
      triggerBadge={false}
    />
  );
}

export function CustomTriggerBadge(_args: Record<string, unknown>) {
  const prototype = usePrototype({ hidePersonal: true });

  return (
    <SwitcherView
      {...prototype}
      mode='combined'
      triggerVariant='full'
      triggerBadge={() => Promise.resolve({ id: 'enterprise', label: 'Enterprise plan' })}
    />
  );
}

const avatarControls = [
  { key: 'size', label: 'Avatar size', min: 24, max: 96, initial: 42 },
  { key: 'badgeSize', label: '--cl-avatar-badge-size', min: 8, max: 40, initial: 16 },
  { key: 'badgeGap', label: '--cl-avatar-badge-gap', min: 0, max: 8, initial: 1 },
  { key: 'badgeOffset', label: '--cl-avatar-badge-offset', min: -8, max: 16, initial: 4 },
] as const;

type AvatarControl = (typeof avatarControls)[number]['key'];

export function CustomizedAvatar(_args: Record<string, unknown>) {
  const prototype = usePrototype({ hidePersonal: true });
  const [values, setValues] = useState<Partial<Record<AvatarControl, number>>>({});
  const { activeOrganization, activeSession } = prototype;

  const declarations = [
    values.size === undefined ? '' : `width: ${values.size}px !important; height: ${values.size}px !important;`,
    values.badgeSize === undefined ? '' : `--cl-avatar-badge-size: ${values.badgeSize}px;`,
    values.badgeGap === undefined ? '' : `--cl-avatar-badge-gap: ${values.badgeGap}px;`,
    values.badgeOffset === undefined ? '' : `--cl-avatar-badge-offset: ${values.badgeOffset}px;`,
  ].join(' ');

  return (
    <div className='flex w-full flex-col gap-6'>
      <style>{`@scope { .cl-user-button-avatar { ${declarations} } }`}</style>
      <div className='flex h-28 flex-wrap items-center gap-8'>
        <SwitcherView
          {...prototype}
          mode='combined'
          triggerVariant='full'
        />
        {activeOrganization ? (
          <BadgedAvatar
            name={activeOrganization.name}
            imageUrl={activeOrganization.imageUrl}
            badge={activeSession}
            size='md'
          />
        ) : null}
      </div>
      <div className='grid gap-3 text-sm sm:grid-cols-2'>
        {avatarControls.map(control => (
          <div
            key={control.key}
            className='flex flex-col gap-1'
          >
            <span className='flex justify-between gap-2'>
              <label htmlFor={`customized-avatar-${control.key}`}>
                <code dir='ltr'>{control.label}</code>
              </label>
              <span className='text-muted-foreground'>
                {values[control.key] === undefined ? 'default' : `${values[control.key]}px`}
              </span>
            </span>
            <input
              id={`customized-avatar-${control.key}`}
              type='range'
              min={control.min}
              max={control.max}
              value={values[control.key] ?? control.initial}
              onChange={event => setValues({ ...values, [control.key]: Number(event.target.value) })}
            />
          </div>
        ))}
      </div>
      <div>
        <Button
          variant='outline'
          onClick={() => setValues({})}
        >
          Reset
        </Button>
      </div>
    </div>
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

  // The app's own rows join Settings, and `menuItemOrder` puts them wherever it names them. Ids for
  // rows the surface does not carry are ignored, so one order can cover every mode.
  return (
    <SwitcherView
      {...prototype}
      mode='combined'
      customMenuItems={[
        {
          id: 'app-settings',
          label: 'App settings',
          icon: (
            <Icon
              glyph={Cog6Teeth}
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
      menuItemOrder={['docs', 'settings', 'inviteMembers', 'app-settings']}
    />
  );
}

const integrationsPage = {
  label: 'Integrations',
  path: 'integrations',
  content: <p>An app-provided page, passed to the profile modal as a custom page.</p>,
};

function FixtureUserProfile({ options }: UserProfileModalContentProps) {
  const { pages } = useUserProfileFixture();
  const organization = useOrganizationProfileFixture();
  const [activePage, setActivePage] = useState(options?.page ?? 'account');

  return (
    <UserProfileView
      activePage={activePage}
      pages={pages}
      customPages={options?.customPages}
      pageOrder={options?.pageOrder}
      organization={options?.mode === 'user' ? undefined : { pages: organization.pages }}
      onPageChange={setActivePage}
    />
  );
}

const fixtureUserProfileModal = defineModalSurface<UserProfileModalOptions>({
  id: 'fixtureUserProfile',
  variant: 'profile',
  load: () => Promise.resolve({ default: FixtureUserProfile }),
});

const fixtureModalSurfaces: ModalSurfaces = [fixtureUserProfileModal];

export function ProfileModal(_args: Record<string, unknown>) {
  return (
    <ModalHost surfaces={fixtureModalSurfaces}>
      <ProfileModalTriggers />
    </ModalHost>
  );
}

function ProfileModalTriggers() {
  const prototype = usePrototype({ singleSession: true });
  const userProfile = useModal(fixtureUserProfileModal);

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <SwitcherView
        {...prototype}
        mode='combined'
        onManageAccount={() => {
          prototype.onManageAccount?.();
          userProfile.open({ customPages: [integrationsPage] });
        }}
        onManageOrganization={() => {
          prototype.onManageOrganization?.();
          userProfile.open({ page: 'organization/general', customPages: [integrationsPage] });
        }}
      />
      <Button
        variant='outline'
        onClick={() => userProfile.open({ page: 'security', customPages: [integrationsPage] })}
        onPointerEnter={userProfile.preload}
      >
        Open security
      </Button>
      <Button
        variant='outline'
        onClick={() => userProfile.open({ page: 'integrations', customPages: [integrationsPage] })}
        onPointerEnter={userProfile.preload}
      >
        Open integrations
      </Button>
      <Button
        variant='outline'
        onClick={() => userProfile.open({ page: 'organization/members', customPages: [integrationsPage] })}
        onPointerEnter={userProfile.preload}
      >
        Open organization members
      </Button>
      <Button
        variant='outline'
        onClick={() => userProfile.open({ mode: 'user', customPages: [integrationsPage] })}
        onPointerEnter={userProfile.preload}
      >
        Open account only
      </Button>
    </div>
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
