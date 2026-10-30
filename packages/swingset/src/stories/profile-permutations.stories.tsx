import type {
  OrganizationProfileModalContentProps,
  OrganizationProfileModalOptions,
} from '@clerk/mosaic/features/organization-profile/organization-profile.modal.types';
import { OrganizationProfileView } from '@clerk/mosaic/features/organization-profile/organization-profile.view';
import type { SwitcherViewProps } from '@clerk/mosaic/features/switcher/switcher.view';
import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';
import type { UserButtonMode } from '@clerk/mosaic/features/user-button/user-button';
import type {
  UserProfileModalContentProps,
  UserProfileModalOptions,
} from '@clerk/mosaic/features/user-profile/user-profile.modal.types';
import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';
import { defineModalSurface } from '@clerk/mosaic/modals/define-modal-surface';
import type { ModalSurfaces } from '@clerk/mosaic/modals/modal.types';
import { ModalHost } from '@clerk/mosaic/modals/modal-host';
import { useModal } from '@clerk/mosaic/modals/use-modal';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationProfileFixture } from './fixtures/organization-profile';
import { usePrototype } from './fixtures/switcher';
import { useUserProfileFixture } from './fixtures/user-profile';

export const meta: StoryMeta = {
  group: 'User Button',
  title: 'ProfilePermutations',
  label: 'Profile permutations',
  status: 'wip',
  source: 'packages/swingset/src/stories/profile-permutations.stories.tsx',
};

export function CombinedButtonCombinedProfile(_args: Record<string, unknown>) {
  return (
    <Permutation
      userButton='combined'
      profile='combined'
    />
  );
}

export function CombinedButtonSeparateProfiles(_args: Record<string, unknown>) {
  return (
    <Permutation
      userButton='combined'
      profile='separate'
    />
  );
}

export function UserButtonAccountProfile(_args: Record<string, unknown>) {
  return (
    <Permutation
      userButton='user'
      profile='separate'
    />
  );
}

export function UserButtonCombinedProfile(_args: Record<string, unknown>) {
  return (
    <Permutation
      userButton='user'
      profile='combined'
    />
  );
}

export function UserButtonAndSwitcherSeparateProfiles(_args: Record<string, unknown>) {
  return (
    <Permutation
      userButton='user'
      organizationSwitcher
      profile='separate'
    />
  );
}

export function UserButtonAndSwitcherCombinedProfile(_args: Record<string, unknown>) {
  return (
    <Permutation
      userButton='user'
      organizationSwitcher
      profile='combined'
    />
  );
}

export function SwitcherOrganizationProfile(_args: Record<string, unknown>) {
  return (
    <Permutation
      organizationSwitcher
      profile='separate'
    />
  );
}

export function SwitcherCombinedProfile(_args: Record<string, unknown>) {
  return (
    <Permutation
      organizationSwitcher
      profile='combined'
    />
  );
}

export function CombinedButtonAndSwitcher(_args: Record<string, unknown>) {
  return (
    <Permutation
      userButton='combined'
      organizationSwitcher
      profile='combined'
    />
  );
}

interface PermutationProps {
  userButton?: UserButtonMode;
  organizationSwitcher?: boolean;
  profile: 'combined' | 'separate';
}

function Permutation(props: PermutationProps) {
  return (
    <ModalHost surfaces={surfaces}>
      <Triggers {...props} />
    </ModalHost>
  );
}

function Triggers({ userButton, organizationSwitcher = false, profile }: PermutationProps) {
  const prototype = usePrototype();
  const [openSurface, setOpenSurface] = useState<'userButton' | 'organizationSwitcher'>('userButton');
  const userProfile = useModal(fixtureUserProfileModal);
  const organizationProfile = useModal(fixtureOrganizationProfileModal);
  const combined = profile === 'combined' && prototype.activeOrganization ? 'combined' : 'user';

  const manageAccount = () => {
    prototype.onManageAccount?.();
    userProfile.open({ mode: combined });
  };
  const manageOrganization = () => {
    prototype.onManageOrganization?.();
    if (profile === 'combined') {
      userProfile.open({ mode: combined, page: 'organization/general' });
    } else {
      organizationProfile.open();
    }
  };
  const surfaceProps = (surface: typeof openSurface): Omit<SwitcherViewProps, 'mode'> => ({
    ...prototype,
    open: prototype.open && openSurface === surface,
    onOpenChange: open => {
      setOpenSurface(surface);
      prototype.onOpenChange?.(open);
    },
    onManageAccount: manageAccount,
    onManageOrganization: manageOrganization,
  });

  return (
    <div className='flex flex-wrap items-center gap-4'>
      {organizationSwitcher ? (
        <SwitcherView
          {...surfaceProps('organizationSwitcher')}
          mode='organization'
        />
      ) : null}
      {userButton ? (
        <SwitcherView
          {...surfaceProps('userButton')}
          mode={userButton}
          triggerVariant={userButton === 'combined' ? 'full' : 'condensed'}
          onManageOrganization={userButton === 'combined' && profile === 'combined' ? undefined : manageOrganization}
        />
      ) : null}
    </div>
  );
}

const fixtureUserProfileModal = defineModalSurface<UserProfileModalOptions>({
  id: 'permutationUserProfile',
  variant: 'profile',
  load: () => Promise.resolve({ default: FixtureUserProfile }),
});

const fixtureOrganizationProfileModal = defineModalSurface<OrganizationProfileModalOptions>({
  id: 'permutationOrganizationProfile',
  variant: 'profile',
  load: () => Promise.resolve({ default: FixtureOrganizationProfile }),
});

const surfaces: ModalSurfaces = [fixtureUserProfileModal, fixtureOrganizationProfileModal];

function FixtureUserProfile({ options }: UserProfileModalContentProps) {
  const { pages } = useUserProfileFixture();
  const organization = useOrganizationProfileFixture();
  const [activePage, setActivePage] = useState(options?.page ?? 'account');

  return (
    <UserProfileView
      activePage={activePage}
      pages={pages}
      organization={options?.mode === 'combined' ? { pages: organization.pages } : undefined}
      onPageChange={setActivePage}
    />
  );
}

function FixtureOrganizationProfile(_props: OrganizationProfileModalContentProps) {
  const { activePage, setActivePage, pages } = useOrganizationProfileFixture();

  return (
    <OrganizationProfileView
      activePage={activePage}
      pages={pages}
      onPageChange={setActivePage}
    />
  );
}
