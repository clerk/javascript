import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';

import { OrganizationSwitcher } from '..';
import { useOrganizationSwitcherPopoverModel } from '../organization-switcher-popover.model';
import { createFakeUserOrganizationMembership } from './test-utils';

const { createFixtures } = bindCreateFixtures('OrganizationSwitcher');

async function setup() {
  const { wrapper, fixtures, props } = await createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['first@clerk.com'], create_organization_enabled: true });
  });
  const membership = createFakeUserOrganizationMembership({
    id: 'membership_target',
    organization: {
      id: 'org_target',
      name: 'Target organization',
      slug: 'target',
      membersCount: 1,
      pendingInvitationsCount: 0,
      adminDeleteEnabled: false,
      maxAllowedMemberships: 10,
    },
  });
  fixtures.clerk.user?.getOrganizationMemberships.mockResolvedValue({ data: [membership], total_count: 1 });
  props.setProps({ hidePersonal: true });
  const rendered = render(<OrganizationSwitcher />, { wrapper });
  await rendered.userEvent.click(rendered.getByRole('button', { name: 'Open organization switcher' }));
  await rendered.findByText('Target organization');
  return { ...rendered, fixtures, membership };
}

describe('Organization selection ownership', () => {
  it('rejects retained model commands after the menu source unmounts', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['first@clerk.com'], create_organization_enabled: true });
    });
    fixtures.clerk.setActive.mockResolvedValue(undefined);
    const { result, unmount } = renderHook(() => useOrganizationSwitcherPopoverModel(), { wrapper });
    const retained = result.current;
    unmount();
    await retained.selectPersonal();
    await retained.selectOrganization('org_unused');
    retained.createOrganization();
    retained.manageOrganization();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(fixtures.clerk.openCreateOrganization).not.toHaveBeenCalled();
    expect(fixtures.clerk.openOrganizationProfile).not.toHaveBeenCalled();
  });

  it('keeps a new menu and its loading state when an old selection finishes', async () => {
    const { getByRole, getByText, userEvent, fixtures, queryByRole } = await setup();
    const first = createDeferredPromise<void>();
    const second = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    await userEvent.click(getByText('Target organization'));
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(1));
    await userEvent.keyboard('{Escape}');
    await userEvent.click(getByRole('button', { name: 'Open organization switcher' }));
    await userEvent.click(getByText('Target organization'));
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(2));
    await act(async () => {
      first.resolve();
      await first.promise;
    });
    expect(getByRole('dialog')).toBeVisible();
    expect(getByRole('button', { name: 'Create organization' })).toBeDisabled();
    await act(async () => {
      second.resolve();
      await second.promise;
    });
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('rejects a selection when the active account changes before rendering', async () => {
    const { getByText, getByRole, userEvent, fixtures } = await setup();
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_changed' });
    await userEvent.click(getByText('Target organization'));
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(getByRole('dialog')).toBeVisible();
    expect(getByRole('button', { name: 'Create organization' })).not.toBeDisabled();
  });

  it('rejects a selection when the active session changes before rendering', async () => {
    const { getByText, getByRole, userEvent, fixtures } = await setup();
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_changed' });
    await userEvent.click(getByText('Target organization'));
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(getByRole('dialog')).toBeVisible();
  });

  it('rejects a selection when the Clerk client changes before rendering', async () => {
    const { getByText, getByRole, userEvent, fixtures } = await setup();
    fixtures.clerk.setActive.mockResolvedValue(undefined);
    vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({
      ...fixtures.clerk.client,
      id: 'client_changed',
    } as never);
    await userEvent.click(getByText('Target organization'));
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(getByRole('dialog')).toBeVisible();
    expect(getByRole('button', { name: 'Create organization' })).not.toBeDisabled();
  });

  it('uses the displayed organization ID when the resource changes before a click', async () => {
    const { getByText, getByRole, userEvent, fixtures, membership } = await setup();
    membership.organization.id = 'org_replaced';
    await userEvent.click(getByText('Target organization'));
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(getByRole('dialog')).toBeVisible();
  });

  it('starts one selection when clicked twice before rendering', async () => {
    const { getByText, fixtures } = await setup();
    const selection = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValueOnce(selection.promise);
    const button = getByText('Target organization').closest('button')!;
    act(() => {
      button.click();
      button.click();
    });
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
    await act(async () => {
      selection.resolve();
      await selection.promise;
    });
  });
});
