import type { UserProfilePasskey } from '@clerk/mosaic/features/user-profile/user-profile-passkeys-section.view';
import { UserProfilePasskeysSectionView } from '@clerk/mosaic/features/user-profile/user-profile-passkeys-section.view';
import type { ReactElement } from 'react';
import { useRef, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

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
  const [passkeys, setPasskeys] = useState<UserProfilePasskey[]>(
    empty
      ? []
      : [
          { id: 'laptop', name: 'MacBook', createdAtLabel: 'Created today', lastUsedAtLabel: 'Last used 1 hour ago' },
          { id: 'phone', name: 'iPhone', createdAtLabel: 'Created yesterday' },
        ],
  );
  const [addError, setAddError] = useState<string>();
  const failures = useRef(new Set<string>());
  const nextId = useRef(1);

  const attempt = async (action: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (failOnce && !failures.current.has(action)) {
      failures.current.add(action);
      throw new Error('Something went wrong. Please try again.');
    }
  };

  return (
    <UserProfilePasskeysSectionView
      passkeys={passkeys}
      sectionTitle='Authentication'
      addError={addError}
      onAdd={() => {
        if (failOnce && !failures.current.has('add')) {
          failures.current.add('add');
          setAddError('Could not create a passkey. Please try again.');
          return;
        }
        setAddError(undefined);
        const id = nextId.current++;
        setPasskeys(current => [
          ...current,
          { id: `new-${id}`, name: `New passkey ${id}`, createdAtLabel: 'Created just now' },
        ]);
      }}
      onRename={async (id, name) => {
        await attempt('rename');
        setPasskeys(current => current.map(passkey => (passkey.id === id ? { ...passkey, name } : passkey)));
      }}
      onRemove={async id => {
        await attempt('remove');
        setPasskeys(current => current.filter(passkey => passkey.id !== id));
      }}
    />
  );
}

export function Default(): ReactElement {
  return <PasskeysExample />;
}

export function Empty(): ReactElement {
  return <PasskeysExample empty />;
}

export function RecoverableErrors(): ReactElement {
  return <PasskeysExample failOnce />;
}
