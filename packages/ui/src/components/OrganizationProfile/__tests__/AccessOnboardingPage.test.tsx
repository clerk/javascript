import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { OrganizationProfile } from '..';
import { AccessOnboardingPage } from '../AccessOnboarding/AccessOnboardingPage';
import { useAccessPrototype } from '../AccessOnboarding/prototypeState';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
const { createFixtures: createAddPolicyFixtures } = bindCreateFixtures('OrganizationProfile', {
  router: { queryParams: { policy: 'new' } },
});

const withPageFixtures = (f: Parameters<Parameters<typeof createFixtures>[0]>[0]) => {
  f.withOrganizations();
  f.withUser({
    email_addresses: ['test@clerk.com'],
    organization_memberships: [{ name: 'Org1', permissions: ['org:sys_domains:manage'] }],
  });
};

describe('AccessOnboardingPage', () => {
  it('shows the navbar tab only when __internal_accessOnboarding is set', async () => {
    const { wrapper, props } = await createFixtures(withPageFixtures);

    props.setProps({ __internal_accessOnboarding: true });
    const { unmount } = render(<OrganizationProfile />, { wrapper });
    expect(await screen.findByText('Access')).toBeInTheDocument();
    unmount();

    props.setProps({ __internal_accessOnboarding: undefined });
    render(<OrganizationProfile />, { wrapper });
    await waitFor(() => expect(screen.getByText('General')).toBeInTheDocument());
    expect(screen.queryByText('Access')).not.toBeInTheDocument();
  });

  it('starts with the catch-all alone: everyone, invitation only, default sign-in', async () => {
    const { wrapper } = await createFixtures(withPageFixtures);

    render(<AccessOnboardingPage />, { wrapper });

    await waitFor(() => expect(screen.getByText('Everyone')).toBeInTheDocument());
    expect(screen.getByText('Invitation only')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add policy' })).toBeInTheDocument();
  });

  it('adds a policy for the member’s own domain and activates it', async () => {
    const { wrapper: formWrapper } = await createAddPolicyFixtures(withPageFixtures);
    const form = render(<AccessOnboardingPage />, { wrapper: formWrapper });

    expect(await screen.findByText('Add policy')).toBeInTheDocument();
    expect(screen.getByText('acmedev.org')).toBeInTheDocument();
    expect(screen.getByText('Domain association verified')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Activate policy' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Activate policy' })).toBeDisabled());
    form.unmount();

    const { wrapper } = await createFixtures(withPageFixtures);
    render(<AccessOnboardingPage />, { wrapper });
    await waitFor(() => expect(screen.getByText('Everyone else')).toBeInTheDocument());
    expect(screen.getByText('acmedev.org')).toBeInTheDocument();
  });

  it.each([
    [{ tab: 'connections' }, 'Okta Directory'],
    [{ policy: 'pol_acmedev_org' }, 'Manage policy'],
    [{ policy: 'pol_catch_all' }, 'Manage default'],
    [{ setup: 'sso', policy: 'pol_acmedev_org' }, 'Configure your identity provider'],
    [{ setup: 'directory', policy: 'pol_acmedev_org' }, 'SCIM endpoint URL'],
    [{ connection: 'con_okta_engineering' }, 'Manage SSO connection'],
    [{ connection: 'dir_okta' }, 'Manage Directory Sync'],
  ])('renders the configured org at %o', async (queryParams, text) => {
    const { createFixtures: createViewFixtures } = bindCreateFixtures('OrganizationProfile', {
      router: { queryParams },
    });
    const { wrapper } = await createViewFixtures(withPageFixtures);
    const Configured = () => {
      const { scenario, setScenario } = useAccessPrototype();
      if (scenario !== 'configured') {
        setScenario('configured');
        return null;
      }
      return <AccessOnboardingPage />;
    };

    render(<Configured />, { wrapper });

    expect(await screen.findByText(text)).toBeInTheDocument();
  });

  it('adds and removes people who can bypass SSO on a connection', async () => {
    const { createFixtures: createViewFixtures } = bindCreateFixtures('OrganizationProfile', {
      router: { queryParams: { connection: 'con_okta_engineering' } },
    });
    const { wrapper } = await createViewFixtures(withPageFixtures);
    const Configured = () => {
      const { scenario, setScenario } = useAccessPrototype();
      if (scenario !== 'configured') {
        setScenario('configured');
        return null;
      }
      return <AccessOnboardingPage />;
    };

    render(<Configured />, { wrapper });

    expect(await screen.findByText('it-admin@acmedev.org')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'ops@acmedev.org' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(await screen.findByText('ops@acmedev.org')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove it-admin@acmedev.org' }));
    await waitFor(() => expect(screen.queryByText('it-admin@acmedev.org')).not.toBeInTheDocument());
  });
});
