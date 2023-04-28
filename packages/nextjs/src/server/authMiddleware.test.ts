import type { NextRequest } from 'next/server';

import { paths } from '../utils';
import { createRouteMatcher, DEFAULT_CONFIG_MATCHER, DEFAULT_IGNORED_ROUTES } from './authMiddleware';

const mockRequest = (url: string) => {
  return {
    nextUrl: new URL(url, 'https://www.clerk.com'),
  } as NextRequest;
};

describe('isPublicRoute', () => {
  describe('should work with path patterns', function () {
    it('matches path and all sub paths using *', () => {
      const isPublicRoute = createRouteMatcher(['/hello(.*)']);
      expect(isPublicRoute(mockRequest('/hello'))).toBe(true);
      expect(isPublicRoute(mockRequest('/hello/'))).toBe(true);
      expect(isPublicRoute(mockRequest('/hello/test/a'))).toBe(true);
    });

    it('matches filenames with specific extensions', () => {
      const isPublicRoute = createRouteMatcher(['/(.*).ts', '/(.*).js']);
      expect(isPublicRoute(mockRequest('/hello.js'))).toBe(true);
      expect(isPublicRoute(mockRequest('/test/hello.js'))).toBe(true);
      expect(isPublicRoute(mockRequest('/test/hello.ts'))).toBe(true);
    });

    it('works with single values (non array)', () => {
      const isPublicRoute = createRouteMatcher('/test/hello.ts');
      expect(isPublicRoute(mockRequest('/hello.js'))).not.toBe(true);
      expect(isPublicRoute(mockRequest('/test/hello.js'))).not.toBe(true);
    });
  });

  describe('should work with regex patterns', function () {
    it('matches path and all sub paths using *', () => {
      const isPublicRoute = createRouteMatcher([/^\/hello.*$/]);
      expect(isPublicRoute(mockRequest('/hello'))).toBe(true);
      expect(isPublicRoute(mockRequest('/hello/'))).toBe(true);
      expect(isPublicRoute(mockRequest('/hello/test/a'))).toBe(true);
    });

    it('matches filenames with specific extensions', () => {
      const isPublicRoute = createRouteMatcher([/^.*\.(ts|js)$/]);
      expect(isPublicRoute(mockRequest('/hello.js'))).toBe(true);
      expect(isPublicRoute(mockRequest('/test/hello.js'))).toBe(true);
      expect(isPublicRoute(mockRequest('/test/hello.ts'))).toBe(true);
    });

    it('works with single values (non array)', () => {
      const isPublicRoute = createRouteMatcher(/hello/g);
      expect(isPublicRoute(mockRequest('/hello.js'))).toBe(true);
      expect(isPublicRoute(mockRequest('/test/hello.js'))).toBe(true);
    });
  });
});

describe('default matcher', () => {
  it('compiles to regex using path-to-regex', () => {
    [DEFAULT_CONFIG_MATCHER, DEFAULT_IGNORED_ROUTES].flat().forEach(path => {
      expect(paths.toRegexp(path)).toBeInstanceOf(RegExp);
    });
  });

  it('does not match any static files or next internals', () => {
    const matcher = createRouteMatcher(DEFAULT_CONFIG_MATCHER);
    expect(matcher(mockRequest('/_next'))).toBe(false);
    expect(matcher(mockRequest('/favicon.ico'))).toBe(false);
    expect(matcher(mockRequest('/_next/test.json'))).toBe(false);
  });

  it('ignores the files matched by ignoredRoutes', () => {
    const matcher = createRouteMatcher(DEFAULT_IGNORED_ROUTES);
    expect(matcher(mockRequest('/_next'))).toBe(true);
    expect(matcher(mockRequest('/favicon.ico'))).toBe(true);
    expect(matcher(mockRequest('/_next/test.json'))).toBe(true);
  });
});
