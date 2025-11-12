const CLERK_PREFIX = '__clerk_';

export const CLERK_ENVIRONMENT_SETTING_PROMPT_REJECTED_KEY = 'environment_setting_prompt_rejected';

interface StorageEntry<T> {
  value: T;
  exp?: number;
}

const serialize = JSON.stringify;
const parse = JSON.parse;

/**
 * Safe wrapper around sessionStorage that automatically prefixes keys with 'clerk_'
 * and handles potential errors and entry expiration
 */
export class SafeSessionStorage {
  private static _key(key: string): string {
    return `${CLERK_PREFIX}${key}`;
  }

  private static isExpired(entry: StorageEntry<unknown>): boolean {
    return !!entry.exp && Date.now() > entry.exp;
  }

  static setItem(key: string, value: unknown, expiresInMs?: number): void {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return;
      }
      const entry: StorageEntry<unknown> = {
        value,
        ...(expiresInMs && { exp: Date.now() + expiresInMs }),
      };
      window.sessionStorage.setItem(this._key(key), serialize(entry));
    } catch {
      // noop
    }
  }

  static getItem<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return defaultValue;
      }
      const item = window.sessionStorage.getItem(this._key(key));
      if (!item) {
        return defaultValue;
      }
      const entry = parse(item) as unknown as StorageEntry<T> | undefined | null;

      if (!entry) {
        return defaultValue;
      }

      if (this.isExpired(entry)) {
        this.removeItem(key);
        return defaultValue;
      }

      return entry?.value ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static removeItem(key: string): void {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return;
      }
      window.sessionStorage.removeItem(this._key(key));
    } catch {
      // noop
    }
  }

  static isSupported(): boolean {
    return typeof window !== 'undefined' && !!window.sessionStorage;
  }
}
