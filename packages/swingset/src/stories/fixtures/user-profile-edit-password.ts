import type {
  UserProfileEditPasswordField,
  UserProfileEditPasswordValue,
} from '@clerk/mosaic/features/user-profile/user-profile-password-section/user-profile-password-section.types';
import type { FormError } from '@clerk/mosaic/utils/form-error';
import { SaveError } from '@clerk/mosaic/utils/form-error';
import { useState } from 'react';

export interface UserProfileEditPasswordFixtureOptions {
  hasPassword?: boolean;
  requiresCurrentPassword?: boolean;
  latency?: number;
  /** Rejects the first save so the next attempt can succeed. */
  failWith?: FormError<UserProfileEditPasswordField>;
}

export function useUserProfileEditPasswordFixture({
  hasPassword: initialHasPassword = true,
  requiresCurrentPassword = true,
  latency = 800,
  failWith,
}: UserProfileEditPasswordFixtureOptions = {}) {
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [hasFailed, setHasFailed] = useState(false);

  return {
    hasPassword,
    requiresCurrentPassword,
    onSubmitPassword: async (_value: UserProfileEditPasswordValue) => {
      await new Promise(resolve => setTimeout(resolve, latency));
      if (failWith && !hasFailed) {
        setHasFailed(true);
        throw new SaveError(failWith);
      }
      setHasPassword(true);
    },
  };
}
