import type { FormError } from '@clerk/mosaic/utils/save-result';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosName } from '@/lib/chaos';

export interface UserProfileEditUsernameFixtureOptions {
  username?: string;
  latency?: number;
  failWith?: FormError;
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
        return { error: failWith };
      }
      setUsername(value);
      return { error: null };
    },
  };
}
