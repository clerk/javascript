import { clerkDevelopmentCache, createConfirmationMessage, createKeylessModeMessage } from './devCache';
import type { AccountlessApplication } from './types';

const KEYLESS_SOURCE_FALLBACK = 'javascript';
// Keep the source compact for BAPI metadata dimensions while covering common framework identifiers.
const KEYLESS_SOURCE_MAX_LENGTH = 36;

/**
 * Storage adapter interface for keyless mode.
 * Implementations can use file system, cookies, or other storage mechanisms.
 *
 * Implementations are responsible for their own concurrency handling
 * (e.g., file locking for file-based storage).
 */
export interface KeylessStorage {
  /**
   * Reads the stored keyless configuration.
   *
   * @returns The JSON string of the stored config, or empty string if not found.
   */
  read(): string;

  /**
   * Writes the keyless configuration to storage.
   *
   * @param data - The JSON string to store.
   */
  write(data: string): void;

  /**
   * Removes the keyless configuration from storage.
   */
  remove(): void;
}

/**
 * API adapter for keyless mode operations.
 * This abstraction allows the service to work without depending on @clerk/backend.
 */
export interface KeylessAPI {
  /**
   * Creates a new accountless application.
   *
   * @param requestHeaders - Optional headers to include with the request.
   * @param source - Optional source value to include with the request.
   * @returns The created AccountlessApplication or null if failed.
   */
  createAccountlessApplication(requestHeaders?: Headers, source?: string): Promise<AccountlessApplication | null>;

  /**
   * Notifies the backend that onboarding is complete (instance has been claimed).
   *
   * @param requestHeaders - Optional headers to include with the request.
   * @param source - Optional source value to include with the request.
   * @returns The updated AccountlessApplication or null if failed.
   */
  completeOnboarding(requestHeaders?: Headers, source?: string): Promise<AccountlessApplication | null>;
}

/**
 * Options for creating a keyless service.
 */
export interface KeylessServiceOptions {
  /**
   * Storage adapter for reading/writing keyless configuration.
   */
  storage: KeylessStorage;

  /**
   * API adapter for keyless operations (create application, complete onboarding).
   */
  api: KeylessAPI;

  /**
   * Optional: Framework name for metadata (e.g., 'Next.js', 'TanStack Start').
   */
  framework?: string;

  /**
   * Optional: Framework version for metadata.
   */
  frameworkVersion?: string;
}

/**
 * Result type for key resolution.
 */
export interface KeylessResult {
  publishableKey: string | undefined;
  secretKey: string | undefined;
  claimUrl: string | undefined;
  apiKeysUrl: string | undefined;
}

/**
 * The keyless service interface.
 */
export interface KeylessService {
  /**
   * Gets existing keyless keys or creates new ones via the API.
   */
  getOrCreateKeys: () => Promise<AccountlessApplication | null>;

  /**
   * Reads existing keyless keys without creating new ones.
   */
  readKeys: () => AccountlessApplication | undefined;

  /**
   * Removes the keyless configuration.
   */
  removeKeys: () => void;

  /**
   * Notifies the backend that the instance has been claimed/onboarded.
   * This should be called once when the user claims their instance.
   */
  completeOnboarding: () => Promise<AccountlessApplication | null>;

  /**
   * Logs a keyless mode message to the console (throttled to once per process).
   */
  logKeylessMessage: (claimUrl: string) => void;

  /**
   * Resolves Clerk keys, falling back to keyless mode if configured keys are missing.
   *
   * @param configuredPublishableKey - The publishable key from options or environment
   * @param configuredSecretKey - The secret key from options or environment
   * @returns The resolved keys (either configured or from keyless mode)
   */
  resolveKeysWithKeylessFallback: (
    configuredPublishableKey: string | undefined,
    configuredSecretKey: string | undefined,
  ) => Promise<KeylessResult>;
}

/**
 * Creates metadata headers for the keyless service.
 */
function createMetadataHeaders(framework?: string, frameworkVersion?: string): Headers {
  const headers = new Headers();

  if (framework) {
    headers.set('Clerk-Framework', framework);
  }
  if (frameworkVersion) {
    headers.set('Clerk-Framework-Version', frameworkVersion);
  }

  return headers;
}

function createSource(framework?: string): string {
  const source = (framework || KEYLESS_SOURCE_FALLBACK)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, KEYLESS_SOURCE_MAX_LENGTH);

  return source || KEYLESS_SOURCE_FALLBACK;
}

