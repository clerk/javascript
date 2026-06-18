import { describe, expect, it } from 'vitest';

import { getRelativeFolder } from '../lib/file-info';

describe('getRelativeFolder', () => {
  it('roots at the `app` segment for a root-level App Router', () => {
    expect(getRelativeFolder('/proj/app/dashboard/page.tsx', '/proj')).toBe('app/dashboard');
  });

  it('supports the `src/app` convention (the `src` segment is skipped)', () => {
    expect(getRelativeFolder('/proj/src/app/dashboard/page.tsx', '/proj')).toBe('app/dashboard');
  });

  it('ignores a spurious `app` segment in the absolute prefix when rooted at the project', () => {
    // Without project-root relativization, the leading `/Users/app/...` would anchor the
    // folder at the wrong `app`. Relativizing against the project root fixes it.
    expect(getRelativeFolder('/Users/app/work/myproj/app/dashboard/page.tsx', '/Users/app/work/myproj')).toBe(
      'app/dashboard',
    );
  });

  it('misclassifies when rooted at a parent directory that also contains an `app` segment', () => {
    expect(getRelativeFolder('/Users/app/work/myproj/app/sign-in/page.tsx', '/Users')).toBe(
      'app/work/myproj/app/sign-in',
    );
  });

  it('roots at the shallowest `app` when an inner route folder is also named `app`', () => {
    expect(getRelativeFolder('/proj/app/app/page.tsx', '/proj')).toBe('app/app');
  });

  it('does not match segments that merely contain `app`', () => {
    expect(getRelativeFolder('/proj/myapp/dashboard/page.tsx', '/proj')).toBe('myapp/dashboard');
    expect(getRelativeFolder('/proj/app-utils/foo.ts', '/proj')).toBe('app-utils');
  });

  it('normalizes Windows-style separators', () => {
    expect(getRelativeFolder('C:\\proj\\app\\dashboard\\page.tsx', 'C:\\proj')).toBe('app/dashboard');
  });

  it('falls back to scanning the absolute path when the file is outside the project root', () => {
    // Mirrors how RuleTester lints in-memory code: the filename is absolute and
    // not under the project root, so the absolute path is scanned for `app`.
    expect(getRelativeFolder('/elsewhere/app/dashboard/page.tsx', '/proj')).toBe('app/dashboard');
  });

  it('returns the project-relative folder when there is no `app` segment but the file is under the project root', () => {
    expect(getRelativeFolder('/proj/utils/foo.ts', '/proj')).toBe('utils');
  });

  it('returns null when there is no `app` segment and the file is outside the project root', () => {
    expect(getRelativeFolder('/elsewhere/utils/foo.ts', '/proj')).toBeNull();
  });

  it('returns null for an empty filename', () => {
    expect(getRelativeFolder(undefined, '/proj')).toBeNull();
    expect(getRelativeFolder('', '/proj')).toBeNull();
  });
});
