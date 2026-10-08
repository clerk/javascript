import type { OrganizationJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { type FakeFapiSeed, holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import {
  OrganizationProfileDangerSection,
  type OrganizationProfileDangerSectionProps,
} from '../organization-profile-danger-section/organization-profile-danger-section';

const acme = fapiOrganization({ id: 'org_1', name: 'Acme', members_count: 20 });
const deletePermission = ['org:sys_profile:delete'];

type User = ReturnType<typeof userEvent.setup>;

function signedIn({
  organizations = [acme],
  permissions = deletePermission,
  activeOrganizationId = organizations[0]?.id ?? null,
}: { organizations?: OrganizationJSON[]; permissions?: string[]; activeOrganizationId?: string | null } = {}) {
  const memberships = organizations.map(organization => fapiMembership(organization, { permissions }));
  const alice = fapiUser({ id: 'user_1', first_name: 'Alice', organization_memberships: memberships });
  return {
    environment: fapiEnvironment({ display_config: { after_leave_organization_url: '/after-leave' } }),
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: activeOrganizationId })]),
    memberships,
  } satisfies FakeFapiSeed;
}

async function renderSection(seed: FakeFapiSeed = signedIn(), props: OrganizationProfileDangerSectionProps = {}) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(<OrganizationProfileDangerSection {...props} />);
  return { ...view, fapi };
}

async function openDialog(user: User, action: string) {
  await user.click(await screen.findByRole('button', { name: action }));
  return screen.getByRole('dialog');
}

async function confirm(user: User, dialog: HTMLElement, action: string, name = 'Acme') {
  await user.type(within(dialog).getByRole('textbox'), name);
  await user.click(within(dialog).getByRole('button', { name: action }));
}

const memberOf = (seed: { memberships: { organization: { id: string } }[] }, organizationId: string) =>
  seed.memberships.some(m => m.organization.id === organizationId);

describe('OrganizationProfileDangerSection', () => {
  describe('availability', () => {
    it('renders nothing without an active organization', async () => {
      const { container } = await renderSection(signedIn({ activeOrganizationId: null }));

      expect(container).toBeEmptyDOMElement();
    });

    it('offers leaving and deleting to a member who can delete the organization', async () => {
      await renderSection();

      expect(await screen.findByRole('heading', { name: 'Danger zone' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Leave organization' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Delete organization' })).toBeVisible();
    });

    it('only offers leaving without the delete permission', async () => {
      await renderSection(signedIn({ permissions: [] }));

      expect(await screen.findByRole('button', { name: 'Leave organization' })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Delete organization' })).toBeNull();
    });

    it('only offers leaving when admins may not delete the organization', async () => {
      await renderSection(
        signedIn({ organizations: [fapiOrganization({ id: 'org_1', name: 'Acme', admin_delete_enabled: false })] }),
      );

      expect(await screen.findByRole('button', { name: 'Leave organization' })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Delete organization' })).toBeNull();
    });
  });

  describe('leaving', () => {
    it('leaves once the name is typed, then sends the user to the after-leave url', async () => {
      const { fapi, navigate } = await renderSection();
      const user = userEvent.setup();
      const dialog = await openDialog(user, 'Leave organization');

      await confirm(user, dialog, 'Leave organization', 'Acme Inc');
      expect(memberOf(fapi, 'org_1')).toBe(true);

      await user.clear(within(dialog).getByRole('textbox'));
      await confirm(user, dialog, 'Leave organization');

      await waitFor(() => expect(memberOf(fapi, 'org_1')).toBe(false));
      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/after-leave'));
    });

    it('keeps the dialog open with the Clerk error when leaving fails', async () => {
      const { navigate } = await renderSection();
      const user = userEvent.setup();
      const dialog = await openDialog(user, 'Leave organization');
      const leave = holdRequests('post', '/v1/me/organization_memberships/:organizationId');

      await confirm(user, dialog, 'Leave organization');
      leave.fail(
        'organization_minimum_permissions_needed',
        'There has to be at least one organization member with the minimum required permissions.',
      );

      await waitFor(() =>
        expect(within(dialog).getByRole('textbox')).toHaveAccessibleDescription(
          expect.stringContaining(
            'There has to be at least one organization member with the minimum required permissions.',
          ),
        ),
      );
      expect(screen.getByRole('dialog')).toBeVisible();
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('deleting', () => {
    it('warns how many members are removed', async () => {
      await renderSection();
      const user = userEvent.setup();
      const dialog = await openDialog(user, 'Delete organization');

      expect(dialog).toHaveTextContent(
        'Are you sure you want to delete Acme? This removes 20 members and permanently deletes all organization data.',
      );
    });

    it('names a single member in the warning', async () => {
      await renderSection(signedIn({ organizations: [fapiOrganization({ id: 'org_1', name: 'Acme' })] }));
      const user = userEvent.setup();
      const dialog = await openDialog(user, 'Delete organization');

      expect(dialog).toHaveTextContent('This removes 1 member and permanently deletes all organization data.');
    });

    it('deletes the organization and sends the user to the url the host passed', async () => {
      const { fapi, navigate } = await renderSection(signedIn(), { afterLeaveOrganizationUrl: '/organizations' });
      const user = userEvent.setup();
      const dialog = await openDialog(user, 'Delete organization');

      await confirm(user, dialog, 'Delete organization');

      await waitFor(() => expect(memberOf(fapi, 'org_1')).toBe(false));
      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/organizations'));
    });

    it('holds the dialog open while the delete is in flight', async () => {
      await renderSection();
      const user = userEvent.setup();
      const dialog = await openDialog(user, 'Delete organization');
      const destroy = holdRequests('post', '/v1/organizations/:organizationId');

      await confirm(user, dialog, 'Delete organization');

      await waitFor(() =>
        expect(within(dialog).getByRole('button', { name: 'Delete organization' })).toHaveAttribute(
          'aria-busy',
          'true',
        ),
      );
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      expect(screen.getByRole('dialog')).toBeVisible();

      destroy.release();
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('drops a pending confirmation when the active organization changes', async () => {
      const twin = fapiOrganization({ id: 'org_2', name: 'Acme', members_count: 20 });
      const { clerk, fapi } = await renderSection(signedIn({ organizations: [acme, twin] }));
      const user = userEvent.setup();
      const dialog = await openDialog(user, 'Delete organization');
      await user.type(within(dialog).getByRole('textbox'), 'Acme');

      await act(() => clerk.setActive({ organization: 'org_2' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      const reopened = await openDialog(user, 'Delete organization');
      expect(within(reopened).getByRole('textbox')).toHaveValue('');
      expect(within(reopened).getByRole('button', { name: 'Delete organization' })).not.toHaveAttribute(
        'aria-busy',
        'true',
      );
      expect(memberOf(fapi, 'org_1')).toBe(true);
      expect(memberOf(fapi, 'org_2')).toBe(true);
    });
  });
});
