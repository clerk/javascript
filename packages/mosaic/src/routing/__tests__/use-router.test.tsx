import { logger } from '@clerk/shared/logger';
import { act, configure, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, onTestFinished, vi } from 'vitest';

import type { SegmentParts } from '../location';
import type { RouteTable } from '../routes';
import { MosaicRoutingScope } from '../routing-scope';
import type { RouterScopeOptions } from '../use-router';
import { useRouter, useRouterScope } from '../use-router';
import { useVirtualSegment, useVirtualWrite, VirtualStoreProvider } from '../virtual-store';

const routes = {
  account: 'account',
  security: 'security',
  statement: 'billing/statement/:statementId',
} as const;

const userScope: RouterScopeOptions<typeof routes> = { routing: 'virtual', path: '/user', root: 'account' };

function ScopeOf({ options, children }: { options: RouterScopeOptions<typeof routes>; children: ReactNode }) {
  const { scope } = useRouterScope(routes, options);
  return <MosaicRoutingScope scope={scope}>{children}</MosaicRoutingScope>;
}

function wrapperWith(initial?: Record<string, SegmentParts>, scopeOptions?: RouterScopeOptions<typeof routes>) {
  return ({ children }: { children: ReactNode }) => (
    <VirtualStoreProvider initial={initial}>
      {scopeOptions ? <ScopeOf options={scopeOptions}>{children}</ScopeOf> : children}
    </VirtualStoreProvider>
  );
}

const useUserSegment = () => useVirtualSegment('/user');

