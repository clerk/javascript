import type { UserProfileMfaMethod } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section.view';
import { UserProfileMfaSectionView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-mfa-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'UserProfileMfaSection',
  label: '2-step verification',
  navigation: { category: 'Sections' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-mfa-section.view.tsx',
};

export function Default() {
  const [defaultId, setDefaultId] = useState('personal');
  const methods: UserProfileMfaMethod[] = [
    {
      id: 'personal',
      type: 'sms',
      description: '+1 801-555-0100',
      isDefault: defaultId === 'personal',
      canSetDefault: defaultId !== 'personal',
    },
    {
      id: 'work',
      type: 'sms',
      description: '+1 801-555-0200',
      isDefault: defaultId === 'work',
      canSetDefault: defaultId !== 'work',
    },
    { id: 'backup', type: 'backup-codes' },
  ];

  return (
    <UserProfileMfaSectionView
      methods={methods}
      sectionTitle='Authentication'
      onSetDefault={setDefaultId}
    />
  );
}

export function ReadOnly() {
  return (
    <UserProfileMfaSectionView
      methods={[
        { id: 'authenticator', type: 'authenticator', isDefault: true, canRemove: false },
        { id: 'sms', type: 'sms', description: '+1 801-555-0100' },
        { id: 'backup', type: 'backup-codes' },
      ]}
      sectionTitle='Authentication'
    />
  );
}

export function Empty() {
  return (
    <UserProfileMfaSectionView
      methods={[]}
      sectionTitle='Authentication'
    />
  );
}
