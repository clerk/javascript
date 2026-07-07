import { act } from '@testing-library/react';
import { useContext } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { useModuleManager, useOptions } from '@/ui/contexts';
import { useAppearance } from '@/ui/customizables/AppearanceContext';
import { useRouter } from '@/ui/router';

import { OrganizationProfileContext } from '../../contexts/components/OrganizationProfile';
import { UserProfileContext } from '../../contexts/components/UserProfile';
import { clearFetchCache } from '../../hooks';
import { OrganizationProfileProvider } from '../OrganizationProfile/OrganizationProfileProvider';
import { fallbackModuleManager } from '../ProfileProviderShell';
import { UserProfileProvider } from '../UserProfile/UserProfileProvider';

function patchEnvironment(clerk: any, env: any) {
  Object.defineProperty(clerk, '__internal_environment', { value: env, configurable: true });
}

function ModuleManagerProbe() {
  const mm = useModuleManager();
  return (
    <div
      data-testid='mm-probe'
      data-has-mm={!!mm}
    />
  );
}

function RouterProbe() {
  const router = useRouter();
  return (
    <div
      data-testid='router-probe'
      data-has-navigate={typeof router.navigate === 'function'}
      data-has-base-navigate={typeof router.baseNavigate === 'function'}
    />
  );
}

describe('UserProfileProvider wiring', () => {
  const { createFixtures } = bindCreateFixtures('UserProfile');

  beforeEach(() => {
    clearFetchCache();
  });

  it("provides the clerk instance's moduleManager to children", async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);

    render(
      <UserProfileProvider>
        <ModuleManagerProbe />
      </UserProfileProvider>,
      { wrapper },
    );

    const probe = screen.getByTestId('mm-probe');
    expect(probe.dataset.hasMm).toBe('true');
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

  it('provides a router that delegates to clerk.navigate', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);

    render(
      <UserProfileProvider>
        <RouterProbe />
      </UserProfileProvider>,
      { wrapper },
    );

    const probe = screen.getByTestId('router-probe');
    expect(probe.dataset.hasNavigate).toBe('true');
    expect(probe.dataset.hasBaseNavigate).toBe('true');
  });

  // The shell does NOT track the host app URL. Composed has no Clerk-internal
  // navigation between sections (consumer remounts <UserProfile.X>), so there's
  // no meaningful currentPath to snapshot — and observing the consumer's URL
  // would just trigger spurious navigation-keyed effects.
  describe('router.currentPath is decoupled from the host URL', () => {
    let originalPath: string;

    beforeEach(() => {
      originalPath = window.location.pathname;
    });

    afterEach(() => {
      window.history.replaceState(null, '', originalPath);
    });

    function CurrentPathProbe() {
      const router = useRouter();
      return (
        <div
          data-testid='path-probe'
          data-current={router.currentPath}
        />
      );
    }

    it('does not snapshot window.location.pathname into router.currentPath', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      patchEnvironment(fixtures.clerk, fixtures.environment);

      window.history.replaceState(null, '', '/page-a');

      render(
        <UserProfileProvider>
          <CurrentPathProbe />
        </UserProfileProvider>,
        { wrapper },
      );

      expect(screen.getByTestId('path-probe').dataset.current).toBe('');
    });

    it('does not update router.currentPath on popstate', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      patchEnvironment(fixtures.clerk, fixtures.environment);

      render(
        <UserProfileProvider>
          <CurrentPathProbe />
        </UserProfileProvider>,
        { wrapper },
      );

      act(() => {
        window.history.pushState(null, '', '/page-b');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });

      expect(screen.getByTestId('path-probe').dataset.current).toBe('');
    });
  });

  // Dedup-independence: the provider must resolve the manager through the
  // live `clerk.__internal_moduleManager` getter, which crosses bundle
  // boundaries regardless of how many @clerk/shared copies are installed.
  // A registry keyed by module-scoped state would silently return the wrong
  // manager (or undefined) when the read-side @clerk/shared is a different
  // physical copy than the write-side one. Here the getter exposes a distinct
  // manager than anything the real Clerk instance registered, so surfacing it
  // proves the read channel is the getter, not a shared registry.
  it('resolves the moduleManager from clerk.__internal_moduleManager (getter), not a shared registry', async () => {
    const getterImport = vi.fn(() => Promise.resolve(undefined));
    const getterModuleManager = { import: getterImport };

    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);
    Object.defineProperty(fixtures.clerk, '__internal_moduleManager', {
      value: getterModuleManager,
      configurable: true,
    });

    function ModuleManagerIdentityProbe() {
      const mm = useModuleManager();
      return (
        <div
          data-testid='mm-getter-probe'
          data-from-getter={String(mm?.import === getterImport)}
        />
      );
    }

    render(
      <UserProfileProvider>
        <ModuleManagerIdentityProbe />
      </UserProfileProvider>,
      { wrapper },
    );

    expect(screen.getByTestId('mm-getter-probe').dataset.fromGetter).toBe('true');
  });

  it('returns null when user is not loaded', async () => {
    const { wrapper, fixtures } = await createFixtures();
    patchEnvironment(fixtures.clerk, fixtures.environment);

    const { container } = render(
      <UserProfileProvider>
        <div data-testid='should-not-render' />
      </UserProfileProvider>,
      { wrapper },
    );

    expect(screen.queryByTestId('should-not-render')).not.toBeInTheDocument();
  });

  it('cascades globalAppearance from ClerkProvider into composed theme', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);

    // Simulate ClerkProvider setting appearance with colorPrimary
    fixtures.clerk.__internal_getOption = vi.fn((key: string) => {
      if (key === 'appearance') {
        return { variables: { colorPrimary: '#ff0000' } };
      }
      return undefined;
    });

    function AppearanceProbe() {
      const { parsedInternalTheme } = useAppearance();
      return (
        <div
          data-testid='appearance-probe'
          data-color-primary={parsedInternalTheme.colors.$primary500}
        />
      );
    }

    render(
      <UserProfileProvider>
        <AppearanceProbe />
      </UserProfileProvider>,
      { wrapper },
    );

    const probe = screen.getByTestId('appearance-probe');
    // #ff0000 = hsla(0, 100%, 50%, 1) — the global appearance should cascade
    expect(probe.dataset.colorPrimary).toBe('hsla(0, 100%, 50%, 1)');
  });

  it('threads localization from ClerkProvider into composed OptionsProvider', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);

    const expectedLocalization = { locale: 'fr-FR', signIn: { start: { title: 'Bienvenue' } } };
    const expectedSupportEmail = 'help@clerk.dev';
    fixtures.clerk.__internal_getOption = vi.fn((key: string) => {
      if (key === 'localization') {
        return expectedLocalization;
      }
      if (key === 'supportEmail') {
        return expectedSupportEmail;
      }
      return undefined;
    });

    function OptionsProbe() {
      const options = useOptions();
      return (
        <div
          data-testid='options-probe'
          data-locale={(options.localization as any)?.locale ?? ''}
          data-support-email={options.supportEmail ?? ''}
        />
      );
    }

    render(
      <UserProfileProvider>
        <OptionsProbe />
      </UserProfileProvider>,
      { wrapper },
    );

    const probe = screen.getByTestId('options-probe');
    expect(probe.dataset.locale).toBe('fr-FR');
    expect(probe.dataset.supportEmail).toBe(expectedSupportEmail);
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

  it('forwards apiKeysProps into the UserProfile context', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);

    function ApiKeysProbe() {
      const ctx = useContext(UserProfileContext);
      return (
        <div
          data-testid='apikeys-probe'
          data-api-keys={JSON.stringify(ctx?.apiKeysProps)}
        />
      );
    }

    render(
      <UserProfileProvider apiKeysProps={{ perPage: 5 }}>
        <ApiKeysProbe />
      </UserProfileProvider>,
      { wrapper },
    );

    expect(JSON.parse(screen.getByTestId('apikeys-probe').dataset.apiKeys || 'null')).toEqual({ perPage: 5 });
  });
});

