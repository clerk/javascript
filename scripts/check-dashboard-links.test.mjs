import { describe, expect, test } from 'vitest';

import { findLegacyDashboardLinks, formatLegacyLinkError, isIgnoredFile } from './check-dashboard-links.mjs';

describe('findLegacyDashboardLinks', () => {
  test('flags /last-active links with a path query', () => {
    const content = 'Copy them from https://dashboard.clerk.com/last-active?path=api-keys.';

    expect(findLegacyDashboardLinks('a.ts', content)).toEqual([
      { file: 'a.ts', line: 1, column: 16, url: 'https://dashboard.clerk.com/last-active?path=api-keys' },
    ]);
  });

  test('flags a bare /last-active link', () => {
    const content = "return 'https://dashboard.clerk.com/last-active';";

    expect(findLegacyDashboardLinks('a.ts', content)).toMatchObject([
      { url: 'https://dashboard.clerk.com/last-active' },
    ]);
  });

  test('reports the line of each occurrence', () => {
    const content = [
      'ok https://dashboard.clerk.com/~/api-keys',
      '',
      'bad [link](https://dashboard.clerk.com/last-active?path=billing/settings)',
    ].join('\n');

    expect(findLegacyDashboardLinks('a.md', content)).toMatchObject([
      { line: 3, url: 'https://dashboard.clerk.com/last-active?path=billing/settings' },
    ]);
  });

  test('accepts canonical /~/ links and non-instance Dashboard URLs', () => {
    const content = [
      'https://dashboard.clerk.com/~/api-keys',
      'https://dashboard.clerk.com/~',
      'https://dashboard.clerk.com/apps/claim',
      'https://dashboard.clerk.com',
    ].join('\n');

    expect(findLegacyDashboardLinks('a.ts', content)).toEqual([]);
  });

  test('ignores look-alike hosts and paths that merely contain the segment', () => {
    const content = [
      'https://dashboard.clerk.com.evil/last-active',
      'https://dashboard.clerk.com/~/last-active-thing',
      'https://clerk.com/docs/last-active',
    ].join('\n');

    expect(findLegacyDashboardLinks('a.ts', content)).toEqual([]);
  });
});

describe('isIgnoredFile', () => {
  test('skips changelogs, changesets, and the checker itself', () => {
    expect(isIgnoredFile('packages/clerk-js/CHANGELOG.md')).toBe(true);
    expect(isIgnoredFile('.changeset/fix-links.md')).toBe(true);
    expect(isIgnoredFile('scripts/check-dashboard-links.mjs')).toBe(true);
    expect(isIgnoredFile('scripts/check-dashboard-links.test.mjs')).toBe(true);
  });

  test('checks source, docs, and READMEs', () => {
    expect(isIgnoredFile('packages/shared/src/keys.ts')).toBe(false);
    expect(isIgnoredFile('packages/express/README.md')).toBe(false);
    expect(isIgnoredFile('integration/tests/keyless.test.ts')).toBe(false);
  });
});

describe('formatLegacyLinkError', () => {
  test('points at the canonical replacement', () => {
    const message = formatLegacyLinkError({
      file: 'a.ts',
      line: 3,
      column: 5,
      url: 'https://dashboard.clerk.com/last-active?path=api-keys',
    });

    expect(message).toBe(
      'a.ts:3:5 https://dashboard.clerk.com/last-active?path=api-keys → https://dashboard.clerk.com/~/api-keys',
    );
  });

  test('maps a bare /last-active to /~', () => {
    const message = formatLegacyLinkError({
      file: 'a.ts',
      line: 1,
      column: 1,
      url: 'https://dashboard.clerk.com/last-active',
    });

    expect(message).toBe('a.ts:1:1 https://dashboard.clerk.com/last-active → https://dashboard.clerk.com/~');
  });

  test('keeps other query params', () => {
    const message = formatLegacyLinkError({
      file: 'a.ts',
      line: 1,
      column: 1,
      url: 'https://dashboard.clerk.com/last-active?path=api-keys&utm_source=github',
    });

    expect(message).toBe(
      'a.ts:1:1 https://dashboard.clerk.com/last-active?path=api-keys&utm_source=github → https://dashboard.clerk.com/~/api-keys?utm_source=github',
    );
  });
});
