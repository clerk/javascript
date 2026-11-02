import { useUserProfilePasskeysSectionController } from '@clerk/mosaic/features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section.controller';
import type {
  UserProfilePasskey,
  UserProfilePasskeysSectionViewProps,
} from '@clerk/mosaic/features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section.view';
import { useRef, useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosPick, chaosRows } from '@/lib/chaos';

import { idleReverification } from './reverification';

const examplePasskeys: UserProfilePasskey[] = [
  { id: 'laptop', name: 'MacBook', createdAtLabel: 'Created today', lastUsedAtLabel: 'Last used 1 hour ago' },
  { id: 'phone', name: 'iPhone', createdAtLabel: 'Created yesterday' },
];

const chaosPasskeyNames = [
  'iCloud Keychain (MacBook Pro 16-inch, 2024)',
  'YubiKey 5C NFC, backup key in the office safe',
  'Windows Hello on ThinkPad X1 Carbon Gen 12',
  '1Password',
  'Google Password Manager on Pixel 9 Pro Fold',
];

export function usePasskeysFixture({
  empty = false,
  failOnce = false,
}: { empty?: boolean; failOnce?: boolean } = {}): UserProfilePasskeysSectionViewProps {
  const seed = useChaosFixture(examplePasskeys, items =>
    chaosRows(items, chaosPasskeyNames.length).map((passkey, index) => ({
      ...passkey,
      name: chaosPick(chaosPasskeyNames, index),
      createdAtLabel: 'Created September 28th, 2026',
      lastUsedAtLabel: 'Last used September 30th, 2026 at 11:47 PM',
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
    reverification: idleReverification,
    addReverification: idleReverification,
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
