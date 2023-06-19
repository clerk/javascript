import type { MembershipRole } from '@clerk/types';
import { describe } from '@jest/globals';
import React from 'react';

import { render } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { OrganizationSwitcher } from '../OrganizationSwitcher';

const { createFixtures } = bindCreateFixtures('OrganizationSwitcher');

describe('OrganizationSwitcher', () => {
  it('renders component', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.dev'] });
    });
    const { queryByRole } = render(<OrganizationSwitcher />, { wrapper });
    expect(queryByRole('button')).toBeDefined();
  });

  describe('Personal Workspace', () => {
    it('shows the personal workspace when enabled', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.dev'] });
      });
      props.setProps({ hidePersonal: false });
      const { getByText } = render(<OrganizationSwitcher />, { wrapper });
      expect(getByText('Personal Workspace')).toBeDefined();
    });

    it('does not show the personal workspace when disabled', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.dev'] });
      });
      props.setProps({ hidePersonal: true });
      const { queryByText, getByRole, userEvent, getByText } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      expect(queryByText('Personal Workspace')).toBeNull();
      expect(getByText('No organization selected')).toBeDefined();
    });
  });

  describe('OrganizationSwitcherPopover', () => {
    it('opens the organization switcher popover when clicked', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.dev'], create_organization_enabled: true });
      });
      props.setProps({ hidePersonal: true });
      const { getByText, getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      expect(getByText('Create Organization')).toBeDefined();
    });

    it('lists all organizations the user belongs to', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.dev'], organization_memberships: ['Org1', 'Org2'] });
      });
      props.setProps({ hidePersonal: false });
      const { getAllByText, getByText, getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      expect(getAllByText('Org1')).not.toBeNull();
      expect(getByText('Personal Workspace')).toBeDefined();
      expect(getByText('Org2')).toBeDefined();
    });

    it.each([
      ['Admin', 'admin'],
      ['Member', 'basic_member'],
      ['Guest', 'guest_member'],
    ])('shows the text "%s" for the %s role in the active organization', async (text, role) => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: role as MembershipRole }],
        });
      });
      props.setProps({ hidePersonal: true });
      const { getAllByText, getByText, getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      expect(getAllByText('Org1')).not.toBeNull();
      expect(getByText(text)).toBeDefined();
    });

    it('opens organization profile when "Manage Organization" is clicked', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });
      props.setProps({ hidePersonal: true });
      const { getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      await userEvent.click(getByRole('button', { name: 'Manage Organization' }));
      expect(fixtures.clerk.openOrganizationProfile).toHaveBeenCalled();
    });

    it('opens create organization when the respective button is clicked', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
          create_organization_enabled: true,
        });
      });
      props.setProps({ hidePersonal: true });
      const { getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      await userEvent.click(getByRole('button', { name: 'Create Organization' }));
      expect(fixtures.clerk.openCreateOrganization).toHaveBeenCalled();
    });

    it('does not display create organization button if permissions not present', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
          create_organization_enabled: false,
        });
      });
      props.setProps({ hidePersonal: true });
      const { queryByRole } = render(<OrganizationSwitcher />, { wrapper });
      expect(queryByRole('button', { name: 'Create Organization' })).not.toBeInTheDocument();
    });

    it.todo('switches between active organizations when one is clicked');
  });
});
