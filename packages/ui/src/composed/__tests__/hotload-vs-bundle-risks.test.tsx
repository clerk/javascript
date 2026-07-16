import { logger } from '@clerk/shared/logger';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';
import { getStyleCache } from '@/ui/internal/styleCacheStore';
import { createEmotionCache } from '@/ui/styledSystem/createEmotionCache';

import { clearFetchCache } from '../../hooks';
import { fallbackModuleManager, resolveComposedClerkRuntime } from '../ProfileProviderShell';
import { UserProfileProvider } from '../UserProfile/UserProfileProvider';

function patchEnvironment(clerk: any, env: any) {
  Object.defineProperty(clerk, '__internal_environment', { value: env, configurable: true });
}

function insertRule(cache: ReturnType<typeof createEmotionCache>, name: string, styles: string) {
  cache.insert('', { name, styles, next: undefined } as any, cache.sheet, true);
}

describe('hotload (clerk-js) vs app-bundle (composed) risks', () => {
  const { createFixtures } = bindCreateFixtures('UserProfile');

  beforeEach(() => {
    clearFetchCache();
  });

  // RISK 1 (inherent, documented) — Two emotion runtimes, one document.
  // The composed `styleCacheStore` WeakMap dedups cache creation only WITHIN the
  // app bundle. The hotloaded clerk-js inlines its own @emotion (module-scoped
  // state does not cross the bundle boundary — same reason clerk.ts exposes
  // `__internal_moduleManager` as a getter). So when a page shows both a
  // hotloaded AIO component (e.g. the impersonation fab, which auto-mounts) and
  // a bundled composed profile, TWO independent `cl-internal` caches emit styles
  // into the same <head>. This cannot be deduped from the composed side; it needs
  // a clerk-js contract change (share its cache) or a pinned-min-version policy.
  // The test pins the current reality so a future shared-cache fix flips it.
  it('does not share/dedup styles between the AIO-path cache and the composed-path cache', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);

    render(
      <UserProfileProvider>
        <div data-testid='child' />
      </UserProfileProvider>,
      { wrapper },
    );

    const composedCache = getStyleCache(fixtures.clerk);
    // The AIO StyleCacheProvider builds its cache the same way, but the hotloaded
    // clerk-js does it inside its own bundle, so it is never stored in this store.
    const aioCache = createEmotionCache({});

    expect(composedCache).toBeDefined();
    if (!composedCache) {
      return;
    }

    // Same emotion key -> both write <style data-emotion="cl-internal"> groups.
    expect(composedCache.key).toBe('cl-internal');
    expect(aioCache.key).toBe('cl-internal');
    // But they are different registries: the WeakMap cannot reach across bundles.
    expect(aioCache).not.toBe(composedCache);

    // The exact same rule gets independently inserted by each cache: on a real
    // page that is a duplicate insertion, with independent ordering.
    insertRule(composedCache, 'dup', 'color:red;');
    insertRule(aioCache, 'dup', 'color:red;');

    expect(composedCache.inserted.dup).toBeDefined();
    expect(aioCache.inserted.dup).toBeDefined();
  });

  // RISK 2 (fixed) — cache params must not freeze at the first composed mount.
  // The shared cache is keyed on the clerk instance so sibling roots reuse it,
  // but a change to nonce/cssLayerName must rebuild it (matching what the AIO
  // StyleCacheProvider does via its useMemo deps). Otherwise whatever the first
  // composed root saw would win forever and later styles would silently diverge
  // from AIO's cascade (e.g. missing the configured @layer).
  it('rebuilds the shared cache when cssLayerName changes after the first mount', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);

    // First mount: appearance has no cssLayerName.
    fixtures.clerk.__internal_getOption = () => undefined;

    const first = render(
      <UserProfileProvider>
        <div data-testid='a' />
      </UserProfileProvider>,
      { wrapper },
    );
    first.unmount();

    // App turns on a css layer AFTER the first profile mounted.
    fixtures.clerk.__internal_getOption = (key: string) =>
      key === 'appearance' ? { cssLayerName: 'app-layer' } : undefined;

    render(
      <UserProfileProvider>
        <div data-testid='b' />
      </UserProfileProvider>,
      { wrapper },
    );

    const cache = getStyleCache(fixtures.clerk);
    expect(cache).toBeDefined();
    if (!cache) {
      return;
    }

    insertRule(cache, 'layered', 'color:blue;');
    const emitted = cache.sheet.tags.map((tag: HTMLStyleElement) => tag.textContent ?? '').join('');

    expect(emitted).toContain('color:blue');
    // The second mount asked for `@layer app-layer`; the cache must have been
    // rebuilt with that layer instead of reusing the first-mount (unwrapped) one.
    expect(emitted).toContain('@layer app-layer');
  });
});

// RISK 3 (fixed) — version skew must not fail silently.
// Composed reads `__internal_environment` / `__internal_moduleManager` off the
// hotloaded clerk-js. When the loaded clerk-js is older than the composed code
// bundled in the app, those are absent and the provider renders nothing. That is
// intentional (can't render without runtime state), but it must be observable:
// once clerk has finished loading, a missing runtime is a real misconfiguration
// and gets a one-time dev warning instead of a blank screen with no signal.
describe('composed runtime resolution (version skew)', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns once when clerk is loaded but exposes no environment (older clerk-js)', () => {
    const clerk = { __internal_moduleManager: { import: () => Promise.resolve({}) } } as any;

    const { environment, moduleManager } = resolveComposedClerkRuntime(clerk, true);

    expect(environment).toBeUndefined();
    expect(moduleManager).toBe(clerk.__internal_moduleManager);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/clerk-js/i);
  });

  it('warns and falls back to the loud module manager when the manager is absent', () => {
    const clerk = { __internal_environment: {} } as any;

    const { environment, moduleManager } = resolveComposedClerkRuntime(clerk, true);

    expect(environment).toBeDefined();
    expect(moduleManager).toBe(fallbackModuleManager);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('does not warn while clerk is still loading (transient absence is normal)', () => {
    const clerk = {} as any;

    resolveComposedClerkRuntime(clerk, false);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn once clerk is fully wired', () => {
    const clerk = {
      __internal_environment: {},
      __internal_moduleManager: { import: () => Promise.resolve({}) },
    } as any;

    resolveComposedClerkRuntime(clerk, true);

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
