import type {
  UserProfileEditNameValue,
  UserProfileFormError,
} from '@clerk/ui/mosaic/user-profile/user-profile-account-section';
import { useState } from 'react';

class FormError extends Error {
  constructor(
    message: string,
    readonly fields?: UserProfileFormError['fields'],
  ) {
    super(message);
    this.name = 'FormError';
  }
}

export interface UserProfileEditNameFixtureOptions {
  firstName?: string;
  lastName?: string;
  latency?: number;
  /** Rejects every save instead of committing it. */
  failWith?: UserProfileFormError;
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
    onSaveName: async (value: UserProfileEditNameValue) => {
      await new Promise(resolve => setTimeout(resolve, latency));
      if (failWith) {
        throw new FormError(failWith.message ?? 'Something went wrong.', failWith.fields);
      }
      setName(value);
    },
  };
}
