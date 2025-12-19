import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  getKeylessCookieName,
  parseKeylessCookieValue,
  serializeKeylessCookieValue,
  canUseKeyless,
  createKeylessModeMessage,
  createConfirmationMessage,
} from '../keyless';

describe('keyless cookie utilities', () => {
  describe('getKeylessCookieName', () => {
    it('should return a default cookie name when no path is provided', async () => {
      const name = await getKeylessCookieName();
      expect(name).toBe('__clerk_keys_0');
    });

    it('should return a hashed cookie name when path is provided', async () => {
      const name = await getKeylessCookieName('/Users/test/projects/my-app');
      expect(name).toMatch(/^__clerk_keys_[a-f0-9]{16}$/);
    });

    it('should return consistent names for the same path', async () => {
      const path = '/Users/test/projects/my-app';
      const name1 = await getKeylessCookieName(path);
      const name2 = await getKeylessCookieName(path);
      expect(name1).toBe(name2);
    });

    it('should return different names for different paths', async () => {
      const name1 = await getKeylessCookieName('/Users/test/projects/app1');
      const name2 = await getKeylessCookieName('/Users/test/projects/app2');
      expect(name1).not.toBe(name2);
    });
  });

  describe('parseKeylessCookieValue', () => {
    it('should return undefined for null/undefined input', () => {
      expect(parseKeylessCookieValue(null)).toBeUndefined();
      expect(parseKeylessCookieValue(undefined)).toBeUndefined();
      expect(parseKeylessCookieValue('')).toBeUndefined();
    });

    it('should parse valid JSON with required fields', () => {
      const value = JSON.stringify({
        publishableKey: 'pk_test_123',
        secretKey: 'sk_test_456',
        claimUrl: 'https://clerk.com/claim',
        apiKeysUrl: 'https://clerk.com/api-keys',
      });

      const result = parseKeylessCookieValue(value);
      expect(result).toEqual({
        publishableKey: 'pk_test_123',
        secretKey: 'sk_test_456',
        claimUrl: 'https://clerk.com/claim',
        apiKeysUrl: 'https://clerk.com/api-keys',
      });
    });

    it('should return undefined for invalid JSON', () => {
      expect(parseKeylessCookieValue('not json')).toBeUndefined();
    });

    it('should return undefined for JSON missing required fields', () => {
      expect(parseKeylessCookieValue(JSON.stringify({ publishableKey: 'pk_test' }))).toBeUndefined();
      expect(parseKeylessCookieValue(JSON.stringify({ secretKey: 'sk_test' }))).toBeUndefined();
      expect(parseKeylessCookieValue(JSON.stringify({}))).toBeUndefined();
    });
  });

  describe('serializeKeylessCookieValue', () => {
    it('should serialize an AccountlessApplication to JSON', () => {
      const app = {
        publishableKey: 'pk_test_123',
        secretKey: 'sk_test_456',
        claimUrl: 'https://clerk.com/claim',
        apiKeysUrl: 'https://clerk.com/api-keys',
      };

      const result = serializeKeylessCookieValue(app);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({
        claimUrl: 'https://clerk.com/claim',
        publishableKey: 'pk_test_123',
        secretKey: 'sk_test_456',
      });
    });
  });
});

describe('keyless feature flags', () => {
  describe('canUseKeyless', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should return false when disabled', () => {
      expect(canUseKeyless({ disabled: true })).toBe(false);
    });

    it('should return false in production', () => {
      process.env.NODE_ENV = 'production';
      expect(canUseKeyless()).toBe(false);
    });

    it('should return true in development when not disabled', () => {
      process.env.NODE_ENV = 'development';
      expect(canUseKeyless()).toBe(true);
    });
  });
});

describe('keyless messages', () => {
  describe('createKeylessModeMessage', () => {
    it('should create a message with the claim URL', () => {
      const keys = {
        publishableKey: 'pk_test_123',
        claimUrl: 'https://clerk.com/claim/abc',
        apiKeysUrl: 'https://clerk.com/api-keys',
      };

      const message = createKeylessModeMessage(keys);
      expect(message).toContain('keyless mode');
      expect(message).toContain('https://clerk.com/claim/abc');
    });
  });

  describe('createConfirmationMessage', () => {
    it('should create a confirmation message', () => {
      const message = createConfirmationMessage();
      expect(message).toContain('claimed keys');
      expect(message).toContain('.clerk/');
    });
  });
});
