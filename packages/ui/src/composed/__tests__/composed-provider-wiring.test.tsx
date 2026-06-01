import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useModuleManager } from '@/ui/contexts';
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

function ModuleManagerIdentityProbe({ moduleManager }: { moduleManager: unknown }) {
  const mm = useModuleManager();
  return (
    <div
      data-testid='mm-identity-probe'
      data-is-stored={mm === moduleManager}
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

  afterEach(() => {
    setModuleManager(undefined);
  });

  it('provides the stored moduleManager to children', async () => {
    const mockImport = vi.fn(() => Promise.resolve(undefined));
    const storedModuleManager = { import: mockImport };
    setModuleManager(storedModuleManager);

    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);

    render(
      <UserProfileProvider>
        <ModuleManagerIdentityProbe moduleManager={storedModuleManager} />
      </UserProfileProvider>,
      { wrapper },
    );

    const probe = screen.getByTestId('mm-identity-probe');
    expect(probe.dataset.isStored).toBe('true');
  });

  it('does not require Clerk to expose a moduleManager internal', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], first_name: 'Test', last_name: 'User' });
    });
    patchEnvironment(fixtures.clerk, fixtures.environment);
    Object.defineProperty(fixtures.clerk, '__internal_moduleManager', {
      get: () => {
        throw new Error('composed profiles should not read Clerk.__internal_moduleManager');
      },
      configurable: true,
    });

    render(
      <UserProfileProvider>
        <ModuleManagerProbe />
      </UserProfileProvider>,
      { wrapper },
    );

    expect(screen.getByTestId('mm-probe').dataset.hasMm).toBe('true');
  });

  it('falls back to fallback moduleManager when store is empty', async () => {
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
    setModuleManager({ import: vi.fn(() => Promise.resolve(undefined)) });

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

  it('returns null when user is not loaded', async () => {
    setModuleManager({ import: vi.fn(() => Promise.resolve(undefined)) });

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
    setModuleManager({ import: vi.fn(() => Promise.resolve(undefined)) });

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

  it('returns null when environment is missing', async () => {
    setModuleManager({ import: vi.fn(() => Promise.resolve(undefined)) });

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

  afterEach(() => {
    setModuleManager(undefined);
  });

  it('provides the stored moduleManager to children', async () => {
    const mockImport = vi.fn(() => Promise.resolve(undefined));
    const storedModuleManager = { import: mockImport };
    setModuleManager(storedModuleManager);

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
        <ModuleManagerIdentityProbe moduleManager={storedModuleManager} />
      </OrganizationProfileProvider>,
      { wrapper },
    );

    const probe = screen.getByTestId('mm-identity-probe');
    expect(probe.dataset.isStored).toBe('true');
  });

  it('returns null when organization is not loaded', async () => {
    setModuleManager({ import: vi.fn(() => Promise.resolve(undefined)) });

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
