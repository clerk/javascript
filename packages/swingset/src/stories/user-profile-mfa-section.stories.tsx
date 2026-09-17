import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import { UserProfileAddAuthenticatorView } from '@clerk/mosaic/features/user-profile/user-profile-add-authenticator.view';
import { UserProfileAddSmsView } from '@clerk/mosaic/features/user-profile/user-profile-add-sms.view';
import { UserProfileBackupCodesView } from '@clerk/mosaic/features/user-profile/user-profile-backup-codes.view';
import { UserProfileMfaSectionView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section.view';
import { type ComponentType, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useAuthenticatorCopy } from './fixtures/user-profile-authenticator';
import { mfaDemoOptions, useUserProfileMfaFixture } from './fixtures/user-profile-mfa';
import { useUserProfileMfaExample } from './fixtures/user-profile-mfa-example';

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
  const mfa = useUserProfileMfaExample();
  return <UserProfileMfaSectionView {...mfa.section} />;
}

export function Sms() {
  return <RestartableExample component={SmsExample} />;
}

function SmsExample({ onRestart }: { onRestart: () => void }) {
  const fixture = useUserProfileMfaFixture({ ...mfaDemoOptions, initialFlow: 'sms', enrollmentBackupCodes: [] });

  if (!fixture.sms.open) {
    return <ExampleComplete onRestart={onRestart} />;
  }

  return (
    <Card.Root renderBranding={false}>
      <UserProfileAddSmsView
        {...fixture.sms}
        onCancel={() => fixture.sms.onOpenChange(false)}
      />
    </Card.Root>
  );
}

export function Authenticator() {
  return <RestartableExample component={AuthenticatorExample} />;
}

function AuthenticatorExample({ onRestart }: { onRestart: () => void }) {
  const copy = useAuthenticatorCopy();
  const fixture = useUserProfileMfaFixture({
    ...mfaDemoOptions,
    initialFlow: 'authenticator',
    enrollmentBackupCodes: [],
  });

  if (!fixture.authenticator.open) {
    return <ExampleComplete onRestart={onRestart} />;
  }

  return (
    <Card.Root renderBranding={false}>
      <UserProfileAddAuthenticatorView
        {...fixture.authenticator}
        {...copy}
        onCancel={() => fixture.authenticator.onOpenChange(false)}
      />
    </Card.Root>
  );
}

export function BackupCodes() {
  return <RestartableExample component={BackupCodesExample} />;
}

function BackupCodesExample({ onRestart }: { onRestart: () => void }) {
  const fixture = useUserProfileMfaFixture({ ...mfaDemoOptions, initialFlow: 'backup-codes' });

  if (!fixture.backupCodes.open) {
    return <ExampleComplete onRestart={onRestart} />;
  }

  return (
    <Card.Root renderBranding={false}>
      <UserProfileBackupCodesView
        {...fixture.backupCodes}
        onCancel={() => fixture.backupCodes.onOpenChange(false)}
      />
    </Card.Root>
  );
}

function RestartableExample({ component: Component }: { component: ComponentType<{ onRestart: () => void }> }) {
  const [run, setRun] = useState(0);
  return (
    <Component
      key={run}
      onRestart={() => setRun(current => current + 1)}
    />
  );
}

function ExampleComplete({ onRestart }: { onRestart: () => void }) {
  return (
    <div>
      <Button
        type='button'
        onClick={onRestart}
      >
        Restart
      </Button>
    </div>
  );
}
