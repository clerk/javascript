import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import type { SegmentParts } from '../location';
import { useRouteGuard } from '../use-route-guard';
import { useRouterScope } from '../use-router';
import { useVirtualSegment, VirtualStoreProvider } from '../virtual-store';

const routes = { start: '', verify: 'verify', fields: 'fields' } as const;

function wrapperWith(initial: Record<string, SegmentParts>) {
  return ({ children }: { children: ReactNode }) => (
    <VirtualStoreProvider initial={initial}>{children}</VirtualStoreProvider>
  );
}

function useGuarded(allowed: keyof typeof routes | undefined) {
  const scope = useRouterScope(routes, { routing: 'virtual', path: '/flow', root: 'start' });
  useRouteGuard(scope, allowed);
  return { route: scope.route, segment: useVirtualSegment('/flow') };
}

describe('useRouteGuard', () => {
  it('replaces a route the owner does not allow', () => {
    const { result } = renderHook(() => useGuarded('fields'), { wrapper: wrapperWith({ '/flow': ['verify'] }) });

    expect(result.current.route).toBe('fields');
    expect(result.current.segment).toEqual(['fields']);
  });

  it('leaves an allowed route in place', () => {
    const { result } = renderHook(() => useGuarded('verify'), { wrapper: wrapperWith({ '/flow': ['verify'] }) });

    expect(result.current.route).toBe('verify');
    expect(result.current.segment).toEqual(['verify']);
  });

  it('leaves the route in place when nothing is allowed', () => {
    const { result } = renderHook(() => useGuarded(undefined), { wrapper: wrapperWith({ '/flow': ['verify'] }) });

    expect(result.current.route).toBe('verify');
    expect(result.current.segment).toEqual(['verify']);
  });
});
