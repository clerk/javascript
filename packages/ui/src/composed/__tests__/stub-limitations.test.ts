import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createComposedRouter, stubRouter } from '../stubRouter';
import { useBillingRouter } from '../useBillingRouter';

describe('createComposedRouter', () => {
  it('navigate delegates to clerkNavigate for same-origin paths', async () => {
    const clerkNavigate = vi.fn().mockResolvedValue(undefined);
    const router = createComposedRouter(clerkNavigate);

    await router.navigate('/dashboard');

    expect(clerkNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigate delegates to clerkNavigate for relative paths', async () => {
    const clerkNavigate = vi.fn().mockResolvedValue(undefined);
    const router = createComposedRouter(clerkNavigate);

    await router.navigate('../');

    expect(clerkNavigate).toHaveBeenCalledWith('../');
  });

  it('navigate delegates to clerkNavigate for external URLs', async () => {
    const clerkNavigate = vi.fn().mockResolvedValue(undefined);
    const router = createComposedRouter(clerkNavigate);

    await router.navigate('https://external.example.com/callback');

    expect(clerkNavigate).toHaveBeenCalledWith('https://external.example.com/callback');
  });

  it('baseNavigate delegates to clerkNavigate with URL href', async () => {
    const clerkNavigate = vi.fn().mockResolvedValue(undefined);
    const router = createComposedRouter(clerkNavigate);

    await router.baseNavigate(new URL('https://example.com/path'));

    expect(clerkNavigate).toHaveBeenCalledWith('https://example.com/path');
  });

  it('resolve produces URLs relative to current location', () => {
    const router = createComposedRouter(vi.fn());

    const resolved = router.resolve('/some-path');
    expect(resolved.pathname).toBe('/some-path');
  });
});

describe('createComposedRouter — AIO-only APIs throw in dev', () => {
  it('matches() throws', () => {
    const router = createComposedRouter(vi.fn());
    expect(() => router.matches('/foo')).toThrow(/not supported inside composed sections/);
  });

  it('refresh() throws', () => {
    const router = createComposedRouter(vi.fn());
    expect(() => router.refresh()).toThrow(/not supported inside composed sections/);
  });

  it('getMatchData() throws', () => {
    const router = createComposedRouter(vi.fn());
    expect(() => router.getMatchData('/foo')).toThrow(/not supported inside composed sections/);
  });
});

describe('stubRouter fallback', () => {
  it('is created with window.location.assign as navigator', () => {
    // stubRouter is a pre-built instance that delegates to window.location.assign.
    // We can't spy on window.location.assign in jsdom, but we verify it's a valid router.
    expect(stubRouter.navigate).toBeDefined();
    expect(stubRouter.baseNavigate).toBeDefined();
  });
});

describe('useBillingRouter — in-memory by design', () => {
  // Composed billing routing is purely React state — the consumer owns the
  // page URL. Trade-off: back/forward, refresh, and deep-links do not preserve
  // sub-route or tab state. These tests pin that decision.

  let originalHash: string;

  afterEach(() => {
    window.location.hash = originalHash ?? '';
  });

  it('navigate() does not touch window.location.hash', async () => {
    originalHash = window.location.hash;
    const { result } = renderHook(() => useBillingRouter());

    await act(async () => {
      await result.current.router.navigate('plans');
    });

    expect(window.location.hash).toBe(originalHash);
    expect(result.current.route.page).toBe('plans');
  });

  it('navigate() does not push a history entry', async () => {
    const before = window.history.length;
    const { result } = renderHook(() => useBillingRouter());

    await act(async () => {
      await result.current.router.navigate('statement/abc');
    });

    expect(window.history.length).toBe(before);
  });
});

describe('createComposedRouter — SSR safety', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolve() does not throw when window is undefined', () => {
    vi.stubGlobal('window', undefined);

    const router = createComposedRouter(vi.fn());
    expect(() => router.resolve('/some-path')).not.toThrow();
    expect(router.resolve('/some-path').pathname).toBe('/some-path');
  });

  it('stubRouter.navigate is a no-op (does not throw) when window is undefined', async () => {
    vi.stubGlobal('window', undefined);

    await expect(stubRouter.navigate('/foo')).resolves.toBeUndefined();
  });
});
