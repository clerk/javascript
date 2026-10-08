import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import type { OrganizationListMembership, OrganizationListOrganization } from '../organization-list.types';
import { InvitationPreview } from '../UserInvitationList';
import { MembershipPreview } from '../UserMembershipList';
import { SuggestionPreview } from '../UserSuggestionList';

const { createFixtures } = bindCreateFixtures('OrganizationList');

const organization: OrganizationListOrganization = {
  id: 'org_plain',
  name: 'Plain organization',
  slug: 'plain-organization',
  imageUrl: '',
  hasImage: false,
};

const createMembership = (): OrganizationListMembership => ({
  requestKey: 'organization',
  canRun: () => true,
  isLoaded: true,
  organizationPreview: organization,
  selectOrganization: vi.fn().mockResolvedValue(undefined),
  getUnauthorizedError: () => 'Organization unavailable',
});

const createWrapper = () =>
  createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['test@clerk.com'] });
  });

describe('OrganizationList rows with plain data and actions', () => {
  it('selects a membership through its supplied action without fetching an organization', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const membership = createMembership();
    const { getByRole, userEvent } = render(
      <CardStateProvider>
        <MembershipPreview model={membership} />
      </CardStateProvider>,
      { wrapper },
    );

    await userEvent.click(getByRole('button', { name: /Plain organization/i }));

    expect(membership.selectOrganization).toHaveBeenCalledOnce();
    expect(fixtures.clerk.getOrganization).not.toHaveBeenCalled();
  });

  it('permits an invitation retry and renders the returned membership action after acceptance', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const membership = createMembership();
    const accept = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Try again', {
          status: 403,
          data: [{ code: 'organization_not_found_or_unauthorized', message: 'Try again' }],
        }),
      )
      .mockResolvedValueOnce(membership);
    const { getByRole, queryByRole, userEvent } = render(
      <InvitationPreview model={{ organizationData: organization, accept }} />,
      { wrapper },
    );

    await userEvent.click(getByRole('button', { name: 'Join' }));
    await waitFor(() => expect(getByRole('button', { name: 'Join' })).toBeEnabled());
    await userEvent.click(getByRole('button', { name: 'Join' }));
    await waitFor(() => expect(queryByRole('button', { name: 'Join' })).not.toBeInTheDocument());
    await userEvent.click(getByRole('button', { name: /Plain organization/i }));

    expect(accept).toHaveBeenCalledTimes(2);
    expect(membership.selectOrganization).toHaveBeenCalledOnce();
    expect(fixtures.clerk.getOrganization).not.toHaveBeenCalled();
  });

  it('uses the suggestion action and displays its updated accepted state', async () => {
    const { wrapper } = await createWrapper();
    const accept = vi.fn().mockResolvedValue(undefined);
    const model = { organizationData: organization, isAccepted: false, accept };
    const { getByRole, queryByRole, getByText, userEvent, rerender } = render(<SuggestionPreview model={model} />, {
      wrapper,
    });

    await userEvent.click(getByRole('button', { name: 'Request to join' }));
    expect(accept).toHaveBeenCalledOnce();
    rerender(<SuggestionPreview model={{ ...model, isAccepted: true }} />);

    expect(queryByRole('button', { name: 'Request to join' })).not.toBeInTheDocument();
    expect(getByText('Pending approval')).toBeInTheDocument();
  });
  it('starts one suggestion request for two clicks before rendering', async () => {
    const { wrapper } = await createWrapper();
    const deferred = createDeferredPromise<void>();
    const accept = vi.fn(() => deferred.promise);
    const model = { organizationData: organization, isAccepted: false, accept };
    const { getByRole } = render(<SuggestionPreview model={model} />, { wrapper });
    const button = getByRole('button', { name: 'Request to join' });
    act(() => {
      button.click();
      button.click();
    });
    expect(accept).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(button).toBeEnabled();
  });
});
