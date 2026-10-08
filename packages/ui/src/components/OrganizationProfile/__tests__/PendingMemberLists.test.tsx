import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { InvitedMembersList } from '../InvitedMembersList';
import { RequestToJoinList } from '../RequestToJoinList';
import { createFakeOrganizationInvitation, createFakeOrganizationMembershipRequest } from './utils';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

async function setup() {
  const { wrapper: Fixture, fixtures } = await createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
  });
  fixtures.clerk.organization!.getRoles.mockResolvedValue({ data: [], total_count: 0 });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  return { wrapper, fixtures };
}

describe('Pending member list actions', () => {
  it('replaces a revoked invitation through the real organization query', async () => {
    const { wrapper, fixtures } = await setup();
    const invitation = createFakeOrganizationInvitation({
      id: 'inv_1',
      organizationId: fixtures.clerk.organization!.id,
      emailAddress: 'invite@clerk.com',
    });
    invitation.revoke = vi.fn().mockResolvedValue(invitation);
    const query = fixtures.clerk.organization!.getInvitations;
    query.mockResolvedValueOnce({ data: [invitation], total_count: 1 }).mockResolvedValue({ data: [], total_count: 0 });
    const { findByText, getByRole, queryByText } = render(<InvitedMembersList />, { wrapper });
    expect(await findByText('invite@clerk.com')).toBeInTheDocument();
    fireEvent.click(getByRole('button', { name: 'Open menu' }));
    fireEvent.click(await findByText('Revoke invitation'));
    await waitFor(() => expect(queryByText('invite@clerk.com')).not.toBeInTheDocument());
    expect(invitation.revoke).toHaveBeenCalledOnce();
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('disables both request buttons during approval and removes the completed row', async () => {
    const { wrapper, fixtures } = await setup();
    const request = createFakeOrganizationMembershipRequest({
      id: 'req_1',
      organizationId: fixtures.clerk.organization!.id,
      publicUserData: { userId: 'user_2', identifier: 'request@clerk.com' },
    });
    const completion = createDeferredPromise();
    request.accept = vi.fn().mockReturnValue(completion.promise);
    const query = fixtures.clerk.organization!.getMembershipRequests;
    query.mockResolvedValueOnce({ data: [request], total_count: 1 }).mockResolvedValue({ data: [], total_count: 0 });
    const { findByText, getByRole, userEvent, queryByText } = render(<RequestToJoinList />, { wrapper });
    expect(await findByText('request@clerk.com')).toBeInTheDocument();
    await userEvent.click(getByRole('button', { name: 'Approve' }));
    expect(getByRole('button', { name: 'Reject' })).toBeDisabled();
    expect(getByRole('button', { name: 'Loading' })).toBeDisabled();
    act(() => {
      completion.resolve(request);
    });
    await waitFor(() => expect(queryByText('request@clerk.com')).not.toBeInTheDocument());
    expect(request.accept).toHaveBeenCalledOnce();
    expect(request.reject).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledTimes(2);
  });
});
