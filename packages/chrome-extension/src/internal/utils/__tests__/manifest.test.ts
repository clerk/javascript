import type { Manifest } from 'webextension-polyfill';

import { missingManifestKeyError, missingValidManifestHostPermission } from '../errors';
import type { ValidatedManifest } from '../manifest';
import { getValidPossibleManifestHosts, validateHostPermissionExistence, validateManifest } from '../manifest';

const validClerkManifest = {
  permissions: ['cookies', 'storage'],
  host_permissions: ['http://localhost:3000'],
} as ValidatedManifest;

describe('Manifest', () => {
  describe('validateManifest(manifest)', () => {
    describe('no features', () => {
      test('valid configuration', async () => {
        const manifest = {
          permissions: ['cookies', 'storage'],
          host_permissions: ['https://*/*'],
        } as Manifest.WebExtensionManifest;

        expect(() => validateManifest(manifest, {})).not.toThrow();
      });

      test('invalid configuration (permissions.storage)', async () => {
        const manifest = {
          permissions: ['cookies'],
          host_permissions: ['https://*/*'],
        } as Manifest.WebExtensionManifest;

        expect(() => validateManifest(manifest, {})).toThrow(missingManifestKeyError('permissions.storage'));
      });
    });

    describe('sync', () => {
      test('valid configuration', async () => {
        const manifest = {
          permissions: ['cookies', 'storage'],
          host_permissions: ['https://*/*'],
        } as Manifest.WebExtensionManifest;

        expect(() => validateManifest(manifest, { sync: true })).not.toThrow();
      });

      test('invalid configuration (permissions.storage)', async () => {
        const manifest = {
          permissions: ['cookies'],
          host_permissions: ['https://*/*'],
        } as Manifest.WebExtensionManifest;

        expect(() => validateManifest(manifest, { sync: true })).toThrow(
          missingManifestKeyError('permissions.storage'),
        );
      });

      test('invalid configuration (permissions.cookies)', async () => {
        const manifest = {
          permissions: ['storage'],
          host_permissions: ['https://*/*'],
        } as Manifest.WebExtensionManifest;

        expect(() => validateManifest(manifest, { sync: true })).toThrow(
          missingManifestKeyError('permissions.cookies'),
        );
      });

      test('invalid configuration (host_permissions)', async () => {
        const manifest = {
          permissions: ['cookies', 'storage'],
        } as Manifest.WebExtensionManifest;

        expect(() => validateManifest(manifest, { sync: true })).toThrow(missingManifestKeyError('host_permissions'));
      });
    });

    describe('background', () => {
      test('valid configuration', async () => {
        const manifest = {
          permissions: ['storage'],
          background: {
            service_worker: 'background.js',
            type: 'module',
          },
        } as Manifest.WebExtensionManifest;

        expect(() => validateManifest(manifest, { background: true })).not.toThrow();
      });

      test('invalid configuration (host_permissions)', async () => {
        const manifest = {
          permissions: ['storage'],
        } as Manifest.WebExtensionManifest;

        expect(() => validateManifest(manifest, { background: true })).toThrow(missingManifestKeyError('background'));
      });
    });
  });

  describe('validateHostPermissionExistence(manifest.host_permissions[])', () => {
    describe('valid configuration', () => {
      const hostHint = 'https://clerk.clerk.com';

      test('valid', () => {
        expect(() => validateHostPermissionExistence(['http://localhost:3000'], hostHint)).not.toThrow();
      });

      test('invalid', () => {
        expect(() => validateHostPermissionExistence([], hostHint)).toThrow(
          missingValidManifestHostPermission(hostHint),
        );
      });
    });
  });

  describe('getPossibleManifestHosts(manifest)', () => {
    describe('valid configuration', () => {
      test('should not throw error', async () => {
        expect(() => getValidPossibleManifestHosts(validClerkManifest)).not.toThrow();
      });

      test('should return localhost', async () => {
        expect(() => getValidPossibleManifestHosts(validClerkManifest)).not.toThrow();
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
