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
 * API adapter for keyless mode operations on already-claimed applications.
 * This abstraction allows the service to work without depending on @clerk/backend.
 */
export interface KeylessAPI {
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
   * API adapter for keyless operations (complete onboarding).
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
 * The keyless service interface.
 */
export interface KeylessService {
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
 * Creates a keyless service that reads stored keyless keys and completes onboarding
 * for claimed applications.
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
 *   api: { completeOnboarding },
 *   framework: 'TanStack Start',
 * });
 *
 * const keys = keylessService.readKeys();
 * ```
 */
export function createKeylessService(options: KeylessServiceOptions): KeylessService {
  const { storage, api, framework, frameworkVersion } = options;

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
  };
}
