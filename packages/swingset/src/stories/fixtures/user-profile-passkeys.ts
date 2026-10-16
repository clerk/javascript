import { useUserProfilePasskeysSectionController } from '@clerk/mosaic/features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section.controller';
import type {
  UserProfilePasskey,
  UserProfilePasskeysSectionViewProps,
} from '@clerk/mosaic/features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section.view';
import { useRef, useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosName, chaosRows, chaosText } from '@/lib/chaos';

const examplePasskeys: UserProfilePasskey[] = [
  { id: 'laptop', name: 'MacBook', createdAtLabel: 'Created today', lastUsedAtLabel: 'Last used 1 hour ago' },
  { id: 'phone', name: 'iPhone', createdAtLabel: 'Created yesterday' },
];

export function usePasskeysFixture({
  empty = false,
  failOnce = false,
}: { empty?: boolean; failOnce?: boolean } = {}): UserProfilePasskeysSectionViewProps {
  const seed = useChaosFixture(examplePasskeys, items =>
    chaosRows(items, 12).map((passkey, index) => ({
      ...passkey,
      name: chaosName(index),
      createdAtLabel: chaosText(passkey.createdAtLabel),
      lastUsedAtLabel: chaosText(passkey.lastUsedAtLabel),
    })),
  );
  const [passkeys, setPasskeys] = useState(empty ? [] : seed);
  const failures = useRef(new Set<string>());
  const nextId = useRef(1);

  const attempt = async (action: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (failOnce && !failures.current.has(action)) {
      failures.current.add(action);
      throw new Error('Something went wrong. Please try again.');
    }
  };

  return useUserProfilePasskeysSectionController({
    passkeys,
    onAdd: async () => {
      await attempt('add');
      const id = nextId.current++;
      setPasskeys(current => [
        ...current,
        { id: `new-${id}`, name: `New passkey ${id}`, createdAtLabel: 'Created just now' },
      ]);
    },
    validateName: () => undefined,
    onRename: async (id, name) => {
      await attempt('rename');
      setPasskeys(current => current.map(passkey => (passkey.id === id ? { ...passkey, name } : passkey)));
    },
    onRemove: async id => {
      await attempt('remove');
      setPasskeys(current => current.filter(passkey => passkey.id !== id));
    },
  });
}
