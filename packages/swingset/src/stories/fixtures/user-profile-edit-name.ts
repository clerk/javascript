import type { UserProfileEditNameValue } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-edit-name.dialog';
import type { FormError } from '@clerk/mosaic/utils/save-result';
import { useState } from 'react';

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
  const [name, setName] = useState<UserProfileEditNameValue>({
    firstName: initialFirstName,
    lastName: initialLastName,
  });

  return {
    ...name,
    name: [name.firstName, name.lastName].filter(Boolean).join(' '),
    onSubmitName: async (value: UserProfileEditNameValue) => {
      await new Promise(resolve => setTimeout(resolve, latency));
      if (failWith) {
        return { error: failWith };
      }
      setName(value);
      return { error: null };
    },
  };
}
