import type { UserProfileMfaMethod } from '@clerk/ui/mosaic/user-profile/user-profile-mfa-section.view';
import { UserProfileMfaSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-mfa-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useBackupCodesDialogStory } from './helpers/use-backup-codes-dialog-story';

export { default as __source } from './user-profile-mfa-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileMfaSection',
  label: '2-step verification',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-mfa-section.view.tsx',
};

export function Default() {
  const { openBackupCodesDialog, backupCodesDialog } = useBackupCodesDialogStory();
  const [methods, setMethods] = useState<UserProfileMfaMethod[]>([
    { id: 'sms', type: 'sms', description: '+1 801-888-8181' },
    { id: 'backup', type: 'backup-codes' },
  ]);

  return (
    <>
      <UserProfileMfaSectionView
        methods={methods}
        sectionTitle='Authentication'
        onAdd={type =>
          setMethods(current => {
            const timestamp = Date.now();
            return [
              ...current,
              {
                id: `${type}-${timestamp}`,
                type,
                description: type === 'sms' ? '+1 801-555-0100' : undefined,
              },
              ...(current.some(method => method.type === 'backup-codes')
                ? []
                : [{ id: `backup-${timestamp}`, type: 'backup-codes' as const }]),
            ];
          })
        }
        onRegenerateBackupCodes={openBackupCodesDialog}
        onRemove={id => setMethods(current => current.filter(method => method.id !== id))}
      />
      {backupCodesDialog}
    </>
  );
}

export function Empty() {
  const { openBackupCodesDialog, backupCodesDialog } = useBackupCodesDialogStory();
  const [methods, setMethods] = useState<UserProfileMfaMethod[]>([]);

  return (
    <>
      <UserProfileMfaSectionView
        methods={methods}
        sectionTitle='Authentication'
        onAdd={type =>
          setMethods(current => {
            const timestamp = Date.now();
            return [
              ...current,
              {
                id: `${type}-${timestamp}`,
                type,
                description: type === 'sms' ? '+1 801-555-0100' : undefined,
              },
              ...(current.some(method => method.type === 'backup-codes')
                ? []
                : [{ id: `backup-${timestamp}`, type: 'backup-codes' as const }]),
            ];
          })
        }
        onRegenerateBackupCodes={openBackupCodesDialog}
        onRemove={id => setMethods(current => current.filter(method => method.id !== id))}
      />
      {backupCodesDialog}
    </>
  );
}
