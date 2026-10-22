import { useConfirmController } from '../../blocks/confirm';
import { Button } from '../../components/button';
import { ConnectedAccounts } from '../../features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section';
import { UserProfileConnectedAccountsSectionView } from '../../features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section.view';
import { UserProfileDangerSectionView } from '../../features/user-profile/user-profile-danger-section/user-profile-danger-section.view';
import { PasswordEditor } from '../../features/user-profile/user-profile-password-section/user-profile-password-section';
import { UserProfilePasswordSectionView } from '../../features/user-profile/user-profile-password-section/user-profile-password-section.view';
import { useMessages } from '../../localization';
import { useLoomConnectedAccounts, useLoomDanger, useLoomPassword } from './loom-account-status.model';
import { useLoomProfileIdentity } from './loom-profile-details.model';
import { LoomSectionBoundary } from './loom-section-boundary';

export function LoomConnectedAccounts() {
  const identity = useLoomProfileIdentity();
  return identity ? <ConnectedAccountsContent /> : null;
}

function ConnectedAccountsContent() {
  const { display, actions, userId } = useLoomConnectedAccounts();
  if (display.status === 'hidden') {
    return null;
  }
  return actions.status === 'ready' ? (
    <ConnectedAccounts
      model={{ ...display, ...actions, userId }}
      showEligibleActions
    />
  ) : (
    <UserProfileConnectedAccountsSectionView
      accounts={display.accounts}
      availableProviders={display.availableProviders}
      showEligibleActions
    />
  );
}

export function LoomPassword() {
  return (
    <LoomSectionBoundary failure='Could not load password status.'>
      <PasswordSection />
    </LoomSectionBoundary>
  );
}

function PasswordSection() {
  const identity = useLoomProfileIdentity();
  return identity ? <PasswordContent /> : null;
}

function PasswordContent() {
  const { display, actions } = useLoomPassword();
  const m = useMessages('userProfilePasswordSection');
  if (!display.visible) {
    return null;
  }
  if (!display.managed && actions.status === 'ready' && (actions.mode === 'change') === display.hasPassword) {
    return <PasswordEditor model={actions} />;
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
  const identity = useLoomProfileIdentity();
  return identity ? <DangerContent /> : null;
}

function DangerContent() {
  const { visible, actions } = useLoomDanger();
  const controller = useConfirmController({ onConfirm: actions.onDelete, reverification: actions.reverification });
  return visible ? (
    <UserProfileDangerSectionView
      showDeleteAction
      controller={actions.ready ? controller : undefined}
    />
  ) : null;
}