describe('OrganizationProfileProvider wiring', () => {
  const { createFixtures } = bindCreateFixtures('OrganizationProfile');

  beforeEach(() => {
    clearFetchCache();
  });

  it("provides the clerk instance's moduleManager to children", async () => {
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
      <OrganizationProfileProvider>
        <ModuleManagerProbe />
      </OrganizationProfileProvider>,
      { wrapper },
    );

    const probe = screen.getByTestId('mm-probe');
    expect(probe.dataset.hasMm).toBe('true');
  });

  // Mirror of the UserProfileProvider getter test: OrganizationProfileProvider
  // was changed identically, so pin the same dedup-independent read channel.
  it('resolves the moduleManager from clerk.__internal_moduleManager (getter), not a shared registry', async () => {
    const getterImport = vi.fn(() => Promise.resolve(undefined));
    const getterModuleManager = { import: getterImport };

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
      value: getterModuleManager,
      configurable: true,
    });

    function ModuleManagerIdentityProbe() {
      const mm = useModuleManager();
      return (
        <div
          data-testid='org-mm-getter-probe'
          data-from-getter={String(mm?.import === getterImport)}
        />
      );
    }

    render(
      <OrganizationProfileProvider>
        <ModuleManagerIdentityProbe />
      </OrganizationProfileProvider>,
      { wrapper },
    );

    expect(screen.getByTestId('org-mm-getter-probe').dataset.fromGetter).toBe('true');
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

    const { container } = render(
      <OrganizationProfileProvider>
        <div data-testid='should-not-render' />
      </OrganizationProfileProvider>,
      { wrapper },
    );

    expect(screen.queryByTestId('should-not-render')).not.toBeInTheDocument();
  });

  it('forwards afterLeaveOrganizationUrl and apiKeysProps into the OrganizationProfile context', async () => {
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

    function OrgProbe() {
      const ctx = useContext(OrganizationProfileContext);
      return (
        <div
          data-testid='org-probe'
          data-after-leave={ctx?.afterLeaveOrganizationUrl ?? ''}
          data-api-keys={JSON.stringify(ctx?.apiKeysProps)}
        />
      );
    }

    render(
      <OrganizationProfileProvider
        afterLeaveOrganizationUrl='/bye'
        apiKeysProps={{ showDescription: true }}
      >
        <OrgProbe />
      </OrganizationProfileProvider>,
      { wrapper },
    );

    const probe = screen.getByTestId('org-probe');
    expect(probe.dataset.afterLeave).toBe('/bye');
    expect(JSON.parse(probe.dataset.apiKeys || 'null')).toEqual({ showDescription: true });
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
