import type { OrganizationResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import React from 'react';

import { render } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { ProfileSettingsPage } from '../ProfileSettingsPage';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('ProfileSettingsPage', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
    });

    const { getByDisplayValue } = render(<ProfileSettingsPage />, { wrapper });
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

    const { getByLabelText, userEvent, getByRole } = render(<ProfileSettingsPage />, { wrapper });
    expect(getByRole('button', { name: 'Continue' })).toBeDisabled();
    await userEvent.type(getByLabelText('Organization name'), '2');
    expect(getByRole('button', { name: 'Continue' })).not.toBeDisabled();
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
    const { getByDisplayValue, getByLabelText, userEvent, getByRole } = render(<ProfileSettingsPage />, { wrapper });
    await userEvent.type(getByLabelText('Organization name'), '234');
    expect(getByDisplayValue('Org1234')).toBeDefined();
    await userEvent.click(getByRole('button', { name: 'Continue' }));
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
    const { getByDisplayValue, getByLabelText, userEvent, getByRole } = render(<ProfileSettingsPage />, { wrapper });
    await userEvent.type(getByLabelText('Slug URL'), 'my-org');
    expect(getByDisplayValue('my-org')).toBeDefined();
    await userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(fixtures.clerk.organization?.update).toHaveBeenCalledWith({ name: 'Org1', slug: 'my-org' });
  });

  it('opens file drop area to update organization logo on clicking "Upload image"', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', slug: '', role: 'admin' }],
      });
    });

    const { userEvent, getByRole } = render(<ProfileSettingsPage />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Upload image' }));
    expect(getByRole('button', { name: 'Select file' })).toBeDefined();
  });
});