/**
 * Creates a keyless service that handles accountless application creation and storage.
 * This provides a simple API for frameworks to integrate keyless mode.
 *
 * @param options - Configuration for the service including storage and API adapters
 * @returns A keyless service instance
 *
 * @example
 * ```ts
 * import { createKeylessService } from '@clerk/shared/keyless';
 *
 * const keylessService = createKeylessService({
 *   storage: createFileStorage(),
 *   api: createKeylessAPI({ secretKey }),
 *   framework: 'TanStack Start',
 * });
 *
 * const keys = await keylessService.getOrCreateKeys(request);
 * if (keys) {
 *   console.log('Publishable Key:', keys.publishableKey);
 * }
 * ```
 */
export function createKeylessService(options: KeylessServiceOptions): KeylessService {
  const { storage, api, framework, frameworkVersion } = options;

  let hasLoggedKeylessMessage = false;
  const source = createSource(framework);

  const safeParseConfig = (): AccountlessApplication | undefined => {
    try {
      const data = storage.read();
      if (!data) {
        return undefined;
      }
      return JSON.parse(data) as AccountlessApplication;
    } catch {
      return undefined;
    }
  };

  return {
    async getOrCreateKeys(): Promise<AccountlessApplication | null> {
      // Check for existing config first
      const existingConfig = safeParseConfig();
      if (existingConfig?.publishableKey && existingConfig?.secretKey) {
        return existingConfig;
      }

      // Create metadata headers
      const headers = createMetadataHeaders(framework, frameworkVersion);

      // Create new keys via the API
      const accountlessApplication = await api.createAccountlessApplication(headers, source);

      if (accountlessApplication) {
        storage.write(JSON.stringify(accountlessApplication));
      }

      return accountlessApplication;
    },

    readKeys(): AccountlessApplication | undefined {
      return safeParseConfig();
    },

    removeKeys(): void {
      storage.remove();
    },

    async completeOnboarding(): Promise<AccountlessApplication | null> {
      const headers = createMetadataHeaders(framework, frameworkVersion);
      return api.completeOnboarding(headers, source);
    },

    logKeylessMessage(claimUrl: string): void {
      if (!hasLoggedKeylessMessage) {
        hasLoggedKeylessMessage = true;
        console.log(`[Clerk]: Running in keyless mode. Claim your keys at: ${claimUrl}`);
      }
    },

    async resolveKeysWithKeylessFallback(
      configuredPublishableKey: string | undefined,
      configuredSecretKey: string | undefined,
    ): Promise<KeylessResult> {
      let publishableKey = configuredPublishableKey;
      let secretKey = configuredSecretKey;
      let claimUrl: string | undefined;
      let apiKeysUrl: string | undefined;

      try {
        const locallyStoredKeys = safeParseConfig();

        // Check if running with claimed keys (configured keys match locally stored keyless keys)
        const runningWithClaimedKeys =
          Boolean(configuredPublishableKey) && configuredPublishableKey === locallyStoredKeys?.publishableKey;

        if (runningWithClaimedKeys && locallyStoredKeys) {
          // Complete onboarding when running with claimed keys
          try {
            await clerkDevelopmentCache?.run(() => this.completeOnboarding(), {
              cacheKey: `${locallyStoredKeys.publishableKey}_complete`,
              onSuccessStale: 24 * 60 * 60 * 1000, // 24 hours
            });
          } catch {
            // noop
          }

          clerkDevelopmentCache?.log({
            cacheKey: `${locallyStoredKeys.publishableKey}_claimed`,
            msg: createConfirmationMessage(),
          });

          return { publishableKey, secretKey, claimUrl, apiKeysUrl };
        }

        // In keyless mode, try to read/create keys from the file system
        if (!publishableKey && !secretKey) {
          const keylessApp: AccountlessApplication | null = await this.getOrCreateKeys();

          if (keylessApp) {
            publishableKey = keylessApp.publishableKey;
            secretKey = keylessApp.secretKey;
            claimUrl = keylessApp.claimUrl;
            apiKeysUrl = keylessApp.apiKeysUrl;

            clerkDevelopmentCache?.log({
              cacheKey: keylessApp.publishableKey,
              msg: createKeylessModeMessage(keylessApp),
            });
          }
        }
      } catch {
        // noop - fall through to return whatever keys we have
      }

      return { publishableKey, secretKey, claimUrl, apiKeysUrl };
    },
  };
}
