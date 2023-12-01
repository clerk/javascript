import browser, { type Manifest } from 'webextension-polyfill';

import { missingManifestKeyError } from './errors';
import { validateManifest } from './validation';

const validClerkManifest = {
  permissions: ['cookies', 'storage'],
  host_permissions: ['https://*/*'],
} as Manifest.WebExtensionManifest;

describe('Validation', () => {
  describe('validateManifest(manifest)', () => {
    test('valid configuration', async () => {
      browser.runtime.getManifest = jest.fn().mockReturnValue({
        permissions: ['cookies', 'storage'],
        host_permissions: ['https://*/*'],
      } as Manifest.WebExtensionManifest);

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
        test('should work', async () => {
          const manifest = {
            permissions: ['cookies', 'storage'],
          } as Manifest.WebExtensionManifest;

          expect(() => validateManifest(manifest)).toThrowError(missingManifestKeyError('host_permissions'));
        });
      });
    });
  });
});
