import { UserProfileAddMfaDialog } from '@clerk/mosaic/features/user-profile/user-profile-add-mfa.dialog';
import { UserProfileMfaSetupView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-setup.view';
import type { UserProfileSecurityPanelViewProps } from '@clerk/mosaic/features/user-profile/user-profile-security-panel.view';

import { useAuthenticatorCopy } from './user-profile-authenticator';
import { useUserProfileMfaFixture } from './user-profile-mfa';

export function useUserProfileMfaExample() {
  const fixture = useUserProfileMfaFixture();
  const authenticatorCopy = useAuthenticatorCopy();
  const addControl = (
    <UserProfileAddMfaDialog
      open={fixture.setup.open}
      onOpenChange={fixture.setup.onOpenChange}
    >
      <UserProfileMfaSetupView
        step={fixture.setup.step}
        methods={fixture.section.addableMethods ?? []}
        onSelect={type => fixture.section.onAdd?.(type)}
        sms={fixture.sms}
        authenticator={{ ...fixture.authenticator, ...authenticatorCopy }}
        backupCodes={fixture.backupCodes}
        onCancel={() => fixture.setup.onOpenChange(false)}
      />
    </UserProfileAddMfaDialog>
  );
  const section = { ...fixture.section, addControl };
  const security: Pick<
    UserProfileSecurityPanelViewProps,
    | 'mfaMethods'
    | 'addableMfaMethods'
    | 'mfaAddControl'
    | 'onAddMfaMethod'
    | 'onSetDefaultMfaMethod'
    | 'onRemoveMfaMethod'
    | 'onRegenerateBackupCodes'
  > = {
    mfaMethods: section.methods,
    addableMfaMethods: section.addableMethods,
    mfaAddControl: addControl,
    onAddMfaMethod: section.onAdd,
    onSetDefaultMfaMethod: section.onSetDefault,
    onRemoveMfaMethod: section.onRemove,
    onRegenerateBackupCodes: section.onRegenerateBackupCodes,
  };
  return { section, security };
}
