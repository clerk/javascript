import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { normalizeBase } from '../base-path';
import type { SegmentParts } from '../location';
import { createVirtualLocation } from '../virtual-location';
import { useVirtualEntries, useVirtualWrite, VirtualStoreProvider } from '../virtual-store';

describe('normalizeBase', () => {
  it('strips surrounding slashes and collapses the root', () => {
    expect(normalizeBase('/user/')).toBe('/user');
    expect(normalizeBase('user')).toBe('/user');
    expect(normalizeBase('/')).toBe('');
    expect(normalizeBase('')).toBe('');
  });
});

function wrapperWith(initial?: Record<string, SegmentParts>) {
  return ({ children }: { children: ReactNode }) => (
    <VirtualStoreProvider initial={initial}>{children}</VirtualStoreProvider>
  );
}

function useLocationAt(basePath: string) {
  const location = createVirtualLocation(basePath, useVirtualWrite());
  return { location, parts: location.useSegmentParts(), entries: useVirtualEntries() };
}

describe('createVirtualLocation', () => {
  it('reads its own entry of the store', () => {
    const { result } = renderHook(() => useLocationAt('/user'), {
      wrapper: wrapperWith({ '/user': ['security'], '/organization': ['members'] }),
    });
    expect(result.current.parts).toEqual(['security']);
  });

  it('reads no parts when it has no entry', () => {
    const { result } = renderHook(() => useLocationAt('/user'), { wrapper: wrapperWith() });
    expect(result.current.parts).toEqual([]);
  });

  it('writes its entry verbatim', () => {
    const { result } = renderHook(() => useLocationAt('/user'), { wrapper: wrapperWith() });

    act(() => {
      result.current.location.write(['billing', 'statement', 'st/1 %']);
    });

    expect(result.current.parts).toEqual(['billing', 'statement', 'st/1 %']);
    expect(result.current.entries.get('/user')).toEqual(['billing', 'statement', 'st/1 %']);
  });

  it('clears its entry', () => {
    const { result } = renderHook(() => useLocationAt('/user'), { wrapper: wrapperWith({ '/user': ['security'] }) });

    act(() => {
      result.current.location.clear();
    });

    expect(result.current.parts).toEqual([]);
    expect(result.current.entries.has('/user')).toBe(false);
  });

  it('returns the same parts object while its entry is unchanged', () => {
    const { result, rerender } = renderHook(() => useLocationAt('/user'), {
      wrapper: wrapperWith({ '/user': ['security'] }),
    });
    const first = result.current.parts;
    rerender();
    expect(result.current.parts).toBe(first);
  });

  it('keeps owners with different bases apart', () => {
    const { result } = renderHook(() => [useLocationAt('/user'), useLocationAt('/organization')] as const, {
      wrapper: wrapperWith({ '/user': ['security'] }),
    });
    expect(result.current[0].parts).toEqual(['security']);
    expect(result.current[1].parts).toEqual([]);

    act(() => {
      result.current[1].location.write(['members']);
    });

    expect(result.current[0].parts).toEqual(['security']);
    expect(result.current[1].parts).toEqual(['members']);

    act(() => {
      result.current[0].location.clear();
    });

    expect(result.current[0].parts).toEqual([]);
    expect(result.current[1].parts).toEqual(['members']);
  });

  it('treats base spellings alike', () => {
    const { result } = renderHook(() => useLocationAt('user/'), { wrapper: wrapperWith({ '/user': ['security'] }) });
    expect(result.current.parts).toEqual(['security']);
  });

  it('throws without a provider', () => {
    expect(() => renderHook(() => useLocationAt('/user'))).toThrow('<MosaicProvider>');
  });
});
