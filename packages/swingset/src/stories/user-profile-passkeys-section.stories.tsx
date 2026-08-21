import { SecurityPanelDialogsView } from '@clerk/ui/mosaic/user-profile/dialogs/security-panel-dialogs.view';
import { UserProfilePasskeysSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-passkeys-section.view';

import type { StoryMeta } from '@/lib/types';

import { DEFAULT_SECURITY_FLOW_CONFIG } from './user-profile-security-panel-flow.config';
import { useUserProfileSecurityPanelMockController } from './user-profile-security-panel-flow.controller';

export { default as __source } from './user-profile-passkeys-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfilePasskeysSection',
  label: 'Passkeys',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-passkeys-section.view.tsx',
};

export function Default() {
  const controller = useUserProfileSecurityPanelMockController();

  return (
    <>
      <UserProfilePasskeysSectionView
        creationState={controller.passkeyCreationState}
        passkeys={controller.passkeys ?? []}
        sectionTitle='Authentication'
        onAdd={controller.onAddPasskey}
        onManage={controller.onManagePasskey}
        onRemove={controller.onRemovePasskey}
      />
      <SecurityPanelDialogsView {...controller} />
    </>
  );
}

export function Empty() {
  const controller = useUserProfileSecurityPanelMockController({
    config: { ...DEFAULT_SECURITY_FLOW_CONFIG, hasPasskey: false },
  });

  return (
    <>
      <UserProfilePasskeysSectionView
        creationState={controller.passkeyCreationState}
        passkeys={controller.passkeys ?? []}
        sectionTitle='Authentication'
        onAdd={controller.onAddPasskey}
        onManage={controller.onManagePasskey}
        onRemove={controller.onRemovePasskey}
      />
      <SecurityPanelDialogsView {...controller} />
    </>
  );
}
