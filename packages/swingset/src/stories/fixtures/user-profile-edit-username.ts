import type { FormError } from '@clerk/mosaic/utils/form-error';
import { SaveError } from '@clerk/mosaic/utils/form-error';
import { useState } from 'react';

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
  const [username, setUsername] = useState(initialUsername);

  return {
    username,
    onSubmitUsername: async (value: string) => {
      await new Promise(resolve => setTimeout(resolve, latency));
      if (failWith) {
        throw new SaveError(failWith);
      }
      setUsername(value);
    },
  };
}
