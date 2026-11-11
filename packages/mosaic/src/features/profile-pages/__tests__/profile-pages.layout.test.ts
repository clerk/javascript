import { describe, expect, it } from 'vitest';

import { pageParts, pageSegment } from '../profile-pages.layout';

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
});

describe('pageParts', () => {
  it('splits a page id into the parts of its segment', () => {
    expect(pageParts(undefined)).toEqual([]);
    expect(pageParts('apiKeys')).toEqual(['api-keys']);
    expect(pageParts('organization/general')).toEqual(['organization', 'general']);
    expect(pageParts('/usage/')).toEqual(['usage']);
  });
});
