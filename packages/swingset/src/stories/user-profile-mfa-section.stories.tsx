import type { UserProfileMfaMethod } from '@clerk/ui/mosaic/user-profile/user-profile-mfa-section.view';
import { UserProfileMfaSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-mfa-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-mfa-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileMfaSection',
  label: '2-step verification',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-mfa-section.view.tsx',
};

export function Default() {
  const [methods, setMethods] = useState<UserProfileMfaMethod[]>([
    { id: 'sms', type: 'sms', description: '+1 801-888-8181' },
    { id: 'backup', type: 'backup-codes' },
  ]);

  return (
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
      onRegenerateBackupCodes={() =>
        setMethods(current =>
          current.map(method => (method.type === 'backup-codes' ? { ...method, description: 'Just now' } : method)),
        )
      }
      onRemove={id => setMethods(current => current.filter(method => method.id !== id))}
    />
  );
}

export function Empty() {
  const [methods, setMethods] = useState<UserProfileMfaMethod[]>([]);

  return (
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
      onRegenerateBackupCodes={() =>
        setMethods(current =>
          current.map(method => (method.type === 'backup-codes' ? { ...method, description: 'Just now' } : method)),
        )
      }
      onRemove={id => setMethods(current => current.filter(method => method.id !== id))}
    />
  );
}
