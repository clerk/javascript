import { useClerk } from '@clerk/shared/react';
import { useEffect, useReducer, useRef } from 'react';

import type { Clerk } from '../../../../core/clerk';
import type { Environment } from '../../../../core/resources';
import { useEnvironment } from '../../../contexts';

const THROTTLE_DURATION_MS = 10 * 1000;

/**
 * Revalidates environment on focus, highly optimized for Keyless mode.
 * Attention: this is not a generic solution, and should not be used for revalidating environment inside UI components that are end-user facing (e.g. SignIn)
 */
function useRevalidateEnvironment() {
  const clerk = useClerk();
  const lastTouchTimestamp = useRef(Date.now());
  const [, forceUpdate] = useReducer(v => v + 1, 0);

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      'focus',

      async () => {
        const environment = (clerk as Clerk).__unstable__environment as Environment | undefined;

        if (!environment) {
          return;
        }

        if (environment.authConfig.claimedAt !== null) {
          return controller.abort();
        }

        // Re-fetch at most every 10 seconds
        if (Date.now() < lastTouchTimestamp.current + THROTTLE_DURATION_MS) {
          return;
        }

        if (document.visibilityState !== 'visible') {
          return;
        }

        const maxRetries = 2;

        for (let i = 0; i < maxRetries; i++) {
          const {
            authConfig: { claimedAt },
          } = await environment.fetch();
          lastTouchTimestamp.current = Date.now();

          if (claimedAt !== null) {
            forceUpdate();
            break;
          }
        }
      },
      {
        signal: controller.signal,
      },
    );

    return () => {
      controller.abort();
    };
  }, []);

  return useEnvironment();
}

export { useRevalidateEnvironment };
