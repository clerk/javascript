import { logger } from '@clerk/shared/logger';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { pageParts, pageSegment, withRoutablePaths } from '../profile-pages.layout';

describe('pageSegment', () => {
  it('maps the built-in ids to the segments legacy used', () => {
    expect(pageSegment('apiKeys')).toBe('api-keys');
    expect(pageSegment('organization/apiKeys')).toBe('organization/api-keys');
    expect(pageSegment('security')).toBe('security');
    expect(pageSegment('organization/general')).toBe('organization/general');
  });

  it('leaves custom page paths as they are', () => {
    expect(pageSegment('usage')).toBe('usage');
    expect(pageSegment('docs/apiKeys')).toBe('docs/apiKeys');
  });

  it('leaves an id named after an Object.prototype property as it is', () => {
    for (const id of ['constructor', 'toString', '__proto__', 'hasOwnProperty', 'valueOf']) {
      expect(pageSegment(id)).toBe(id);
    }
  });
});

describe('pageParts', () => {
  it('splits a page id into the parts of its segment', () => {
    expect(pageParts(undefined)).toEqual([]);
    expect(pageParts('apiKeys')).toEqual(['api-keys']);
    expect(pageParts('organization/general')).toEqual(['organization', 'general']);
    expect(pageParts('/usage/')).toEqual(['usage']);
  });
});

describe('withRoutablePaths', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps a page whose path is an Object.prototype property', () => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const pages = [{ path: 'toString' }, { path: 'constructor' }, { path: '__proto__' }];
    expect(withRoutablePaths(pages, ['account', 'apiKeys']).map(page => page.path)).toEqual([
      'toString',
      'constructor',
      '__proto__',
    ]);
    expect(warn).not.toHaveBeenCalled();
  });

  it('leaves out a page whose path has a . or .. part, which a URL resolves away', () => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const pages = [{ path: 'usage' }, { path: '..' }, { path: 'docs/.' }];
    expect(withRoutablePaths(pages, []).map(page => page.path)).toEqual(['usage']);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('".." has a "." or ".." part'));
  });
});
