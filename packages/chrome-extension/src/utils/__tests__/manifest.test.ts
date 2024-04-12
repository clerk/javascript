import browser, { type Manifest } from 'webextension-polyfill';

import { missingManifestKeyError, missingValidManifestHostPermission } from '../errors';
import type { ValidatedManifest } from '../manifest';
import { getValidPossibleManifestHosts, validateHostPermissionExistence, validateManifest } from '../manifest';

const validClerkManifest = {
  permissions: ['cookies', 'storage'],
  host_permissions: ['http://localhost:3000'],
} as ValidatedManifest;

describe('Manifest', () => {
  describe('validateManifest(manifest)', () => {
    test('valid configuration', async () => {
      browser.runtime.getManifest = jest.fn().mockReturnValue(validClerkManifest);

      expect(() => validateManifest(validClerkManifest)).not.toThrowError();
    });

    describe('invalid configuration', () => {
      describe('permissions', () => {
        test('missing root key', async () => {
          const manifest = {
            host_permissions: ['https://*/*'],
          } as Manifest.WebExtensionManifest;

          expect(() => validateManifest(manifest)).toThrowError(missingManifestKeyError('permissions'));
        });

        test('missing cookies', async () => {
          const manifest = {
            permissions: ['storage'],
            host_permissions: ['https://*/*'],
          } as Manifest.WebExtensionManifest;

          expect(() => validateManifest(manifest)).toThrowError(missingManifestKeyError('permissions.cookies'));
        });

        test('missing storage', async () => {
          const manifest = {
            permissions: ['cookies'],
            host_permissions: ['https://*/*'],
          } as Manifest.WebExtensionManifest;

          expect(() => validateManifest(manifest)).toThrowError(missingManifestKeyError('permissions.storage'));
        });
      });

      describe('host_permissions', () => {
        test('missing root key', async () => {
          const manifest = {
            permissions: ['cookies', 'storage'],
          } as Manifest.WebExtensionManifest;

          expect(() => validateManifest(manifest)).toThrowError(missingManifestKeyError('host_permissions'));
        });
      });
    });
  });

  describe('validateHostPermissionExistence(manifest.host_permissions[])', () => {
    describe('valid configuration', () => {
      const hostHint = 'https://clerk.clerk.com';

      test('valid', () => {
        expect(() => validateHostPermissionExistence(['http://localhost:3000'], hostHint)).not.toThrowError();
      });

      test('invalid', () => {
        expect(() => validateHostPermissionExistence([], hostHint)).toThrowError(
          missingValidManifestHostPermission(hostHint),
        );
      });
    });
  });

  describe('getPossibleManifestHosts(manifest)', () => {
    describe('valid configuration', () => {
      test('should not throw error', async () => {
        expect(() => getValidPossibleManifestHosts(validClerkManifest)).not.toThrowError();
      });

      test('should return localhost', async () => {
        expect(() => getValidPossibleManifestHosts(validClerkManifest)).not.toThrowError();
      });
    });

    describe('configurations', () => {
      it('should appropriately parse host_permissions', () => {
        const host_permissions = [
          '<ALL_URLS>',
          'http://localhost',
          'http://localhost/',
          'http://localhost/*',
          'http://localhost:80/*',
          'http://localhost:*/*',
          'https://*.com/*',
          '*://developer.mozilla.org/*',
          '*://developer.mozilla.org*',
          '*://*.example.org/*',
          'https://developer.mozilla.org/*',
          'ftp://*.example.org/*',
          'https://example.org:80/',
          'https://example.org:*',
          'http://example.org:*',
          'https://example.org:*/*',
        ];

        const manifest = {
          permissions: ['cookies', 'storage'],
          host_permissions,
        } as ValidatedManifest;

        const result = [
          'http://localhost',
          'https://developer.mozilla.org',
          'https://example.org',
          'http://example.org',
        ];

        expect(getValidPossibleManifestHosts(manifest)).toStrictEqual(result);
      });
    });
  });
});
