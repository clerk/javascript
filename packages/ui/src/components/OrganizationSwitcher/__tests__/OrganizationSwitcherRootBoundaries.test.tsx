import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { OrganizationSwitcher } from '..';

const { createFixtures } = bindCreateFixtures('OrganizationSwitcher');

describe('OrganizationSwitcher root boundaries', () => {
  it('preserves defaultOpen and closes after creating an organization', async () => {
    const { wrapper, props, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], create_organization_enabled: true });
    });
    props.setProps({ defaultOpen: true, hidePersonal: true });
    const { getByRole, queryByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
    expect(getByRole('dialog')).toBeVisible();
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    expect(fixtures.clerk.openCreateOrganization).toHaveBeenCalledOnce();
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
    await userEvent.click(getByRole('button', { name: 'Open organization switcher' }));
    expect(getByRole('dialog')).toBeVisible();
  });

  it('preserves the standalone close callback when creating an organization', async () => {
    const { wrapper, props, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], create_organization_enabled: true });
    });
    const close = vi.fn();
    props.setProps({ __experimental_asStandalone: close });
    const { getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    expect(close).toHaveBeenCalledWith(false);
    expect(fixtures.clerk.openCreateOrganization).toHaveBeenCalledOnce();
  });

  it('loads memberships when the menu opens and keeps notification counts available while closed', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    props.setProps({ hidePersonal: true });
    fixtures.clerk.user?.getOrganizationInvitations.mockResolvedValue({ data: [], total_count: 2 });
    fixtures.clerk.user?.getOrganizationSuggestions.mockResolvedValue({ data: [], total_count: 3 });
    const { getByRole, findByText, userEvent } = render(<OrganizationSwitcher />, { wrapper });
    expect(await findByText('5')).toBeInTheDocument();
    expect(fixtures.clerk.user?.getOrganizationMemberships).not.toHaveBeenCalled();
    await userEvent.click(getByRole('button', { name: 'Open organization switcher' }));
    await waitFor(() => expect(fixtures.clerk.user?.getOrganizationMemberships).toHaveBeenCalledOnce());
  });
});
