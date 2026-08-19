import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { OrganizationProfile } from '..';
import { AccessOnboardingPage } from '../AccessOnboarding/AccessOnboardingPage';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

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
    expect(await screen.findByText('Access & onboarding')).toBeInTheDocument();
    unmount();

    props.setProps({ __internal_accessOnboarding: undefined });
    render(<OrganizationProfile />, { wrapper });
    await waitFor(() => expect(screen.getByText('General')).toBeInTheDocument());
    expect(screen.queryByText('Access & onboarding')).not.toBeInTheDocument();
  });

  it('renders the seed domain rules with their badges', async () => {
    const { wrapper } = await createFixtures(withPageFixtures);

    render(<AccessOnboardingPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('acme.com')).toBeInTheDocument();
      expect(screen.getByText('contractors.acme.com')).toBeInTheDocument();
    });
    expect(screen.getByText('Join automatically')).toBeInTheDocument();
    expect(screen.getByText('SSO · Okta Workforce')).toBeInTheDocument();
    expect(screen.getByText('Ownership verified')).toBeInTheDocument();
    expect(screen.getByText('Request access')).toBeInTheDocument();
    expect(screen.getByText('Default sign-in')).toBeInTheDocument();
  });

  it('locks ownership-gated enrollment options until ownership is verified', async () => {
    const { wrapper } = await createFixtures(withPageFixtures);

    const { userEvent } = render(<AccessOnboardingPage />, { wrapper });

    await waitFor(() => expect(screen.getByText('contractors.acme.com')).toBeInTheDocument());

    // contractors.acme.com has affiliation but not ownership.
    const menus = await screen.findAllByLabelText(/open menu/i);
    expect(menus.length).toBe(2);
    await userEvent.click(menus[1]);
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Manage access' }));

    const joinAutomatically = await screen.findByRole('radio', { name: /join automatically/i });
    expect(joinAutomatically).toBeDisabled();
    expect(screen.getByRole('radio', { name: /invitation only/i })).toBeEnabled();
    expect(screen.getByText('Verify ownership to enable')).toBeInTheDocument();
  });
});
