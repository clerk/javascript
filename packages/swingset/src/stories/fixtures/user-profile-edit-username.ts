import type { UserProfileFormError } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.types';
import { UserProfileSaveError } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.types';
import { useState } from 'react';

import { settleAfter } from './simulated-latency';

export interface UserProfileEditUsernameFixtureOptions {
  username?: string;
  latency?: number;
  failWith?: UserProfileFormError;
}

export function useUserProfileEditUsernameFixture({
  username: initialUsername = 'prestonxyz',
  latency = 800,
  failWith,
}: UserProfileEditUsernameFixtureOptions = {}) {
  const [username, setUsername] = useState(initialUsername);

  return {
    username,
    onSubmitUsername: async (value: string) => {
      await settleAfter(latency);
      if (failWith) {
        throw new UserProfileSaveError(failWith.message ?? 'Something went wrong.', failWith.fields);
      }
      setUsername(value);
    },
  };
}
