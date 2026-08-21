import { SecurityPanelDialogsView } from '@clerk/ui/mosaic/user-profile/dialogs/security-panel-dialogs.view';
import { UserProfileMfaSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-mfa-section.view';

import type { StoryMeta } from '@/lib/types';

import { COMPOSED_SECURITY_FLOW_CONFIG } from './user-profile-security-panel-flow.config';
import { useUserProfileSecurityPanelMockController } from './user-profile-security-panel-flow.controller';

export { default as __source } from './user-profile-mfa-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileMfaSection',
  label: '2-step verification',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-mfa-section.view.tsx',
};

export function Default() {
  const controller = useUserProfileSecurityPanelMockController({
    config: COMPOSED_SECURITY_FLOW_CONFIG,
  });

  return (
    <>
      <UserProfileMfaSectionView
        addableMethods={controller.mfaAddableMethods}
        methods={controller.mfaMethods ?? []}
        sectionTitle='Authentication'
        onAdd={controller.onAddMfaMethod}
        onEnableBackupCodes={controller.onEnableBackupCodes}
        onRegenerateBackupCodes={controller.onRegenerateBackupCodes}
        onRemove={controller.onRemoveMfaMethod}
        onSetDefault={controller.onSetDefaultMfaMethod}
      />
      <SecurityPanelDialogsView {...controller} />
    </>
  );
}

export function Empty() {
  const controller = useUserProfileSecurityPanelMockController();

  return (
    <>
      <UserProfileMfaSectionView
        addableMethods={controller.mfaAddableMethods}
        methods={controller.mfaMethods ?? []}
        sectionTitle='Authentication'
        onAdd={controller.onAddMfaMethod}
        onEnableBackupCodes={controller.onEnableBackupCodes}
        onRegenerateBackupCodes={controller.onRegenerateBackupCodes}
        onRemove={controller.onRemoveMfaMethod}
        onSetDefault={controller.onSetDefaultMfaMethod}
      />
      <SecurityPanelDialogsView {...controller} />
    </>
  );
}
