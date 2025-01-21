import type { AccountlessApplication } from '@clerk/backend';
import { isDevelopmentEnvironment } from '@clerk/shared/utils';
// 10 minutes in milliseconds
const THROTTLE_DURATION_MS = 10 * 60 * 1000;

function createClerkDevLogger() {
  if (!isDevelopmentEnvironment()) {
    return;
  }

  if (!global.__clerk_internal_keyless_logger) {
    global.__clerk_internal_keyless_logger = {
      __cache: new Map<string, { expiresAt: number }>(),

      log: function ({ cacheKey, msg }: { cacheKey: string; msg: string }) {
        if (this.__cache.has(cacheKey) && Date.now() < (this.__cache.get(cacheKey)?.expiresAt || 0)) {
          return;
        }

        console.log(msg);

        this.__cache.set(cacheKey, {
          expiresAt: Date.now() + THROTTLE_DURATION_MS,
        });
      },
    };
  }

  return globalThis.__clerk_internal_keyless_logger;
}

export const createKeylessModeMessage = (keys: AccountlessApplication) => {
  return `\n\x1b[35m\n[Clerk]:\x1b[0m You are running in keyless mode.\nYou can \x1b[35mclaim your keys\x1b[0m by visiting ${keys.claimUrl}\n`;
};

export const createConfirmationMessage = () => {
  return `\n\x1b[35m\n[Clerk]:\x1b[0m Your application is running with your claimed keys.\nYou can safely remove the \x1b[35m.clerk/\x1b[0m from your project.\n`;
};

export const keylessLogger = createClerkDevLogger();
