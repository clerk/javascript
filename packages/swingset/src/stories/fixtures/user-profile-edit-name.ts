import type { UserProfileEditNameValue } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-edit-name.dialog';
import type { FormError } from '@clerk/mosaic/utils/errors';
import { SaveError } from '@clerk/mosaic/utils/errors';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosName } from '@/lib/chaos';

export interface UserProfileEditNameFixtureOptions {
  firstName?: string;
  lastName?: string;
  latency?: number;
  /** Fails every save instead of committing it. */
  failWith?: FormError;
}

/** Stands in for the model. Everything else the dialog needs belongs to the controller. */
export function useUserProfileEditNameFixture({
  firstName: initialFirstName = 'Preston',
  lastName: initialLastName = 'Booth',
  latency = 800,
  failWith,
}: UserProfileEditNameFixtureOptions = {}) {
  const seed = useChaosFixture({ firstName: initialFirstName, lastName: initialLastName }, () => ({
    firstName: chaosName(0),
    lastName: chaosName(7),
  }));
  const [name, setName] = useState<UserProfileEditNameValue>(seed);

  return {
    ...name,
    name: [name.firstName, name.lastName].filter(Boolean).join(' '),
    onSubmitName: async (value: UserProfileEditNameValue) => {
      await new Promise(resolve => setTimeout(resolve, latency));
      if (failWith) {
        throw new SaveError(failWith);
      }
      setName(value);
    },
  };
}
