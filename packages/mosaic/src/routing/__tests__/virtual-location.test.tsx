import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import {
  createVirtualLocation,
  decodeParts,
  encodeParts,
  normalizeBase,
  rawSegmentPartsOf,
  urlFor,
} from '../virtual-location';
import { useVirtualUrl, useVirtualUrlWrite, VirtualUrlProvider } from '../virtual-url';

describe('normalizeBase', () => {
  it('strips surrounding slashes and collapses the root', () => {
    expect(normalizeBase('/user/')).toBe('/user');
    expect(normalizeBase('user')).toBe('/user');
    expect(normalizeBase('/')).toBe('');
    expect(normalizeBase('')).toBe('');
  });
});

describe('rawSegmentPartsOf', () => {
  it('reads the raw parts under the base', () => {
    expect(rawSegmentPartsOf('/user/security', '/user')).toEqual(['security']);
    expect(rawSegmentPartsOf('/user/billing/statement/st%2F1', '/user')).toEqual(['billing', 'statement', 'st%2F1']);
  });

  it('reads no parts at the base', () => {
    expect(rawSegmentPartsOf('/user', '/user')).toEqual([]);
    expect(rawSegmentPartsOf('/user/', '/user')).toEqual([]);
  });

  it('reads no parts outside the base', () => {
    expect(rawSegmentPartsOf('/sign-in/factor-one', '/user')).toEqual([]);
    expect(rawSegmentPartsOf('/users', '/user')).toEqual([]);
  });

  it('reads the whole path at the root base', () => {
    expect(rawSegmentPartsOf('/security', '')).toEqual(['security']);
    expect(rawSegmentPartsOf('/', '')).toEqual([]);
  });
});

describe('urlFor', () => {
  it('joins the base and the raw parts', () => {
    expect(urlFor('/user', ['security'])).toBe('/user/security');
    expect(urlFor('/user', [])).toBe('/user');
    expect(urlFor('', ['security'])).toBe('/security');
    expect(urlFor('', [])).toBe('/');
  });
});

describe('decodeParts and encodeParts', () => {
  it('round-trip any value', () => {
    const parts = ['st/1', '100%', 'a b', 'ö', ''];
    expect(decodeParts(encodeParts(parts))).toEqual(parts);
  });

  it('report no parts for a malformed escape', () => {
    expect(decodeParts(['billing', '%E0%A4'])).toEqual([]);
  });
});

function wrapperAt(initialUrl: string) {
  return ({ children }: { children: ReactNode }) => (
    <VirtualUrlProvider initialUrl={initialUrl}>{children}</VirtualUrlProvider>
  );
}

function useLocationAt(basePath: string) {
  const location = createVirtualLocation(basePath, useVirtualUrlWrite());
  return { location, parts: location.useSegmentParts(), url: useVirtualUrl() };
}

describe('createVirtualLocation', () => {
  it('derives decoded parts from the page virtual URL', () => {
    const { result } = renderHook(() => useLocationAt('/user'), { wrapper: wrapperAt('/user/billing/st%2F1') });
    expect(result.current.parts).toEqual(['billing', 'st/1']);
  });

  it('writes encoded parts under its base', () => {
    const { result } = renderHook(() => useLocationAt('/user'), { wrapper: wrapperAt('/') });

    act(() => {
      result.current.location.write(['billing', 'statement', 'st/1 %']);
    });

    expect(result.current.url).toBe('/user/billing/statement/st%2F1%20%25');
    expect(result.current.parts).toEqual(['billing', 'statement', 'st/1 %']);
  });

  it('returns the same parts object while the URL is unchanged', () => {
    const { result, rerender } = renderHook(() => useLocationAt('/user'), { wrapper: wrapperAt('/user/security') });
    const first = result.current.parts;
    rerender();
    expect(result.current.parts).toBe(first);
  });

  it('reports no parts for a malformed segment', () => {
    const { result } = renderHook(() => useLocationAt('/user'), { wrapper: wrapperAt('/user/%E0%A4') });
    expect(result.current.parts).toEqual([]);
  });

  it('shares the page virtual URL between instances with different bases', () => {
    const { result } = renderHook(() => [useLocationAt('/user'), useLocationAt('/sign-in')] as const, {
      wrapper: wrapperAt('/user/security'),
    });
    expect(result.current[0].parts).toEqual(['security']);
    expect(result.current[1].parts).toEqual([]);

    act(() => {
      result.current[1].location.write(['factor-one']);
    });

    expect(result.current[0].parts).toEqual([]);
    expect(result.current[1].parts).toEqual(['factor-one']);
  });

  it('throws without a provider', () => {
    expect(() => renderHook(() => useLocationAt('/user'))).toThrow('<MosaicProvider>');
  });
});
