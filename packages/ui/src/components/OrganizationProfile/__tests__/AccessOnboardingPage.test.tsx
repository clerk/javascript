import { fireEvent } from '@testing-library/react';
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
    expect(await screen.findByText('Access')).toBeInTheDocument();
    unmount();

    props.setProps({ __internal_accessOnboarding: undefined });
    render(<OrganizationProfile />, { wrapper });
    await waitFor(() => expect(screen.getByText('General')).toBeInTheDocument());
    expect(screen.queryByText('Access')).not.toBeInTheDocument();
  });

  it('renders the work-email scenario: the auto-created domain row and the catch-all', async () => {
    const { wrapper } = await createFixtures(withPageFixtures);

    render(<AccessOnboardingPage />, { wrapper });

    await waitFor(() => expect(screen.getByText('acmedev.org')).toBeInTheDocument());
    expect(screen.getByText('Everyone else')).toBeInTheDocument();
    // Both rows start at the application's defaults.
    expect(screen.getAllByText('Invitation')).toHaveLength(2);
    expect(screen.getAllByText('Default')).toHaveLength(2);
  });

  it('adds a domain as a new row at the defaults', async () => {
    const { wrapper } = await createFixtures(withPageFixtures);

    render(<AccessOnboardingPage />, { wrapper });
    await waitFor(() => expect(screen.getByText('acmedev.org')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    const input = await screen.findByPlaceholderText('acme.com');
    fireEvent.change(input, { target: { value: 'example.org' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add domain' }));

    await waitFor(() => expect(screen.getByText('example.org')).toBeInTheDocument());
    expect(screen.getAllByText('Invitation')).toHaveLength(3);
  });
});
