import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';
import { useModuleManager } from '@/ui/contexts';
import { Box } from '@/ui/customizables';

import { computedColors } from '../../customizables/__tests__/test-utils';
import { clearFetchCache } from '../../hooks';
import { OrganizationProfileProvider } from '../OrganizationProfile/OrganizationProfileProvider';
import { fallbackModuleManager } from '../ProfileProviderShell';
import { UserProfileAccountPanel } from '../UserProfile/Account';
import { UserProfileProfileSection } from '../UserProfile/AccountProfile';
import { UserProfileSecurityPanel } from '../UserProfile/Security';
import { UserProfilePasswordSection } from '../UserProfile/SecurityPassword';
import { UserProfileProvider } from '../UserProfile/UserProfileProvider';

function patchEnvironment(clerk: any, env: any) {
  Object.defineProperty(clerk, '__internal_environment', { value: env, configurable: true });
}

describe('UserProfileProvider wiring', () => {
  const { createFixtures } = bindCreateFixtures('UserProfile');

  beforeEach(() => {
    clearFetchCache();
  });

  it('falls back to fallbackModuleManager when the clerk instance exposes no moduleManager', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);
    // Simulate a clerk-js too old to expose the getter (returns undefined).
    Object.defineProperty(fixtures.clerk, '__internal_moduleManager', {
      value: undefined,
      configurable: true,
    });

    function FallbackProbe() {
      const mm = useModuleManager();
      return (
        <div
          data-testid='mm-fallback-probe'
          data-is-fallback={String(mm === fallbackModuleManager)}
        />
      );
    }

    render(
      <UserProfileProvider>
        <FallbackProbe />
      </UserProfileProvider>,
      { wrapper },
    );

    expect(screen.getByTestId('mm-fallback-probe').dataset.isFallback).toBe('true');
  });

  // The end-to-end proof that resolution actually feeds a dynamic import: render
  // the real composed password section, enable zxcvbn strength, type a password,
  // and assert the resolved manager's `import` fires for the zxcvbn module. This
  // exercises the whole chain UserProfileProvider -> ProfileProviderShell ->
  // ModuleManagerProvider -> useModuleManager -> usePassword -> loadZxcvbn.
  // (This is the deterministic in-process analog of a Playwright flow, which
  // cannot run this path without a backend instance that has `show_zxcvbn` on.)
  it('feeds the resolved moduleManager into the composed password strength import', async () => {
    // Never settles, so the un-caught `.then` in createValidatePassword does not
    // surface as an unhandled rejection; we only care that `import` was invoked.
    const importSpy = vi.fn(() => new Promise<undefined>(() => {}));

    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withPassword();
      f.withPasswordComplexity({ show_zxcvbn: true });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);
    Object.defineProperty(fixtures.clerk, '__internal_moduleManager', {
      value: { import: importSpy },
      configurable: true,
    });

    const { userEvent, getByRole, getByLabelText } = render(
      <UserProfileProvider>
        <UserProfileSecurityPanel>
          <UserProfilePasswordSection />
        </UserProfileSecurityPanel>
      </UserProfileProvider>,
      { wrapper },
    );

    await userEvent.click(getByRole('button', { name: /set password/i }));
    await userEvent.type(getByLabelText(/new password/i), 'weak');

    await waitFor(() => {
      expect(importSpy).toHaveBeenCalledWith('@zxcvbn-ts/core');
    });
  });

  it('returns null when user is not loaded', async () => {
    const { wrapper, fixtures } = await createFixtures();
    patchEnvironment(fixtures.clerk, fixtures.environment);

    render(
      <UserProfileProvider>
        <div data-testid='should-not-render' />
      </UserProfileProvider>,
      { wrapper },
    );

    expect(screen.queryByTestId('should-not-render')).not.toBeInTheDocument();
  });

  it('cascades globalAppearance from ClerkProvider into rendered composed styles', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);

    // Simulate ClerkProvider setting appearance with colorPrimary.
    fixtures.clerk.__internal_getOption = vi.fn((key: string) =>
      key === 'appearance' ? { variables: { colorPrimary: 'red' } } : undefined,
    );

    render(
      <UserProfileProvider>
        <Box
          data-testid='primary-swatch'
          sx={t => ({ backgroundColor: t.colors.$primary500 })}
        />
      </UserProfileProvider>,
      { wrapper },
    );

    expect(getComputedStyle(screen.getByTestId('primary-swatch')).backgroundColor).toBe(computedColors.red);
  });

  it('threads ClerkProvider localization into rendered composed text', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);

    fixtures.clerk.__internal_getOption = vi.fn((key: string) =>
      key === 'localization' ? { userProfile: { start: { headerTitle__account: 'Détails du profil' } } } : undefined,
    );

    render(
      <UserProfileProvider>
        <UserProfileAccountPanel>
          <UserProfileProfileSection />
        </UserProfileAccountPanel>
      </UserProfileProvider>,
      { wrapper },
    );

    await waitFor(() => screen.getByText('Détails du profil'));
  });

  it('returns null when environment is missing', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, undefined);

    render(
      <UserProfileProvider>
        <div data-testid='should-not-render' />
      </UserProfileProvider>,
      { wrapper },
    );

    expect(screen.queryByTestId('should-not-render')).not.toBeInTheDocument();
  });
});

