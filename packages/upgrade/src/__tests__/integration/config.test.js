import { describe, expect, it } from 'vitest';

import { getOldPackageName, getTargetPackageName, loadConfig } from '../../config.js';

describe('loadConfig', () => {
  it('returns config with needsUpgrade: true for nextjs v6', async () => {
    const config = await loadConfig('nextjs', 6);

    expect(config).not.toBeNull();
    expect(config.id).toBe('core-3');
    expect(config.needsUpgrade).toBe(true);
    expect(config.alreadyUpgraded).toBe(false);
  });

  it('returns config with alreadyUpgraded: true for nextjs v7', async () => {
    const config = await loadConfig('nextjs', 7);

    expect(config).not.toBeNull();
    expect(config.id).toBe('core-3');
    expect(config.needsUpgrade).toBe(false);
    expect(config.alreadyUpgraded).toBe(true);
  });

  it('returns config with needsUpgrade: true for react v6', async () => {
    const config = await loadConfig('react', 6);

    expect(config).not.toBeNull();
    expect(config.needsUpgrade).toBe(true);
  });

  it('returns config with needsUpgrade: true for expo v2', async () => {
    const config = await loadConfig('expo', 2);

    expect(config).not.toBeNull();
    expect(config.needsUpgrade).toBe(true);
  });

  it('returns null for unsupported SDK version (too old)', async () => {
    const config = await loadConfig('nextjs', 4);

    expect(config).toBeNull();
  });

  it('loads codemods array from config', async () => {
    const config = await loadConfig('nextjs', 6);

    expect(config.codemods).toBeDefined();
    expect(Array.isArray(config.codemods)).toBe(true);
    expect(config.codemods.length).toBeGreaterThan(0);
  });

  it('loads changes array from config', async () => {
    const config = await loadConfig('nextjs', 6);

    expect(config.changes).toBeDefined();
    expect(Array.isArray(config.changes)).toBe(true);
  });

  it('includes docsUrl in config', async () => {
    const config = await loadConfig('nextjs', 6);

    expect(config.docsUrl).toBeDefined();
    expect(config.docsUrl).toContain('clerk.com');
  });

  it('returns config for unknown version (defaults to upgrade)', async () => {
    const config = await loadConfig('nextjs', null);

    expect(config).not.toBeNull();
    expect(config.versionStatus).toBe('unknown');
  });
});

describe('getTargetPackageName', () => {
  it('returns @clerk/react for react sdk', () => {
    expect(getTargetPackageName('react')).toBe('@clerk/react');
  });

  it('returns @clerk/react for clerk-react sdk', () => {
    expect(getTargetPackageName('clerk-react')).toBe('@clerk/react');
  });

  it('returns @clerk/expo for expo sdk', () => {
    expect(getTargetPackageName('expo')).toBe('@clerk/expo');
  });

  it('returns @clerk/expo for clerk-expo sdk', () => {
    expect(getTargetPackageName('clerk-expo')).toBe('@clerk/expo');
  });

  it('returns @clerk/nextjs for nextjs sdk', () => {
    expect(getTargetPackageName('nextjs')).toBe('@clerk/nextjs');
  });
});

describe('getOldPackageName', () => {
  it('returns @clerk/clerk-react for react sdk', () => {
    expect(getOldPackageName('react')).toBe('@clerk/clerk-react');
  });

  it('returns @clerk/clerk-expo for expo sdk', () => {
    expect(getOldPackageName('expo')).toBe('@clerk/clerk-expo');
  });

  it('returns null for nextjs sdk (no rename)', () => {
    expect(getOldPackageName('nextjs')).toBeNull();
  });
});
