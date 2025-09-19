import type { OrganizationResource } from '@clerk/types';
import { describe, expect, it, vi } from 'vitest';

import { render } from '../../../../vitestUtils';
import { bindCreateFixtures } from '../../../utils/vitest/createFixtures';
import { ProfileForm } from '../ProfileForm';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('OrganizationProfileScreen', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
    });

    const { getByDisplayValue } = render(
      <ProfileForm
        onSuccess={vi.fn()}
        onReset={vi.fn()}
      />,
      { wrapper },
    );
    expect(getByDisplayValue('Org1')).toBeDefined();
  });

  it('enables the continue button if the name changes value', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', slug: '', role: 'admin' }],
      });
    });

    const { getByLabelText, userEvent, getByRole } = render(
      <ProfileForm
        onSuccess={vi.fn()}
        onReset={vi.fn()}
      />,
      { wrapper },
    );
    expect(getByRole('button', { name: /save/i })).toBeDisabled();
    await userEvent.type(getByLabelText(/^name/i), 'another name');
    expect(getByRole('button', { name: /save/i })).not.toBeDisabled();
  });

  it('updates organization name on clicking continue', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', slug: '', role: 'admin' }],
      });
    });

    fixtures.clerk.organization?.update.mockResolvedValue({} as OrganizationResource);
    const { getByDisplayValue, getByLabelText, userEvent, getByRole } = render(
      <ProfileForm
        onSuccess={vi.fn()}
        onReset={vi.fn()}
      />,
      { wrapper },
    );
    await userEvent.type(getByLabelText(/^name/i), '234');
    expect(getByDisplayValue('Org1234')).toBeDefined();
    await userEvent.click(getByRole('button', { name: /save/i }));
    expect(fixtures.clerk.organization?.update).toHaveBeenCalledWith({ name: 'Org1234', slug: '' });
  });

  it('updates organization slug on clicking continue', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', slug: '', role: 'admin' }],
      });
    });

    fixtures.clerk.organization?.update.mockResolvedValue({} as OrganizationResource);
    const { getByDisplayValue, getByLabelText, userEvent, getByRole } = render(
      <ProfileForm
        onSuccess={vi.fn()}
        onReset={vi.fn()}
      />,
      { wrapper },
    );
    await userEvent.type(getByLabelText(/^slug$/i), 'my-org');
    expect(getByDisplayValue('my-org')).toBeDefined();
    await userEvent.click(getByRole('button', { name: /save$/i }));
    expect(fixtures.clerk.organization?.update).toHaveBeenCalledWith({ name: 'Org1', slug: 'my-org' });
  });
});
