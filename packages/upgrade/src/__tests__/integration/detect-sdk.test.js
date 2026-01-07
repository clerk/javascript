import { describe, expect, it } from 'vitest';

import { detectSdk, getMajorVersion, getSdkVersion, normalizeSdkName } from '../../util/detect-sdk.js';
import { detectPackageManager } from '../../util/package-manager.js';
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

  it('returns null for catalog: protocol versions', () => {
    const version = getSdkVersion('nextjs', getFixturePath('nextjs-catalog'));
    expect(version).toBeNull();
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

  it('defaults to npm when no lock file exists', () => {
    const pm = detectPackageManager(getFixturePath('no-clerk'));
    expect(pm).toBe('npm');
  });
});