describe('OrganizationProfileProvider wiring', () => {
  const { createFixtures } = bindCreateFixtures('OrganizationProfile');

  beforeEach(() => {
    clearFetchCache();
  });

  it('falls back to fallbackModuleManager when the clerk instance exposes no moduleManager', async () => {
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
    Object.defineProperty(fixtures.clerk, '__internal_moduleManager', {
      value: undefined,
      configurable: true,
    });

    function FallbackProbe() {
      const mm = useModuleManager();
      return (
        <div
          data-testid='org-mm-fallback-probe'
          data-is-fallback={String(mm === fallbackModuleManager)}
        />
      );
    }

    render(
      <OrganizationProfileProvider>
        <FallbackProbe />
      </OrganizationProfileProvider>,
      { wrapper },
    );

    expect(screen.getByTestId('org-mm-fallback-probe').dataset.isFallback).toBe('true');
  });

  it('returns null when organization is not loaded', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);

    render(
      <OrganizationProfileProvider>
        <div data-testid='should-not-render' />
      </OrganizationProfileProvider>,
      { wrapper },
    );

    expect(screen.queryByTestId('should-not-render')).not.toBeInTheDocument();
  });
});

// The fallback exists to fail loudly instead of silently resolving `undefined`.
// This is the contract the whole getter refactor protects: when a too-old
// clerk-js exposes no manager, the first dynamic import (Web3, billing,
// password strength) must reject with a stable, diagnosable code rather than
// degrade to an opaque access on a missing module.
describe('fallbackModuleManager', () => {
  it('rejects dynamic imports with a composed_module_manager_unavailable code', async () => {
    await expect(fallbackModuleManager.import('@zxcvbn-ts/core')).rejects.toMatchObject({
      code: 'composed_module_manager_unavailable',
    });
  });
});

// Both providers were changed identically to resolve the manager through the
// live `clerk.__internal_moduleManager` getter, which crosses bundle boundaries
// regardless of how many @clerk/shared copies are installed. A registry keyed by
// module-scoped state would silently return the wrong manager (or undefined) when
// the read-side @clerk/shared is a different physical copy than the write-side
// one. Exposing a getter-only manager (distinct from anything the real Clerk
// instance registered) and surfacing it proves the read channel is the getter,
// not a shared registry — pinned here for both providers.
describe('moduleManager getter resolution', () => {
  beforeEach(() => {
    clearFetchCache();
  });

  const cases = [
    {
      name: 'UserProfileProvider',
      component: 'UserProfile' as const,
      Provider: UserProfileProvider,
      testId: 'mm-getter-probe',
      setup: (f: any) => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      },
    },
    {
      name: 'OrganizationProfileProvider',
      component: 'OrganizationProfile' as const,
      Provider: OrganizationProfileProvider,
      testId: 'org-mm-getter-probe',
      setup: (f: any) => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          first_name: 'Test',
          last_name: 'User',
          organization_memberships: [{ name: 'TestOrg' }],
        });
      },
    },
  ];

  it.each(cases)(
    '$name resolves the moduleManager from clerk.__internal_moduleManager (getter), not a shared registry',
    async ({ component, Provider, testId, setup }) => {
      const { createFixtures } = bindCreateFixtures(component);
      const getterImport = vi.fn(() => Promise.resolve(undefined));
      const getterModuleManager = { import: getterImport };

      const { wrapper, fixtures } = await createFixtures(setup);
      patchEnvironment(fixtures.clerk, fixtures.environment);
      fixtures.clerk.organization?.getDomains?.mockReturnValue(Promise.resolve({ data: [], total_count: 0 }));
      Object.defineProperty(fixtures.clerk, '__internal_moduleManager', {
        value: getterModuleManager,
        configurable: true,
      });

      function ModuleManagerIdentityProbe() {
        const mm = useModuleManager();
        return (
          <div
            data-testid={testId}
            data-from-getter={String(mm?.import === getterImport)}
          />
        );
      }

      render(
        <Provider>
          <ModuleManagerIdentityProbe />
        </Provider>,
        { wrapper },
      );

      expect(screen.getByTestId(testId).dataset.fromGetter).toBe('true');
    },
  );
});
