import { LoomHandoff, useLoomGeneration } from '@clerk/loom/handoff';

import { Button } from '../../components/button';
import { UserProfileConnectedAccountsSectionView } from '../../features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section.view';
import { UserProfileDangerSectionView } from '../../features/user-profile/user-profile-danger-section/user-profile-danger-section.view';
import { UserProfilePasswordSection } from '../../features/user-profile/user-profile-password-section/user-profile-password-section';
import { UserProfilePasswordSectionView } from '../../features/user-profile/user-profile-password-section/user-profile-password-section.view';
import { useMessages } from '../../localization';
import { useLoomConnectedAccounts, useLoomDanger, useLoomPassword } from './loom-account-status.model';
import { LoomSectionBoundary } from './loom-section-boundary';

export function LoomConnectedAccounts() {
  const display = useLoomConnectedAccounts();
  return display.status === 'hidden' ? null : (
    <UserProfileConnectedAccountsSectionView
      accounts={display.accounts}
      availableProviders={display.availableProviders}
      showEligibleActions
    />
  );
}

export function LoomPassword() {
  const generation = useLoomGeneration();
  return (
    <LoomSectionBoundary
      key={generation}
      failure='Could not load password status.'
    >
      <LoomHandoff live={<UserProfilePasswordSection />}>
        <LoomSectionBoundary failure='Could not load password status.'>
          <PasswordContent />
        </LoomSectionBoundary>
      </LoomHandoff>
    </LoomSectionBoundary>
  );
}

function PasswordContent() {
  const display = useLoomPassword();
  const m = useMessages('userProfilePasswordSection');
  if (!display.visible) {
    return null;
  }
  return (
    <UserProfilePasswordSectionView
      hasPassword={display.hasPassword}
      showReadonlyStatus
      action={
        !display.managed ? (
          <Button
            color='neutral'
            size='sm'
            variant='outline'
            disabled
          >
            {display.hasPassword ? m.change : m.set}
          </Button>
        ) : undefined
      }
      managedBy={display.managed ? { name: display.managedBy || m.enterpriseConnection } : undefined}
    />
  );
}

export function LoomDanger() {
  return useLoomDanger() ? <UserProfileDangerSectionView showDeleteAction /> : null;
}
