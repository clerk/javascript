import { describe, expect, test } from 'vitest';
import type { Manifest } from 'webextension-polyfill';

import { missingManifestKeyError } from '../errors';
import { validateManifest } from '../manifest';

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
});
