import type {
  UserProfileEditNameValue,
  UserProfileFormError,
} from '@clerk/ui/mosaic/user-profile/user-profile-account-section';
import { useState } from 'react';

/** A rejection the dialog can render field by field, standing in for what the model will map. */
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
  /** How long a save takes, in ms. Long enough by default that the pending affordance is visible. */
  latency?: number;
  /** Rejects every save with this instead of committing it, to exercise the failure surface. */
  failWith?: UserProfileFormError;
}

/**
 * Stands in for the model: it holds the saved name and answers a save after a delay, with the
 * committed value or with the injected failure. Everything else the dialog needs — open state, the
 * typed values, pending, the error — belongs to the controller, so this is the whole seam.
 */
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
