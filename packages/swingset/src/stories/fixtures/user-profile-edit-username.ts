import type { UserProfileFormError } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.types';
import { UserProfileSaveError } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.types';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosName } from '@/lib/chaos';

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
  const seed = useChaosFixture(initialUsername, () => chaosName(7).toLowerCase());
  const [username, setUsername] = useState(seed);

  return {
    username,
    onSubmitUsername: async (value: string) => {
      await new Promise(resolve => setTimeout(resolve, latency));
      if (failWith) {
        throw new UserProfileSaveError(failWith.message ?? 'Something went wrong.', failWith.fields);
      }
      setUsername(value);
    },
  };
}
