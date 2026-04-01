import { isDevelopmentEnvironment } from '../utils/runtimeEnvironment';
import type { AccountlessApplication, PublicKeylessApplication } from './types';

// 10 minutes in milliseconds
const THROTTLE_DURATION_MS = 10 * 60 * 1000;

export interface ClerkDevCache {
  __cache: Map<string, { expiresAt: number; data?: unknown }>;
  /**
   * Log a message with throttling to prevent spam.
   */
  log: (params: { cacheKey: string; msg: string }) => void;
  /**
   * Run an async callback with caching.
   */
  run: <T>(
    callback: () => Promise<T>,
    options: {
      cacheKey: string;
      onSuccessStale?: number;
      onErrorStale?: number;
    },
  ) => Promise<T | undefined>;
}

declare global {
  var __clerk_internal_keyless_logger: ClerkDevCache | undefined;
}

/**
 * Creates a development-only cache for keyless mode logging and API calls.
 * This prevents console spam and duplicate API requests.
 *
 * @returns The cache instance or undefined in non-development environments
 */
export function createClerkDevCache(): ClerkDevCache | undefined {
  if (!isDevelopmentEnvironment()) {
    return undefined;
  }

  if (!globalThis.__clerk_internal_keyless_logger) {
    globalThis.__clerk_internal_keyless_logger = {
      __cache: new Map<string, { expiresAt: number; data?: unknown }>(),

      log: function ({ cacheKey, msg }) {
        if (this.__cache.has(cacheKey) && Date.now() < (this.__cache.get(cacheKey)?.expiresAt || 0)) {
          return;
        }

        console.log(msg);

        this.__cache.set(cacheKey, {
          expiresAt: Date.now() + THROTTLE_DURATION_MS,
        });
      },

      run: async function (
        callback,
        { cacheKey, onSuccessStale = THROTTLE_DURATION_MS, onErrorStale = THROTTLE_DURATION_MS },
      ) {
        if (this.__cache.has(cacheKey) && Date.now() < (this.__cache.get(cacheKey)?.expiresAt || 0)) {
          return this.__cache.get(cacheKey)?.data as ReturnType<typeof callback>;
        }

        try {
          const result = await callback();

          this.__cache.set(cacheKey, {
            expiresAt: Date.now() + onSuccessStale,
            data: result,
          });
          return result;
        } catch (e) {
          this.__cache.set(cacheKey, {
            expiresAt: Date.now() + onErrorStale,
          });

          throw e;
        }
      },
    };
  }

  return globalThis.__clerk_internal_keyless_logger;
}

/**
 * Creates the console message shown when running in keyless mode.
 *
 * @param keys - The keyless application keys
 * @returns Formatted console message
 */
export function createKeylessModeMessage(keys: AccountlessApplication | PublicKeylessApplication): string {
  return `\n\x1b[35m\n[Clerk]:\x1b[0m You are running in keyless mode.\nYou can \x1b[35mclaim your keys\x1b[0m by visiting ${keys.claimUrl}\n`;
}

/**
 * Creates the console message shown when keys have been claimed.
 *
 * @returns Formatted console message
 */
export function createConfirmationMessage(): string {
  return `\n\x1b[35m\n[Clerk]:\x1b[0m Your application is running with your claimed keys.\nYou can safely remove the \x1b[35m.clerk/\x1b[0m from your project.\n`;
}

/**
 * Shared singleton instance of the development cache.
 */
export const clerkDevelopmentCache = createClerkDevCache();
