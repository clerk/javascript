import { Text } from '@clerk/mosaic/components/text';
import type { UserProfileMfaMethod } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section.view';
import { UserProfileMfaSectionView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section.view';
import { useRef, useState } from 'react';

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
  const hasFailed = useRef(false);
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
      onSetDefault={async id => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!hasFailed.current) {
          hasFailed.current = true;
          throw new Error('Unable to update the default method. Please try again.');
        }
        setDefaultId(id);
      }}
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

export function AddMethod() {
  const [selection, setSelection] = useState('No method selected');
  const labels = { sms: 'SMS verification', authenticator: 'Authenticator app', 'backup-codes': 'Backup codes' };

  return (
    <div className='flex w-full flex-col gap-4'>
      <UserProfileMfaSectionView
        methods={[{ id: 'sms', type: 'sms', description: '+1 801-555-0100' }]}
        addableMethods={['sms', 'authenticator', 'backup-codes']}
        onAdd={type => setSelection(labels[type])}
        sectionTitle='Authentication'
      />
      <Text role='status'>{selection}</Text>
    </div>
  );
}

export function Removal() {
  const [methods, setMethods] = useState<UserProfileMfaMethod[]>([
    { id: 'authenticator', type: 'authenticator' },
    { id: 'sms', type: 'sms', description: '+1 801-555-0100' },
  ]);
  const hasFailed = useRef(false);
  const hasAuthenticator = methods.some(method => method.type === 'authenticator');

  return (
    <UserProfileMfaSectionView
      methods={methods.map(method => ({
        ...method,
        isDefault: method.type === 'authenticator' || !hasAuthenticator,
      }))}
      sectionTitle='Authentication'
      onRemove={async id => {
        await new Promise(resolve => setTimeout(resolve, 600));
        if (!hasFailed.current) {
          hasFailed.current = true;
          throw new Error('Could not remove this method. Please try again.');
        }
        setMethods(current => current.filter(method => method.id !== id));
      }}
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
