import { afterEach, describe, expect, it, vi } from 'vitest';

import { createComposedRouter, stubRouter } from '../stubRouter';

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

describe('stubRouter fallback', () => {
  it('is created with window.location.assign as navigator', () => {
    // stubRouter is a pre-built instance that delegates to window.location.assign.
    // We can't spy on window.location.assign in jsdom, but we verify it's a valid router.
    expect(stubRouter.navigate).toBeDefined();
    expect(stubRouter.baseNavigate).toBeDefined();
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
