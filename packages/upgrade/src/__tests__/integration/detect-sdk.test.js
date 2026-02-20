import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  detectSdk,
  getMajorVersion,
  getSdkVersion,
  normalizeSdkName,
  resolveCatalogVersion,
} from '../../util/detect-sdk.js';
import {
  detectPackageManager,
  getInstallCommand,
  getUninstallCommand,
  isInPnpmWorkspace,
} from '../../util/package-manager.js';
import { getFixturePath } from '../helpers/create-fixture.js';

describe('detectSdk', () => {
  it('detects @clerk/nextjs from package.json', () => {
    const sdk = detectSdk(getFixturePath('nextjs-v6'));
    expect(sdk).toBe('nextjs');
  });

  it('detects @clerk/nextjs v7 from package.json', () => {
    const sdk = detectSdk(getFixturePath('nextjs-v7'));
    expect(sdk).toBe('nextjs');
  });

  it('detects @clerk/clerk-react (legacy name) from package.json', () => {
    const sdk = detectSdk(getFixturePath('react-v6'));
    expect(sdk).toBe('react');
  });

  it('detects @clerk/clerk-expo (legacy name) from package.json', () => {
    const sdk = detectSdk(getFixturePath('expo-old-package'));
    expect(sdk).toBe('expo');
  });

  it('returns null when no Clerk SDK is found', () => {
    const sdk = detectSdk(getFixturePath('no-clerk'));
    expect(sdk).toBeNull();
  });
});

describe('getSdkVersion', () => {
  it('returns major version 6 for nextjs-v6 fixture', () => {
    const version = getSdkVersion('nextjs', getFixturePath('nextjs-v6'));
    expect(version).toBe(6);
  });

  it('returns major version 7 for nextjs-v7 fixture', () => {
    const version = getSdkVersion('nextjs', getFixturePath('nextjs-v7'));
    expect(version).toBe(7);
  });

  it('returns major version 5 for clerk-react fixture', () => {
    const version = getSdkVersion('clerk-react', getFixturePath('react-v6'));
    expect(version).toBe(5);
  });

  it('returns major version 2 for clerk-expo fixture', () => {
    const version = getSdkVersion('clerk-expo', getFixturePath('expo-old-package'));
    expect(version).toBe(2);
  });

  it('returns null when SDK is not found', () => {
    const version = getSdkVersion('nextjs', getFixturePath('no-clerk'));
    expect(version).toBeNull();
  });

  it('returns null for catalog: protocol versions without pnpm-workspace.yaml', () => {
    const version = getSdkVersion('nextjs', getFixturePath('nextjs-catalog'));
    expect(version).toBeNull();
  });

  it('resolves catalog: protocol versions from pnpm-workspace.yaml', () => {
    const version = getSdkVersion('nextjs', getFixturePath('nextjs-catalog-resolved'));
    expect(version).toBe(6);
  });

  it('resolves named catalog: protocol versions from pnpm-workspace.yaml', () => {
    const version = getSdkVersion('nextjs', getFixturePath('nextjs-named-catalog'));
    expect(version).toBe(7);
  });
});

describe('getMajorVersion', () => {
  it('parses ^6.0.0 as version 6', () => {
    expect(getMajorVersion('^6.0.0')).toBe(6);
  });

  it('parses ~7.1.2 as version 7', () => {
    expect(getMajorVersion('~7.1.2')).toBe(7);
  });

  it('parses 5.0.0 as version 5', () => {
    expect(getMajorVersion('5.0.0')).toBe(5);
  });

  it('parses 14.2.3 as version 14', () => {
    expect(getMajorVersion('14.2.3')).toBe(14);
  });

  it('returns null for invalid semver', () => {
    expect(getMajorVersion('invalid')).toBeNull();
  });

  it('returns null for catalog: protocol', () => {
    expect(getMajorVersion('catalog:')).toBeNull();
  });

  it('returns null for catalog:default', () => {
    expect(getMajorVersion('catalog:default')).toBeNull();
  });

  it('returns null for workspace: protocol', () => {
    expect(getMajorVersion('workspace:*')).toBeNull();
  });
});