describe('useRouterScope', () => {
  it('derives the route from its entry', () => {
    const { result } = renderHook(() => useRouterScope(routes, userScope), {
      wrapper: wrapperWith({ '/user': ['security'] }),
    });
    expect(result.current.route).toBe('security');
    expect(result.current.params).toEqual({});
  });

  it('re-renders with the new route after go', () => {
    const { result } = renderHook(() => ({ router: useRouterScope(routes, userScope), segment: useUserSegment() }), {
      wrapper: wrapperWith({ '/user': ['account'] }),
    });

    act(() => {
      result.current.router.go('statement', { statementId: 'st_1' });
    });

    expect(result.current.router.route).toBe('statement');
    expect(result.current.router.params).toEqual({ statementId: 'st_1' });
    expect(result.current.segment).toEqual(['billing', 'statement', 'st_1']);
  });

  it('round-trips any param value', () => {
    const { result } = renderHook(() => useRouterScope(routes, userScope), {
      wrapper: wrapperWith({ '/user': ['account'] }),
    });

    act(() => {
      result.current.go('statement', { statementId: 'st/1 %2F' });
    });

    expect(result.current.params).toEqual({ statementId: 'st/1 %2F' });
  });

  it('shows the root for an unknown segment at once and replaces the entry with the base', () => {
    const { result } = renderHook(() => ({ router: useRouterScope(routes, userScope), segment: useUserSegment() }), {
      wrapper: wrapperWith({ '/user': ['nowhere'] }),
    });
    expect(result.current.router.route).toBe('account');
    expect(result.current.segment).toEqual([]);
  });

  it('shows the root for an absent entry without writing', () => {
    const { result } = renderHook(() => ({ router: useRouterScope(routes, userScope), segment: useUserSegment() }), {
      wrapper: wrapperWith(),
    });
    expect(result.current.router.route).toBe('account');
    expect(result.current.segment).toBeUndefined();
  });

  it("canonicalises the root's own segment to the base", () => {
    const { result } = renderHook(() => ({ router: useRouterScope(routes, userScope), segment: useUserSegment() }), {
      wrapper: wrapperWith({ '/user': ['account'] }),
    });
    expect(result.current.router.route).toBe('account');
    expect(result.current.segment).toEqual([]);

    act(() => {
      result.current.router.go('account');
    });
    expect(result.current.segment).toEqual([]);
  });

  it('follows a write made to its entry by someone else', () => {
    const { result } = renderHook(() => ({ router: useRouterScope(routes, userScope), write: useVirtualWrite() }), {
      wrapper: wrapperWith({ '/user': ['security'] }),
    });

    act(() => {
      result.current.write('/user', ['billing', 'statement', 'st_2']);
    });
    expect(result.current.router.route).toBe('statement');
  });

  it('ignores writes to other entries', () => {
    const { result } = renderHook(() => ({ router: useRouterScope(routes, userScope), write: useVirtualWrite() }), {
      wrapper: wrapperWith({ '/user': ['security'] }),
    });

    act(() => {
      result.current.write('/organization', ['members']);
    });
    expect(result.current.router.route).toBe('security');
  });

  it('lets two owners with different bases coexist', () => {
    const orgRoutes = { general: 'general', members: 'members' } as const;
    const { result } = renderHook(
      () => ({
        user: useRouterScope(routes, userScope),
        org: useRouterScope(orgRoutes, { routing: 'virtual', path: '/organization', root: 'general' }),
      }),
      { wrapper: wrapperWith() },
    );
    expect(result.current.user.route).toBe('account');
    expect(result.current.org.route).toBe('general');

    act(() => {
      result.current.user.go('security');
    });
    act(() => {
      result.current.org.go('members');
    });

    expect(result.current.user.route).toBe('security');
    expect(result.current.org.route).toBe('members');
  });

  it('redirects every time an unknown segment is written, the same one included', () => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const { result } = renderHook(
      () => ({ router: useRouterScope(routes, userScope), segment: useUserSegment(), write: useVirtualWrite() }),
      { wrapper: wrapperWith({ '/user': ['nowhere'] }) },
    );
    expect(result.current.segment).toEqual([]);

    for (const unknown of ['elsewhere', 'nowhere', 'nowhere']) {
      act(() => {
        result.current.write('/user', [unknown]);
      });
      expect(result.current.router.route).toBe('account');
      expect(result.current.segment).toEqual([]);
    }
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('redirects under StrictMode without warning', () => {
    configure({ reactStrictMode: true });
    onTestFinished(() => configure({ reactStrictMode: false }));
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const { result } = renderHook(() => ({ router: useRouterScope(routes, userScope), segment: useUserSegment() }), {
      wrapper: wrapperWith({ '/user': ['nowhere'] }),
    });

    expect(result.current.router.route).toBe('account');
    expect(result.current.segment).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('lets two owners of one base agree on the base, without a warning', () => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const orgRoutes = { general: 'general', members: 'members' } as const;
    const { result } = renderHook(
      () => ({
        user: useRouterScope(routes, userScope),
        org: useRouterScope(orgRoutes, { routing: 'virtual', path: '/user', root: 'general' }),
        segment: useUserSegment(),
      }),
      { wrapper: wrapperWith({ '/user': ['nowhere'] }) },
    );

    expect(result.current.segment).toEqual([]);
    expect(result.current.user.route).toBe('account');
    expect(result.current.org.route).toBe('general');

    act(() => {
      result.current.user.go('security');
    });

    expect(result.current.segment).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('keeps the same result object between unrelated renders', () => {
    const { result, rerender } = renderHook(() => useRouterScope(routes, userScope), {
      wrapper: wrapperWith({ '/user': ['security'] }),
    });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('keeps the router while an equal table is passed as a new object', () => {
    const { result, rerender } = renderHook(
      ({ table }: { table: RouteTable }) => useRouterScope(table, { ...userScope, root: 'account' }),
      { initialProps: { table: { ...routes } }, wrapper: wrapperWith({ '/user': ['security'] }) },
    );
    const { go } = result.current;

    rerender({ table: { ...routes } });
    expect(result.current.go).toBe(go);

    rerender({ table: { ...routes, usage: 'usage' } });
    expect(result.current.go).not.toBe(go);
    act(() => {
      result.current.go('usage');
    });
    expect(result.current.route).toBe('usage');
  });

  it('keeps the same scope while the options are unchanged', () => {
    const { result, rerender } = renderHook(() => useRouterScope(routes, { ...userScope }), {
      wrapper: wrapperWith({ '/user': ['security'] }),
    });
    const { scope } = result.current;
    rerender();
    expect(result.current.scope).toBe(scope);
  });
});

describe('useRouter', () => {
  it('reads the mode and base path from the scope', () => {
    const { result } = renderHook(() => useRouter(routes), {
      wrapper: wrapperWith({ '/user': ['security'] }, userScope),
    });
    expect(result.current.route).toBe('security');
  });

  it('shares the segment with the owner and other nested routers', () => {
    const { result } = renderHook(() => [useRouter(routes), useRouter(routes)] as const, {
      wrapper: wrapperWith({ '/user': ['security'] }, userScope),
    });

    act(() => {
      result.current[0].go('statement', { statementId: 'st_1' });
    });

    expect(result.current[1].route).toBe('statement');
  });

  it('reports no route for a segment a sibling owns, without redirecting', () => {
    const billing = { statement: 'billing/statement/:statementId' } as const;
    const { result } = renderHook(() => ({ router: useRouter(billing), segment: useUserSegment() }), {
      wrapper: wrapperWith({ '/user': ['security'] }, userScope),
    });
    expect(result.current.router.route).toBeUndefined();
    expect(result.current.segment).toEqual(['security']);
  });

  it('throws without a scope', () => {
    expect(() => renderHook(() => useRouter(routes), { wrapper: wrapperWith() })).toThrow('useRouterScope');
  });
});
