import { describe, expect, it } from 'vitest';

import { isNextjsUseCacheError, isPrerenderingBailout } from '../utils';

describe('isPrerenderingBailout', () => {
  it('returns false for non-Error values', () => {
    expect(isPrerenderingBailout(null)).toBe(false);
    expect(isPrerenderingBailout(undefined)).toBe(false);
    expect(isPrerenderingBailout('string')).toBe(false);
    expect(isPrerenderingBailout(123)).toBe(false);
    expect(isPrerenderingBailout({})).toBe(false);
  });

  it('returns true for dynamic server usage errors', () => {
    const error = new Error('Dynamic server usage: headers');
    expect(isPrerenderingBailout(error)).toBe(true);
  });

  it('returns true for bail out of prerendering errors', () => {
    const error = new Error('This page needs to bail out of prerendering');
    expect(isPrerenderingBailout(error)).toBe(true);
  });

  it('returns true for route prerendering bailout errors (Next.js 14.1.1+)', () => {
    const error = new Error(
      'Route /example needs to bail out of prerendering at this point because it used headers().',
    );
    expect(isPrerenderingBailout(error)).toBe(true);
  });

  it('returns true for headers() rejection during prerendering (Next.js 15+ cacheComponents)', () => {
    const error = new Error(
      'During prerendering, `headers()` rejects when the prerender is complete. ' +
        'Typically these errors are handled by React but if you move `headers()` to a different context ' +
        'by using `setTimeout`, `after`, or similar functions you may observe this error and you should handle it in that context.',
    );
    expect(isPrerenderingBailout(error)).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    const error = new Error('Some other error');
    expect(isPrerenderingBailout(error)).toBe(false);
  });
});

describe('isNextjsUseCacheError', () => {
  it('returns false for non-Error values', () => {
    expect(isNextjsUseCacheError(null)).toBe(false);
    expect(isNextjsUseCacheError(undefined)).toBe(false);
    expect(isNextjsUseCacheError('string')).toBe(false);
    expect(isNextjsUseCacheError(123)).toBe(false);
    expect(isNextjsUseCacheError({})).toBe(false);
  });

  it('returns true for "use cache" errors', () => {
    const error = new Error('Route /example used `headers()` inside "use cache"');
    expect(isNextjsUseCacheError(error)).toBe(true);
  });

  it('returns true for cache scope errors', () => {
    const error = new Error(
      'Accessing Dynamic data sources inside a cache scope is not supported. ' +
        'If you need this data inside a cached function use `headers()` outside of the cached function.',
    );
    expect(isNextjsUseCacheError(error)).toBe(true);
  });

  it('returns true for dynamic data source cache errors', () => {
    const error = new Error('Dynamic data source accessed in cache context');
    expect(isNextjsUseCacheError(error)).toBe(true);
  });

  it('returns false for regular prerendering bailout errors', () => {
    const error = new Error('Dynamic server usage: headers');
    expect(isNextjsUseCacheError(error)).toBe(false);
  });

  it('returns false for unrelated errors', () => {
    const error = new Error('Some other error');
    expect(isNextjsUseCacheError(error)).toBe(false);
  });

  it('returns true for the exact Next.js 16 error message', () => {
    const error = new Error(
      'Route /examples/cached-components used `headers()` inside "use cache". ' +
        'Accessing Dynamic data sources inside a cache scope is not supported. ' +
        'If you need this data inside a cached function use `headers()` outside of the cached function ' +
        'and pass the required dynamic data in as an argument.',
    );
    expect(isNextjsUseCacheError(error)).toBe(true);
  });
});
