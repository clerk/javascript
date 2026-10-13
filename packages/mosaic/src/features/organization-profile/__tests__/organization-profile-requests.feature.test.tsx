import type { OrganizationMembershipRequestJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { OrganizationProfileMembersPanel } from '../organization-profile-members-panel';

const organization = fapiOrganization({ id: 'org_requests', name: 'Acme' });
const request: OrganizationMembershipRequestJSON = {
  object: 'organization_membership_request',
  id: 'orgreq_ada',
  organization_id: organization.id,
  status: 'pending',
  public_user_data: {
    user_id: 'user_ada',
    identifier: 'ada@example.com',
    first_name: 'Ada',
    last_name: 'Lovelace',
    image_url: '',
    has_image: false,
  },
  created_at: 1_785_000_000_000,
  updated_at: 1_785_000_000_000,
};

function serve(permissions: string[], domainsEnabled = true) {
  const membership = fapiMembership(organization, { permissions });
  const user = fapiUser({ id: 'user_manager', organization_memberships: [membership] });
  return serveFapi({
    environment: fapiEnvironment({
      organization_settings: { domains: { enabled: domainsEnabled, enrollment_modes: [], default_role: null } },
    }),
    client: fapiClient([fapiSession({ id: 'sess_requests', user, last_active_organization_id: organization.id })]),
    memberships: [membership],
    organizationMembershipRequests: [request],
  });
}

describe('connected organization requests', () => {
  it('shows Requests only when domains and membership management are enabled', async () => {
    serve(['org:sys_memberships:manage']);
    const requests = holdRequests('get', '/v1/organizations/:organizationId/membership_requests');
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    expect(await screen.findByRole('tab', { name: 'Requests' })).toBeVisible();
    await waitFor(() => expect(requests.requests).toHaveLength(1));
    const url = new URL(requests.requests[0]?.url ?? '');
    expect(url.searchParams.get('limit')).toBe('10');
    expect(url.searchParams.getAll('status')).toEqual(['pending']);
    requests.release();
  });

  it.each([
    { permissions: ['org:sys_memberships:read'], domainsEnabled: true },
    { permissions: ['org:sys_memberships:manage'], domainsEnabled: false },
    { permissions: [], domainsEnabled: true },
  ])(
    'does not request a hidden tab for $permissions with domains $domainsEnabled',
    async ({ permissions, domainsEnabled }) => {
      serve(permissions, domainsEnabled);
      const requests = holdRequests('get', '/v1/organizations/:organizationId/membership_requests');
      await renderWithClerk(<OrganizationProfileMembersPanel />);
      expect(screen.queryByRole('tab', { name: 'Requests' })).toBeNull();
      expect(requests.requests).toHaveLength(0);
      requests.release();
    },
  );

  it('accepts a request and refreshes the visible Members list', async () => {
    const fapi = serve(['org:sys_memberships:read', 'org:sys_memberships:manage']);
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.type(await screen.findByRole('searchbox', { name: 'Search members' }), 'ada@example.com');
    await user.click(await screen.findByRole('tab', { name: 'Requests' }));
    expect(await screen.findByText('ada@example.com')).toBeVisible();
    expect(screen.queryByRole('searchbox', { name: 'Search requests' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Requested' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Accept Ada Lovelace' }));
    await waitFor(() => expect(fapi.organizationMembershipRequests[0]?.status).toBe('accepted'));
    expect(await screen.findByText('No pending requests')).toBeVisible();
    await user.click(screen.getByRole('tab', { name: 'Members' }));
    expect(await screen.findByText('ada@example.com')).toBeVisible();
  });

  it('declines a request without fetching Members in manage-only mode', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    const members = holdRequests('get', '/v1/organizations/:organizationId/memberships');
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Requests' }));
    expect(await screen.findByText('ada@example.com')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Decline Ada Lovelace' }));
    await waitFor(() => expect(fapi.organizationMembershipRequests[0]?.status).toBe('rejected'));
    expect(await screen.findByText('No pending requests')).toBeVisible();
    expect(members.requests).toHaveLength(0);
    members.release();
  });

  it('accepts in manage-only mode without requesting Members', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    const members = holdRequests('get', '/v1/organizations/:organizationId/memberships');
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Requests' }));
    await user.click(await screen.findByRole('button', { name: 'Accept Ada Lovelace' }));
    await waitFor(() => expect(fapi.organizationMembershipRequests[0]?.status).toBe('accepted'));
    expect(await screen.findByText('No pending requests')).toBeVisible();
    expect(members.requests).toHaveLength(0);
    members.release();
  });

  it('shows an initial load error and retries', async () => {
    serve(['org:sys_memberships:manage']);
    const initial = holdRequests('get', '/v1/organizations/:organizationId/membership_requests');
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    await waitFor(() => expect(initial.requests).toHaveLength(1));
    initial.fail('network_error', 'Unavailable');
    await userEvent.setup().click(await screen.findByRole('tab', { name: 'Requests' }));
    expect(await screen.findByText('Unable to load requests', {}, { timeout: 12_000 })).toBeVisible();
    serve(['org:sys_memberships:manage']);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('button', { name: 'Accept Ada Lovelace' })).toBeVisible();
  }, 20_000);

  it('locks both decisions while accepting, shows a seat error, and allows retry', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Requests' }));
    const accept = holdRequests('post', '/v1/organizations/:organizationId/membership_requests/:requestId/accept');
    await user.click(await screen.findByRole('button', { name: 'Accept Ada Lovelace' }));
    await waitFor(() => expect(accept.requests).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'Decline Ada Lovelace' })).toBeDisabled();
    accept.fail('organization_membership_quota_exceeded', 'Seat limit reached');
    await waitFor(() =>
      expect(
        screen.getByText('You have reached your limit of organization memberships, including outstanding invitations.'),
      ).toBeVisible(),
    );
    expect(fapi.organizationMembershipRequests[0]?.status).toBe('pending');
    serve(['org:sys_memberships:manage']);
    await user.click(screen.getByRole('button', { name: 'Accept Ada Lovelace' }));
    expect(await screen.findByText('No pending requests')).toBeVisible();
  });

  it('replaces rows with the table error state and retries when refreshing after a decline fails', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    fapi.organizationMembershipRequests.push({
      ...request,
      id: 'orgreq_grace',
      public_user_data: {
        ...request.public_user_data,
        identifier: 'grace@example.com',
        user_id: 'user_grace',
        first_name: 'Grace',
        last_name: 'Hopper',
      },
    });
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Requests' }));
    expect(await screen.findByRole('button', { name: 'Decline Ada Lovelace' })).toBeVisible();
    const refresh = holdRequests('get', '/v1/organizations/:organizationId/membership_requests');
    await user.click(screen.getByRole('button', { name: 'Decline Ada Lovelace' }));
    await waitFor(() => expect(refresh.requests).toHaveLength(1));
    refresh.fail('network_error', 'Unavailable');
    await waitFor(() => expect(screen.getByText('Unable to load requests')).toBeVisible(), { timeout: 12_000 });
    expect(screen.queryByText('Unable to decline this request. Please try again.')).toBeNull();
    expect(screen.queryByText('grace@example.com')).toBeNull();
    const table = within(screen.getByRole('table', { name: 'Requests' }));
    expect(table.getByRole('alert')).toHaveTextContent('Unable to load requests');
    expect(fapi.organizationMembershipRequests[0]?.status).toBe('rejected');
    const retry = serve(['org:sys_memberships:manage']);
    retry.organizationMembershipRequests = fapi.organizationMembershipRequests;
    await user.click(table.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.queryByText('Unable to load requests')).toBeNull());
    expect(screen.getByText('grace@example.com')).toBeVisible();
  }, 20_000);

  it('keeps previous rows while paging and returns after removing the sole row on page two', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    fapi.organizationMembershipRequests = [
      ...Array.from({ length: 10 }, (_, index) => ({
        ...request,
        id: `orgreq_${index}`,
        public_user_data: { ...request.public_user_data, identifier: `user${index}@example.com` },
      })),
      request,
    ];
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Requests' }));
    expect(await screen.findByText('user0@example.com')).toBeVisible();
    const page = holdRequests('get', '/v1/organizations/:organizationId/membership_requests');
    await user.click(screen.getByRole('button', { name: 'Next requests page' }));
    await waitFor(() => expect(page.requests).toHaveLength(1));
    expect(screen.getByText('user0@example.com')).toBeVisible();
    page.release();
    await user.click(await screen.findByRole('button', { name: 'Decline Ada Lovelace' }));
    expect(await screen.findByText('user0@example.com')).toBeVisible();
    expect(screen.queryByText('ada@example.com')).toBeNull();
  });

  it('returns to page one after two concurrent decisions empty page two', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    fapi.organizationMembershipRequests = [
      ...Array.from({ length: 10 }, (_, index) => ({
        ...request,
        id: `orgreq_${index}`,
        public_user_data: { ...request.public_user_data, identifier: `user${index}@example.com` },
      })),
      request,
      {
        ...request,
        id: 'orgreq_grace',
        public_user_data: {
          ...request.public_user_data,
          user_id: 'user_grace',
          identifier: 'grace@example.com',
          first_name: 'Grace',
          last_name: 'Hopper',
        },
      },
    ];
    await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Requests' }));
    await user.click(await screen.findByRole('button', { name: 'Next requests page' }));
    expect(await screen.findByRole('button', { name: 'Decline Ada Lovelace' })).toBeVisible();
    const decline = holdRequests('post', '/v1/organizations/:organizationId/membership_requests/:requestId/reject');
    const accept = holdRequests('post', '/v1/organizations/:organizationId/membership_requests/:requestId/accept');
    await user.click(screen.getByRole('button', { name: 'Decline Ada Lovelace' }));
    await user.click(screen.getByRole('button', { name: 'Accept Grace Hopper' }));
    await waitFor(() => expect(decline.requests).toHaveLength(1));
    await waitFor(() => expect(accept.requests).toHaveLength(1));
    decline.release();
    accept.release();
    await waitFor(() =>
      expect(fapi.organizationMembershipRequests.filter(item => item.status === 'pending')).toHaveLength(10),
    );
    expect(await screen.findByText('user0@example.com')).toBeVisible();
  });

  it('discards a pending decision when the active organization changes', async () => {
    const otherOrganization = fapiOrganization({ id: 'org_other', name: 'Other' });
    const first = fapiMembership(organization, { permissions: ['org:sys_memberships:manage'] });
    const second = fapiMembership(otherOrganization, { permissions: ['org:sys_memberships:manage'] });
    const user = fapiUser({ id: 'user_manager', organization_memberships: [first, second] });
    const fapi = serveFapi({
      environment: fapiEnvironment({
        organization_settings: { domains: { enabled: true, enrollment_modes: [], default_role: null } },
      }),
      client: fapiClient([fapiSession({ id: 'sess_requests', user, last_active_organization_id: organization.id })]),
      memberships: [first, second],
      organizationMembershipRequests: [
        request,
        {
          ...request,
          id: 'orgreq_other',
          organization_id: otherOrganization.id,
          public_user_data: { ...request.public_user_data, identifier: 'other@example.com' },
        },
      ],
    });
    const { clerk } = await renderWithClerk(<OrganizationProfileMembersPanel />);
    const actor = userEvent.setup();
    await actor.click(await screen.findByRole('tab', { name: 'Requests' }));
    const accept = holdRequests('post', '/v1/organizations/:organizationId/membership_requests/:requestId/accept');
    await actor.click(await screen.findByRole('button', { name: 'Accept Ada Lovelace' }));
    await waitFor(() => expect(accept.requests).toHaveLength(1));
    await act(() => clerk.setActive({ organization: otherOrganization.id }));
    await actor.click(await screen.findByRole('tab', { name: 'Requests' }));
    expect(await screen.findByText('other@example.com')).toBeVisible();
    accept.release();
    await waitFor(() => expect(fapi.organizationMembershipRequests[0]?.status).toBe('accepted'));
    expect(screen.getByText('other@example.com')).toBeVisible();
    expect(screen.queryByText('ada@example.com')).toBeNull();
  });

  it('clears a pending row lock when the active session changes', async () => {
    const fapi = serve(['org:sys_memberships:manage']);
    const currentUser = fapi.client.sessions[0]?.user;
    if (!currentUser) {
      throw new Error('Expected a signed-in user');
    }
    fapi.client = fapiClient([
      ...fapi.client.sessions,
      fapiSession({ id: 'sess_other', user: currentUser, last_active_organization_id: organization.id }),
    ]);
    const { clerk } = await renderWithClerk(<OrganizationProfileMembersPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Requests' }));
    const accept = holdRequests('post', '/v1/organizations/:organizationId/membership_requests/:requestId/accept');
    await user.click(await screen.findByRole('button', { name: 'Accept Ada Lovelace' }));
    await waitFor(() => expect(accept.requests).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'Decline Ada Lovelace' })).toBeDisabled();
    await act(() => clerk.setActive({ session: 'sess_other' }));
    await user.click(await screen.findByRole('tab', { name: 'Requests' }));
    expect(await screen.findByRole('button', { name: 'Decline Ada Lovelace' })).toBeEnabled();
    accept.release();
    await waitFor(() => expect(fapi.organizationMembershipRequests[0]?.status).toBe('accepted'));
  });
});
