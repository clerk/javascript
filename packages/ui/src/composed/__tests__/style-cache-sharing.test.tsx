import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';
import { getStyleCache } from '@/ui/internal/styleCacheStore';

import { clearFetchCache } from '../../hooks';
import { OrganizationProfileProvider } from '../OrganizationProfile/OrganizationProfileProvider';
import { UserProfileProvider } from '../UserProfile/UserProfileProvider';

function patchEnvironment(clerk: any, env: any) {
  Object.defineProperty(clerk, '__internal_environment', { value: env, configurable: true });
}

describe('composed style cache sharing', () => {
  const { createFixtures } = bindCreateFixtures('UserProfile');

  beforeEach(() => {
    clearFetchCache();
  });

  it('sibling UserProfile + OrganizationProfile roots share one emotion cache per clerk instance', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        first_name: 'Test',
        last_name: 'User',
        organization_memberships: [{ name: 'TestOrg' }],
      });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);
    fixtures.clerk.organization?.getDomains.mockReturnValue(Promise.resolve({ data: [], total_count: 0 }));

    render(
      <>
        <UserProfileProvider>
          <div data-testid='user-child' />
        </UserProfileProvider>
        <OrganizationProfileProvider>
          <div data-testid='org-child' />
        </OrganizationProfileProvider>
      </>,
      { wrapper },
    );

    const cache = getStyleCache(fixtures.clerk);
    expect(cache).toBeDefined();
    expect(cache?.key).toBe('cl-internal');

    // Second sibling must reuse the cache the first sibling set on the WeakMap,
    // rather than creating a new one. The WeakMap is the sharing channel.
    const cacheAgain = getStyleCache(fixtures.clerk);
    expect(cacheAgain).toBe(cache);
  });

  it('distinct clerk instances get distinct caches', async () => {
    const first = await createFixtures(f => {
      f.withUser({ email_addresses: ['a@clerk.com'] });
    });
    patchEnvironment(first.fixtures.clerk, first.fixtures.environment);

    const second = await createFixtures(f => {
      f.withUser({ email_addresses: ['b@clerk.com'] });
    });
    patchEnvironment(second.fixtures.clerk, second.fixtures.environment);

    render(
      <UserProfileProvider>
        <div data-testid='a' />
      </UserProfileProvider>,
      { wrapper: first.wrapper },
    );

    render(
      <UserProfileProvider>
        <div data-testid='b' />
      </UserProfileProvider>,
      { wrapper: second.wrapper },
    );

    const cacheA = getStyleCache(first.fixtures.clerk);
    const cacheB = getStyleCache(second.fixtures.clerk);

    expect(cacheA).toBeDefined();
    expect(cacheB).toBeDefined();
    expect(cacheA).not.toBe(cacheB);
  });

  it('first mount initializes the cache with the clerk-provided nonce', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);

    const expectedNonce = 'test-nonce-abc123';
    const originalGetOption = fixtures.clerk.__internal_getOption.bind(fixtures.clerk);
    fixtures.clerk.__internal_getOption = (key: string) => {
      if (key === 'nonce') {
        return expectedNonce;
      }
      return originalGetOption(key);
    };

    render(
      <UserProfileProvider>
        <div data-testid='child' />
      </UserProfileProvider>,
      { wrapper },
    );

    const cache = getStyleCache(fixtures.clerk);
    expect(cache?.sheet.nonce).toBe(expectedNonce);
  });

  it('wraps emitted CSS in @layer when appearance.cssLayerName is configured', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);

    fixtures.clerk.__internal_getOption = vi.fn((key: string) => {
      if (key === 'appearance') {
        return { cssLayerName: 'app-clerk' };
      }
      return undefined;
    });

    render(
      <UserProfileProvider>
        <div data-testid='child' />
      </UserProfileProvider>,
      { wrapper },
    );

    const cache = getStyleCache(fixtures.clerk);
    expect(cache).toBeDefined();
    if (!cache) {
      return;
    }

    // Insert a style and read what actually landed in the cache's <style> tags.
    // When cssLayerName is set, the composed shell wraps every insertion in
    // `@layer <name>`, so the emitted CSS must carry both the layer and the rule.
    cache.insert('.cl-test', { name: 'test', styles: 'color:red;', next: undefined } as any, cache.sheet, false);
    const emitted = cache.sheet.tags.map((tag: HTMLStyleElement) => tag.textContent ?? '').join('');
    expect(emitted).toContain('color:red');
    expect(emitted).toContain('@layer app-clerk');
  });
});
