import type { UserProfilePasskey } from '@clerk/mosaic/features/user-profile/user-profile-passkeys-section.view';
import { useRef, useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosName, chaosRows, chaosText } from '@/lib/chaos';

interface PasskeysFixture {
  passkeys: UserProfilePasskey[];
  addError: string | undefined;
  onAdd: () => void;
  onRename: (id: string, name: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

const examplePasskeys: UserProfilePasskey[] = [
  { id: 'laptop', name: 'MacBook', createdAtLabel: 'Created today', lastUsedAtLabel: 'Last used 1 hour ago' },
  { id: 'phone', name: 'iPhone', createdAtLabel: 'Created yesterday' },
];

export function usePasskeysFixture({
  empty = false,
  failOnce = false,
}: { empty?: boolean; failOnce?: boolean } = {}): PasskeysFixture {
  const seed = useChaosFixture(examplePasskeys, items =>
    chaosRows(items, 12).map((passkey, index) => ({
      ...passkey,
      name: chaosName(index),
      createdAtLabel: chaosText(passkey.createdAtLabel),
      lastUsedAtLabel: chaosText(passkey.lastUsedAtLabel),
    })),
  );
  const [passkeys, setPasskeys] = useState(empty ? [] : seed);
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

  return {
    passkeys,
    addError,
    onAdd: () => {
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
    },
    onRename: async (id, name) => {
      await attempt('rename');
      setPasskeys(current => current.map(passkey => (passkey.id === id ? { ...passkey, name } : passkey)));
    },
    onRemove: async id => {
      await attempt('remove');
      setPasskeys(current => current.filter(passkey => passkey.id !== id));
    },
  };
}
