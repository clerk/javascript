import { setModuleManager as setModuleManagerShared } from '@clerk/shared/moduleManager';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useModuleManager, useOptions } from '@/ui/contexts';
import { useAppearance } from '@/ui/customizables/AppearanceContext';
import { setModuleManager } from '@/ui/internal/moduleManagerStore';
import { useRouter } from '@/ui/router';
import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { clearFetchCache } from '../../hooks';
import { OrganizationProfileProvider } from '../OrganizationProfile/OrganizationProfileProvider';
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

  it('provides the moduleManager from the store to children', async () => {
    const mockImport = vi.fn(() => Promise.resolve(undefined));

    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);
    setModuleManager(fixtures.clerk, { import: mockImport });

    render(
      <UserProfileProvider>
        <ModuleManagerProbe />
      </UserProfileProvider>,
      { wrapper },
    );

    const probe = screen.getByTestId('mm-probe');
    expect(probe.dataset.hasMm).toBe('true');
  });

  it('falls back to fallback moduleManager when store has no entry for clerk', async () => {
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

  // Registering through @clerk/shared/moduleManager is the same channel
  // clerk-js's constructor uses (`setModuleManager(this, this.#moduleManager)`),
  // so a passing test here proves composed UserProfile picks up the
  // bootstrap-registered moduleManager without `<ClerkProvider ui={ui} />`.
  it('resolves a moduleManager registered through @clerk/shared, not just via ClerkUI', async () => {
    const mockImport = vi.fn(() => Promise.resolve(undefined));
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);
    setModuleManagerShared(fixtures.clerk, { import: mockImport } as any);

    function ModuleManagerIdentityProbe() {
      const mm = useModuleManager();
      return (
        <div
          data-testid='mm-identity-probe'
          data-is-mock={String(mm?.import === mockImport)}
        />
      );
    }

    render(
      <UserProfileProvider>
        <ModuleManagerIdentityProbe />
      </UserProfileProvider>,
      { wrapper },
    );

    expect(screen.getByTestId('mm-identity-probe').dataset.isMock).toBe('true');
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
      if (key === 'localization') return expectedLocalization;
      if (key === 'supportEmail') return expectedSupportEmail;
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
});

describe('OrganizationProfileProvider wiring', () => {
  const { createFixtures } = bindCreateFixtures('OrganizationProfile');

  beforeEach(() => {
    clearFetchCache();
  });

  it('provides the moduleManager from the store to children', async () => {
    const mockImport = vi.fn(() => Promise.resolve(undefined));

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
    setModuleManager(fixtures.clerk, { import: mockImport });
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
});
