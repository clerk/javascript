import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useModuleManager } from '@/ui/contexts';
import { useRouter } from '@/ui/router';
import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { clearFetchCache } from '../../hooks';
import { setModuleManager } from '../moduleManagerStore';
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

  afterEach(() => {
    setModuleManager(undefined as any);
  });

  it('provides the stored moduleManager to children', async () => {
    const mockImport = vi.fn(() => Promise.resolve(undefined));
    setModuleManager({ import: mockImport });

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
    setModuleManager(undefined as any);
  });

  it('provides the stored moduleManager to children', async () => {
    const mockImport = vi.fn(() => Promise.resolve(undefined));
    setModuleManager({ import: mockImport });

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
