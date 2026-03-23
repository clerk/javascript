import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('sdk-versions', () => {
  beforeEach(() => {
    // Clear module cache to allow re-importing with different mocks
    vi.resetModules();
  });

  describe('meetsNextMinimumVersion', () => {
    it('should return true when version meets minimum major version', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '16.0.0' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(true);
    });

    it('should return true when version exceeds minimum major version', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '17.0.0' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(true);
    });

    it('should return false when version is below minimum major version', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '15.9.9' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(false);
    });

    it('should return false when version is exactly one below minimum', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '15.0.0' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(false);
    });

    it('should handle patch versions correctly', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '16.5.3' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(true);
    });

    it('should handle beta/prerelease versions correctly', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '16.0.0-beta.1' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(true);
    });

    it('should return false when version is missing', async () => {
      vi.doMock('next/package.json', () => ({
        default: {},
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(false);
    });

    it('should return false when version is null', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: null },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(false);
    });

    it('should return false when version is undefined', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: undefined },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(false);
    });

    it('should return false when version is an empty string', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(false);
    });

    it('should return false when version cannot be parsed as a number', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: 'invalid-version' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(false);
    });

    it('should handle single-digit major versions', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '9.0.0' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(false);
    });

    it('should handle double-digit major versions', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '20.0.0' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(true);
    });

    it('should handle version strings with leading zeros', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '016.0.0' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(true);
    });
  });

  describe('isNext16OrHigher', () => {
    it('should be a boolean value', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '16.0.0' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(typeof isNext16OrHigher).toBe('boolean');
    });

    it('should correctly identify Next.js 16', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '16.0.0' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(true);
    });

    it('should correctly identify Next.js 15 as not 16+', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '15.2.3' },
      }));

      const { isNext16OrHigher } = await import('../sdk-versions.js');
      expect(isNext16OrHigher).toBe(false);
    });
  });

  describe('middlewareFileReference', () => {
    it('should return "middleware or proxy" for Next.js 16+', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '16.0.0' },
      }));

      const { middlewareFileReference } = await import('../sdk-versions.js');
      expect(middlewareFileReference).toBe('middleware or proxy');
    });

    it('should return "middleware" for Next.js < 16', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '15.9.9' },
      }));

      const { middlewareFileReference } = await import('../sdk-versions.js');
      expect(middlewareFileReference).toBe('middleware');
    });

    it('should return "middleware or proxy" for Next.js 17+', async () => {
      vi.doMock('next/package.json', () => ({
        default: { version: '17.0.0' },
      }));

      const { middlewareFileReference } = await import('../sdk-versions.js');
      expect(middlewareFileReference).toBe('middleware or proxy');
    });
  });
});