describe('normalizeSdkName', () => {
  it('returns null for null input', () => {
    expect(normalizeSdkName(null)).toBeNull();
  });

  it('strips @clerk/ prefix', () => {
    expect(normalizeSdkName('@clerk/nextjs')).toBe('nextjs');
  });

  it('converts clerk-react to react', () => {
    expect(normalizeSdkName('clerk-react')).toBe('react');
  });

  it('converts clerk-expo to expo', () => {
    expect(normalizeSdkName('clerk-expo')).toBe('expo');
  });

  it('returns name unchanged for standard names', () => {
    expect(normalizeSdkName('nextjs')).toBe('nextjs');
  });
});

describe('detectPackageManager', () => {
  it('detects pnpm from pnpm-lock.yaml', () => {
    const pm = detectPackageManager(getFixturePath('nextjs-v6'));
    expect(pm).toBe('pnpm');
  });

  it('detects yarn from yarn.lock', () => {
    const pm = detectPackageManager(getFixturePath('react-v6'));
    expect(pm).toBe('yarn');
  });

  it('detects npm from package-lock.json', () => {
    const pm = detectPackageManager(getFixturePath('expo-old-package'));
    expect(pm).toBe('npm');
  });

  it('defaults to npm when no lock file exists in any parent', () => {
    // Create a temp dir outside the monorepo so no parent lockfile is found
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-pm-test-'));
    try {
      const pm = detectPackageManager(tmpDir);
      expect(pm).toBe('npm');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('parent directory traversal', () => {
    let tmpRoot;
    let childDir;

    beforeEach(() => {
      tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-pm-traversal-'));
      childDir = path.join(tmpRoot, 'packages', 'web');
      fs.mkdirSync(childDir, { recursive: true });
    });

    afterEach(() => {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    });

    it('finds pnpm-lock.yaml in parent directory', () => {
      fs.writeFileSync(path.join(tmpRoot, 'pnpm-lock.yaml'), '');
      expect(detectPackageManager(childDir)).toBe('pnpm');
    });

    it('finds yarn.lock in parent directory', () => {
      fs.writeFileSync(path.join(tmpRoot, 'yarn.lock'), '');
      expect(detectPackageManager(childDir)).toBe('yarn');
    });

    it('finds packageManager field in parent package.json', () => {
      fs.writeFileSync(path.join(tmpRoot, 'package.json'), JSON.stringify({ packageManager: 'pnpm@9.0.0' }));
      expect(detectPackageManager(childDir)).toBe('pnpm');
    });

    it('prefers lockfile over packageManager field at same level', () => {
      fs.writeFileSync(path.join(tmpRoot, 'yarn.lock'), '');
      fs.writeFileSync(path.join(tmpRoot, 'package.json'), JSON.stringify({ packageManager: 'pnpm@9.0.0' }));
      expect(detectPackageManager(childDir)).toBe('yarn');
    });
  });
});

describe('resolveCatalogVersion', () => {
  it('resolves version from pnpm-workspace.yaml in same directory', () => {
    const version = resolveCatalogVersion('@clerk/nextjs', getFixturePath('nextjs-catalog-resolved'));
    expect(version).toBe('^6.0.0');
  });

  it('returns null when pnpm-workspace.yaml does not exist', () => {
    const version = resolveCatalogVersion('@clerk/nextjs', getFixturePath('nextjs-catalog'));
    expect(version).toBeNull();
  });

  it('returns null when package is not in catalog', () => {
    const version = resolveCatalogVersion('@clerk/unknown-pkg', getFixturePath('nextjs-catalog-resolved'));
    expect(version).toBeNull();
  });

  it('traverses parent directories to find pnpm-workspace.yaml', () => {
    // The nextjs-catalog-resolved fixture has pnpm-workspace.yaml at root
    // Searching from its src/ subdirectory should still find it
    const srcDir = path.join(getFixturePath('nextjs-catalog-resolved'), 'src');
    const version = resolveCatalogVersion('@clerk/nextjs', srcDir);
    expect(version).toBe('^6.0.0');
  });

  it('resolves version from a named catalog section', () => {
    const version = resolveCatalogVersion('@clerk/nextjs', getFixturePath('nextjs-named-catalog'), 'clerk');
    expect(version).toBe('^7.0.0');
  });

  it('resolves correct version when package exists in multiple named catalogs', () => {
    const peerVersion = resolveCatalogVersion('react', getFixturePath('nextjs-named-catalog'), 'peer-react');
    expect(peerVersion).toBe('^18.0.0');

    const pinnedVersion = resolveCatalogVersion('react', getFixturePath('nextjs-named-catalog'), 'react');
    expect(pinnedVersion).toBe('18.3.1');
  });

  it('returns null when named catalog does not exist', () => {
    const version = resolveCatalogVersion('@clerk/nextjs', getFixturePath('nextjs-named-catalog'), 'nonexistent');
    expect(version).toBeNull();
  });
});

describe('isInPnpmWorkspace', () => {
  it('returns true when pnpm-workspace.yaml exists in current directory', () => {
    expect(isInPnpmWorkspace(getFixturePath('nextjs-catalog-resolved'))).toBe(true);
  });

  it('returns true when pnpm-workspace.yaml exists in parent directory', () => {
    const srcDir = path.join(getFixturePath('nextjs-catalog-resolved'), 'src');
    expect(isInPnpmWorkspace(srcDir)).toBe(true);
  });

  it('returns false when no pnpm-workspace.yaml exists in any parent', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-ws-test-'));
    try {
      expect(isInPnpmWorkspace(tmpDir)).toBe(false);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('getInstallCommand', () => {
  it('adds -w flag for pnpm at workspace root', () => {
    const dir = getFixturePath('nextjs-catalog-resolved');
    const [cmd, args] = getInstallCommand('pnpm', '@clerk/nextjs', '7.0.0', dir);
    expect(cmd).toBe('pnpm');
    expect(args).toContain('-w');
  });

  it('adds -w flag for pnpm from a workspace subdirectory', () => {
    const srcDir = path.join(getFixturePath('nextjs-catalog-resolved'), 'src');
    const [cmd, args] = getInstallCommand('pnpm', '@clerk/nextjs', '7.0.0', srcDir);
    expect(cmd).toBe('pnpm');
    expect(args).toContain('-w');
  });

  it('does not add -w flag for pnpm outside a workspace', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-no-ws-'));
    try {
      const [cmd, args] = getInstallCommand('pnpm', '@clerk/nextjs', '7.0.0', tmpDir);
      expect(cmd).toBe('pnpm');
      expect(args).not.toContain('-w');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('does not add -w flag for non-pnpm managers', () => {
    const dir = getFixturePath('nextjs-catalog-resolved');
    const [cmd, args] = getInstallCommand('npm', '@clerk/nextjs', '7.0.0', dir);
    expect(cmd).toBe('npm');
    expect(args).not.toContain('-w');
  });
});

describe('getUninstallCommand', () => {
  it('adds -w flag for pnpm at workspace root', () => {
    const dir = getFixturePath('nextjs-catalog-resolved');
    const [cmd, args] = getUninstallCommand('pnpm', '@clerk/nextjs', dir);
    expect(cmd).toBe('pnpm');
    expect(args).toContain('-w');
  });

  it('adds -w flag for pnpm from a workspace subdirectory', () => {
    const srcDir = path.join(getFixturePath('nextjs-catalog-resolved'), 'src');
    const [cmd, args] = getUninstallCommand('pnpm', '@clerk/nextjs', srcDir);
    expect(cmd).toBe('pnpm');
    expect(args).toContain('-w');
  });

  it('does not add -w flag for pnpm outside a workspace', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-no-ws-'));
    try {
      const [cmd, args] = getUninstallCommand('pnpm', '@clerk/nextjs', tmpDir);
      expect(cmd).toBe('pnpm');
      expect(args).not.toContain('-w');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
