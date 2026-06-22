import { describe, expect, it } from 'vitest';

import { getAppRouterFileKind, getRelativeFolder, isUnderAppRouterRoot } from '../lib/file-info';

describe('getRelativeFolder', () => {
  it('returns the project-relative folder for a root-level App Router file', () => {
    expect(getRelativeFolder('/proj/app/dashboard/page.tsx', '/proj')).toBe('app/dashboard');
  });

  it('preserves the `src/app` prefix in project-relative paths', () => {
    expect(getRelativeFolder('/proj/src/app/dashboard/page.tsx', '/proj')).toBe('src/app/dashboard');
  });

  it('relativizes against the project root, not arbitrary absolute prefixes', () => {
    expect(getRelativeFolder('/Users/app/work/myproj/app/dashboard/page.tsx', '/Users/app/work/myproj')).toBe(
      'app/dashboard',
    );
  });

  it('returns the full project-relative path when rooted at a parent directory', () => {
    expect(getRelativeFolder('/Users/app/work/myproj/app/sign-in/page.tsx', '/Users')).toBe(
      'app/work/myproj/app/sign-in',
    );
  });

  it('preserves nested route folders also named `app`', () => {
    expect(getRelativeFolder('/proj/app/app/page.tsx', '/proj')).toBe('app/app');
  });

  it('does not strip to an inner `app` segment for non-router folders', () => {
    expect(getRelativeFolder('/proj/myapp/dashboard/page.tsx', '/proj')).toBe('myapp/dashboard');
    expect(getRelativeFolder('/proj/app-utils/foo.ts', '/proj')).toBe('app-utils');
  });

  it('normalizes Windows-style separators', () => {
    expect(getRelativeFolder('C:\\proj\\app\\dashboard\\page.tsx', 'C:\\proj')).toBe('app/dashboard');
  });

  it('returns null when the file is outside the project root', () => {
    expect(getRelativeFolder('/elsewhere/app/dashboard/page.tsx', '/proj')).toBeNull();
    expect(getRelativeFolder('/elsewhere/utils/foo.ts', '/proj')).toBeNull();
  });

  it('returns the project-relative folder for files outside App Router', () => {
    expect(getRelativeFolder('/proj/utils/foo.ts', '/proj')).toBe('utils');
    expect(getRelativeFolder('/proj/shared/actions.ts', '/proj')).toBe('shared');
  });

  it('returns null when rootDir is omitted', () => {
    expect(getRelativeFolder('/proj/app/dashboard/page.tsx', undefined)).toBeNull();
  });

  it('returns null for an empty filename', () => {
    expect(getRelativeFolder(undefined, '/proj')).toBeNull();
    expect(getRelativeFolder('', '/proj')).toBeNull();
  });
});

describe('isUnderAppRouterRoot', () => {
  it('returns true for `app/` and `src/app/` folders', () => {
    expect(isUnderAppRouterRoot('app')).toBe(true);
    expect(isUnderAppRouterRoot('app/dashboard')).toBe(true);
    expect(isUnderAppRouterRoot('src/app')).toBe(true);
    expect(isUnderAppRouterRoot('src/app/dashboard')).toBe(true);
  });

  it('returns false for folders that are not rooted at `app/` or `src/app/`', () => {
    expect(isUnderAppRouterRoot('apps/web/app/dashboard')).toBe(false);
    expect(isUnderAppRouterRoot('src/pages-router/app')).toBe(false);
    expect(isUnderAppRouterRoot('src/pages-router/app/dashboard')).toBe(false);
    expect(isUnderAppRouterRoot('myapp/dashboard')).toBe(false);
    expect(isUnderAppRouterRoot('app-utils')).toBe(false);
    expect(isUnderAppRouterRoot('utils')).toBe(false);
    expect(isUnderAppRouterRoot('shared')).toBe(false);
  });
});

describe('getAppRouterFileKind', () => {
  it('returns the resource kind under an App Router root', () => {
    expect(getAppRouterFileKind('/proj/app/dashboard/page.tsx', 'app/dashboard')).toBe('page');
    expect(getAppRouterFileKind('/proj/src/app/dashboard/route.ts', 'src/app/dashboard')).toBe('route');
  });

  it('returns null for resource filenames outside App Router', () => {
    expect(getAppRouterFileKind('/proj/utils/page.tsx', 'utils')).toBeNull();
    expect(getAppRouterFileKind('/proj/shared/route.ts', 'shared')).toBeNull();
    expect(getAppRouterFileKind('/proj/apps/web/app/page.tsx', 'apps/web/app')).toBeNull();
    expect(getAppRouterFileKind('/proj/src/pages-router/app/page.tsx', 'src/pages-router/app')).toBeNull();
  });

  it('returns null for non-resource files even under App Router', () => {
    expect(getAppRouterFileKind('/proj/app/dashboard/helpers.ts', 'app/dashboard')).toBeNull();
  });
});
