import { UserProfilePasskeysSectionView } from '@clerk/mosaic/features/user-profile/user-profile-passkeys-section.view';
import type { ReactElement } from 'react';

import type { StoryMeta } from '@/lib/types';

import { usePasskeysFixture } from './fixtures/user-profile-passkeys';

export { default as __source } from './user-profile-passkeys-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfilePasskeysSection',
  label: 'Passkeys',
  navigation: { category: 'Sections' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-passkeys-section.view.tsx',
};

function PasskeysExample({ empty = false, failOnce = false }: { empty?: boolean; failOnce?: boolean }): ReactElement {
  const fixture = usePasskeysFixture({ empty, failOnce });
  return (
    <UserProfilePasskeysSectionView
      {...fixture}
      sectionTitle='Authentication'
    />
  );
}

export function Default(): ReactElement {
  return <PasskeysExample />;
}

export function Empty(): ReactElement {
  return <PasskeysExample empty />;
}

export function CreationUnavailable(): ReactElement {
  const fixture = usePasskeysFixture();
  return (
    <UserProfilePasskeysSectionView
      {...fixture}
      sectionTitle='Authentication'
      onAdd={undefined}
    />
  );
}

export function RecoverableErrors(): ReactElement {
  return <PasskeysExample failOnce />;
}
