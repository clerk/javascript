import type { LoadedClerk } from '@clerk/types';
import { watchEffect } from 'vue';

import { useClerk } from '../composables';

export const useClerkLoaded = (callback: (clerk: LoadedClerk) => void) => {
  const clerk = useClerk();

  watchEffect(() => {
    if (!clerk.value?.loaded) {
      return;
    }

    callback(clerk.value as LoadedClerk);
  });
};
