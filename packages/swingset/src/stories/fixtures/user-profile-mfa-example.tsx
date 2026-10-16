import { UserProfileAddMfaDialog } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section/user-profile-add-mfa.dialog';
import { UserProfileMfaSetupView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section/user-profile-mfa-setup.view';

import { useUserProfileMfaFixture } from './user-profile-mfa';

export function useUserProfileMfaExample() {
  const fixture = useUserProfileMfaFixture();
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
        authenticator={fixture.authenticator}
        backupCodes={fixture.backupCodes}
        onBack={fixture.setup.onBack}
        onCancel={() => fixture.setup.onOpenChange(false)}
      />
    </UserProfileAddMfaDialog>
  );
  const section = { ...fixture.section, addControl };
  return { section };
}
