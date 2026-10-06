import type * as SharedReact from '@clerk/shared/react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicRoutingProvider, type MosaicRoutingProviderProps } from '../MosaicRoutingProvider';
import { useMosaicRoutes } from '../useMosaicRoutes';

const navigate = vi.fn((to: string, options?: { replace?: boolean }) => {
  history[options?.replace ? 'replaceState' : 'pushState'](null, '', to);
  return Promise.resolve();
});

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return { ...actual, useClerk: () => ({ navigate }) };
});

const routes = {
  index: '',
  security: 'security',
  statement: 'billing/statement/:statementId',
} as const;

function renderRoutes(props?: Omit<MosaicRoutingProviderProps, 'children'>) {
  return renderHook(() => useMosaicRoutes(routes), {
    wrapper: props
      ? ({ children }: { children: React.ReactNode }) => (
          <MosaicRoutingProvider {...props}>{children}</MosaicRoutingProvider>
        )
      : undefined,
  });
}

beforeEach(() => {
  navigate.mockClear();
  history.replaceState(null, '', '/user-profile');
});

afterEach(() => {
  cleanup();
});

describe('useMosaicRoutes without a provider', () => {
  it('starts at the index route in memory', () => {
    const { result } = renderRoutes();

    expect(result.current.route).toBe('index');
  });

  it('returns the same result between renders when the route did not change', () => {
    const { result, rerender } = renderRoutes();
    const before = result.current;

    rerender();

    expect(result.current).toBe(before);
  });

  it('moves between routes without touching the URL', async () => {
    const { result } = renderRoutes();

    await act(() => result.current.go('statement', { statementId: 'st_1' }));

    expect(result.current.route).toBe('statement');
    expect(result.current.params).toEqual({ statementId: 'st_1' });
    expect(window.location.pathname).toBe('/user-profile');
  });
});

describe('useMosaicRoutes with memory routing', () => {
  it('starts at the initial path', () => {
    const { result } = renderRoutes({ routing: 'memory', initialPath: 'security?tab=1' });

    expect(result.current.route).toBe('security');
    expect(result.current.search).toEqual({ tab: '1' });
  });
});

describe('useMosaicRoutes with hash routing', () => {
  it('reads the route from the hash and writes it back', async () => {
    history.replaceState(null, '', '/user-profile#/security');
    const { result } = renderRoutes({ routing: 'hash' });
    expect(result.current.route).toBe('security');

    await act(() => result.current.go('index'));

    expect(result.current.route).toBe('index');
    expect(window.location.hash).toBe('#/');
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('useMosaicRoutes with path routing', () => {
  it('reads the route relative to the base path', () => {
    history.replaceState(null, '', '/user-profile/billing/statement/st_1');
    const { result } = renderRoutes({ routing: 'path', path: '/user-profile' });

    expect(result.current.route).toBe('statement');
  });

  it('navigates through clerk as an internal navigation', async () => {
    const { result } = renderRoutes({ routing: 'path', path: '/user-profile' });

    await act(() => result.current.go('security', {}, { replace: true }));

    expect(navigate).toHaveBeenCalledWith('/user-profile/security', {
      replace: true,
      metadata: { navigationType: 'internal' },
    });
    expect(result.current.route).toBe('security');
  });

  it('carries preserved search params across moves', async () => {
    history.replaceState(null, '', '/user-profile?redirect_url=%2Fhome&other=1');
    const { result } = renderRoutes({ routing: 'path', path: '/user-profile' });

    await act(() => result.current.go('security'));

    expect(navigate).toHaveBeenCalledWith('/user-profile/security?redirect_url=%2Fhome', expect.anything());
  });

  it('follows navigation made outside the component', async () => {
    const { result } = renderRoutes({ routing: 'path', path: '/user-profile' });

    act(() => history.pushState(null, '', '/user-profile/security'));

    await waitFor(() => expect(result.current.route).toBe('security'));
  });

  it('replaces a fragment path with the real path on mount', async () => {
    history.replaceState(null, '', '/user-profile#/security');
    const { result } = renderRoutes({ routing: 'path', path: '/user-profile' });

    expect(result.current.route).toBe('security');
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith('/user-profile/security', {
        replace: true,
        metadata: { navigationType: 'internal' },
      }),
    );
  });
});
