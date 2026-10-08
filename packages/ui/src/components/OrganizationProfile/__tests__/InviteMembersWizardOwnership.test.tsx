import { createDeferredPromise } from '@clerk/shared/utils';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, waitFor } from '@/test/utils';
import { VirtualRouter } from '@/ui/router';

import { Action } from '../../../elements/Action';
import { InviteMembersModal } from '../../InviteMembers';
import { InviteMembersScreen } from '../InviteMembersScreen';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

async function setup(kind: 'screen' | 'modal') {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['first@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
  });
  fixtures.clerk.organization?.getInvitations.mockResolvedValue({ data: [], total_count: 0 });
  fixtures.clerk.organization?.getRoles.mockResolvedValue({
    total_count: 1,
    data: [{ key: 'member', name: 'member' }],
  });
  fixtures.clerk.organization?.inviteMembers.mockResolvedValue([]);
  const view = () => (
    <StrictMode>
      {kind === 'screen' ? (
        <Action.Root>
          <InviteMembersScreen />
        </Action.Root>
      ) : (
        <VirtualRouter startPath='/inviteMembers'>
          <InviteMembersModal />
        </VirtualRouter>
      )}
    </StrictMode>
  );
  const rendered = render(view(), { wrapper });
  const submit = async () => {
    await rendered.userEvent.type(await rendered.findByTestId('tag-input'), 'new@clerk.com,');
    await waitFor(() => expect(rendered.getByRole('button', { name: 'Send invitations' })).toBeEnabled());
    await rendered.userEvent.click(rendered.getByRole('button', { name: 'Send invitations' }));
  };
  return { ...rendered, fixtures, view, submit };
}

describe.each(['screen', 'modal'] as const)('Invite members %s wizard ownership', kind => {
  it.each(['session', 'client', 'user'] as const)('resets confirmation when the %s changes', async source => {
    const result = await setup(kind);
    await result.submit();
    expect(await result.findByText('Invitations successfully sent')).toBeVisible();
    const original = result.fixtures.clerk[source];
    const changed = {
      ...original,
      id: `${source}_changed`,
      ...(source === 'user' ? { organizationMemberships: result.fixtures.clerk.user?.organizationMemberships } : {}),
    };
    vi.spyOn(result.fixtures.clerk, source, 'get').mockReturnValue(changed as never);
    if (source !== 'client') {
      result.fixtures.clerk.__internal_lastEmittedResources = {
        ...result.fixtures.clerk.__internal_lastEmittedResources!,
        [source]: changed,
      };
    }
    result.rerender(result.view());
    expect(result.queryByText('Invitations successfully sent')).not.toBeInTheDocument();
    expect(await result.findByTestId('tag-input')).toHaveValue('');
    expect(result.getByRole('button', { name: 'Send invitations' })).toBeDisabled();
  });

  it('keeps confirmation through a same-source rerender', async () => {
    const result = await setup(kind);
    await result.submit();
    expect(await result.findByText('Invitations successfully sent')).toBeVisible();
    result.rerender(result.view());
    expect(result.getByText('Invitations successfully sent')).toBeVisible();
  });

  it('ignores an old pending invite after the session changes', async () => {
    const result = await setup(kind);
    const pending = createDeferredPromise<[]>();
    result.fixtures.clerk.organization?.inviteMembers.mockReturnValueOnce(pending.promise);
    await result.submit();
    const session = { ...result.fixtures.clerk.session!, id: 'session_changed' };
    vi.spyOn(result.fixtures.clerk, 'session', 'get').mockReturnValue(session);
    result.fixtures.clerk.__internal_lastEmittedResources = {
      ...result.fixtures.clerk.__internal_lastEmittedResources!,
      session,
    };
    result.rerender(result.view());
    await act(async () => {
      pending.resolve([]);
      await pending.promise;
    });
    expect(result.queryByText('Invitations successfully sent')).not.toBeInTheDocument();
    await result.submit();
    expect(await result.findByText('Invitations successfully sent')).toBeVisible();
    expect(result.fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledTimes(2);
  });
});

it('resets the profile confirmation when the active organization changes', async () => {
  const result = await setup('screen');
  await result.submit();
  expect(await result.findByText('Invitations successfully sent')).toBeVisible();
  const organization = { ...result.fixtures.clerk.organization!, id: 'organization_changed' };
  vi.spyOn(result.fixtures.clerk, 'organization', 'get').mockReturnValue(organization);
  result.fixtures.clerk.__internal_lastEmittedResources = {
    ...result.fixtures.clerk.__internal_lastEmittedResources!,
    organization,
  };
  result.rerender(result.view());
  expect(result.queryByText('Invitations successfully sent')).not.toBeInTheDocument();
  expect(await result.findByTestId('tag-input')).toHaveValue('');
});
