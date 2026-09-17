import { UserProfileAddAuthenticatorDialog } from '@clerk/mosaic/features/user-profile/user-profile-add-authenticator.dialog';
import { UserProfileAddSmsDialog } from '@clerk/mosaic/features/user-profile/user-profile-add-sms.dialog';
import { UserProfileBackupCodesDialog } from '@clerk/mosaic/features/user-profile/user-profile-backup-codes.dialog';
import { UserProfileMfaSectionView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section.view';
import { useRef } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileMfaFixture } from './fixtures/user-profile-mfa';

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
  const sectionRef = useRef<HTMLDivElement>(null);
  const fixture = useUserProfileMfaFixture({
    onCopy: codes => navigator.clipboard.writeText(codes.join('\n')),
    onDownload: codes => {
      const blob = new Blob(['Swingset demo backup codes\n\n', codes.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'swingset-backup-codes.txt';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    },
  });

  const finalFocus = fixture.authenticator.open || fixture.sms.open || fixture.backupCodes.open ? false : sectionRef;

  return (
    <>
      <div
        ref={sectionRef}
        tabIndex={-1}
        role='group'
        aria-label='Authentication'
      >
        <UserProfileMfaSectionView {...fixture.section} />
      </div>
      <UserProfileAddAuthenticatorDialog
        {...fixture.authenticator}
        finalFocus={finalFocus}
      />
      <UserProfileAddSmsDialog
        {...fixture.sms}
        finalFocus={finalFocus}
      />
      <UserProfileBackupCodesDialog
        {...fixture.backupCodes}
        finalFocus={finalFocus}
      />
    </>
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
