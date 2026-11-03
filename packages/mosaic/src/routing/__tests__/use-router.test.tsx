import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import type { RouteTable } from '../routes';
import { MosaicRoutingScope } from '../routing-scope';
import type { RouterScopeOptions } from '../use-router';
import { useRouter, useRouterScope } from '../use-router';
import { useVirtualUrl, useVirtualUrlWrite, VirtualUrlProvider } from '../virtual-url';

const routes = {
  account: 'account',
  security: 'security',
  statement: 'billing/statement/:statementId',
} as const;

const userScope: RouterScopeOptions<typeof routes> = { routing: 'virtual', path: '/user', notFound: 'account' };

function ScopeOf({ options, children }: { options: RouterScopeOptions<typeof routes>; children: ReactNode }) {
  const { scope } = useRouterScope(routes, options);
  return <MosaicRoutingScope scope={scope}>{children}</MosaicRoutingScope>;
}

function wrapperAt(initialUrl: string, scopeOptions?: RouterScopeOptions<typeof routes>) {
  return ({ children }: { children: ReactNode }) => (
    <VirtualUrlProvider initialUrl={initialUrl}>
      {scopeOptions ? <ScopeOf options={scopeOptions}>{children}</ScopeOf> : children}
    </VirtualUrlProvider>
  );
}

describe('useRouterScope', () => {
  it('derives the route from the page virtual URL', () => {
    const { result } = renderHook(() => useRouterScope(routes, userScope), { wrapper: wrapperAt('/user/security') });
    expect(result.current.route).toBe('security');
    expect(result.current.params).toEqual({});
  });

  it('re-renders with the new route after go', () => {
    const { result } = renderHook(() => ({ router: useRouterScope(routes, userScope), url: useVirtualUrl() }), {
      wrapper: wrapperAt('/user'),
    });

    act(() => {
      result.current.router.go('statement', { statementId: 'st_1' });
    });

    expect(result.current.router.route).toBe('statement');
    expect(result.current.router.params).toEqual({ statementId: 'st_1' });
    expect(result.current.url).toBe('/user/billing/statement/st_1');
  });

  it('encodes on write and decodes on read, exactly once', () => {
    const { result } = renderHook(() => ({ router: useRouterScope(routes, userScope), url: useVirtualUrl() }), {
      wrapper: wrapperAt('/user'),
    });

    act(() => {
      result.current.router.go('statement', { statementId: 'st/1 %2F' });
    });

    expect(result.current.url).toBe('/user/billing/statement/st%2F1%20%252F');
    expect(result.current.router.params).toEqual({ statementId: 'st/1 %2F' });
  });

  it('shows the not-found route at once and redirects the location to it', () => {
    const { result } = renderHook(() => ({ router: useRouterScope(routes, userScope), url: useVirtualUrl() }), {
      wrapper: wrapperAt('/user/nowhere'),
    });
    expect(result.current.router.route).toBe('account');
    expect(result.current.url).toBe('/user/account');
  });

  it('redirects an empty segment to the not-found route', () => {
    const { result } = renderHook(() => ({ router: useRouterScope(routes, userScope), url: useVirtualUrl() }), {
      wrapper: wrapperAt('/'),
    });
    expect(result.current.router.route).toBe('account');
    expect(result.current.url).toBe('/user/account');
  });

  it('follows a write made to the page virtual URL by someone else', () => {
    const { result } = renderHook(() => ({ router: useRouterScope(routes, userScope), write: useVirtualUrlWrite() }), {
      wrapper: wrapperAt('/user/security'),
    });

    act(() => {
      result.current.write('/user/billing/statement/st_2');
    });
    expect(result.current.router.route).toBe('statement');
  });

  it('keeps the same result object between unrelated renders', () => {
    const { result, rerender } = renderHook(() => useRouterScope(routes, userScope), {
      wrapper: wrapperAt('/user/security'),
    });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('keeps the router while an equal table is passed as a new object', () => {
    const { result, rerender } = renderHook(
      ({ table }: { table: RouteTable }) => useRouterScope(table, { ...userScope, notFound: 'account' }),
      { initialProps: { table: { ...routes } }, wrapper: wrapperAt('/user/security') },
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
      wrapper: wrapperAt('/user/security'),
    });
    const { scope } = result.current;
    rerender();
    expect(result.current.scope).toBe(scope);
  });
});

describe('useRouter', () => {
  it('reads the mode and base path from the scope', () => {
    const { result } = renderHook(() => useRouter(routes), { wrapper: wrapperAt('/user/security', userScope) });
    expect(result.current.route).toBe('security');
  });

  it('shares the segment with the owner and other nested routers', () => {
    const { result } = renderHook(() => [useRouter(routes), useRouter(routes)] as const, {
      wrapper: wrapperAt('/user/security', userScope),
    });

    act(() => {
      result.current[0].go('statement', { statementId: 'st_1' });
    });

    expect(result.current[1].route).toBe('statement');
  });

  it('reports no route for a segment a sibling owns, without redirecting', () => {
    const billing = { statement: 'billing/statement/:statementId' } as const;
    const { result } = renderHook(() => ({ router: useRouter(billing), url: useVirtualUrl() }), {
      wrapper: wrapperAt('/user/security', userScope),
    });
    expect(result.current.router.route).toBeUndefined();
    expect(result.current.url).toBe('/user/security');
  });

  it('throws without a scope', () => {
    expect(() => renderHook(() => useRouter(routes), { wrapper: wrapperAt('/user') })).toThrow('useRouterScope');
  });
});
