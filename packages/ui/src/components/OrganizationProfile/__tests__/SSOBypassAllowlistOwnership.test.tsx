import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearFetchCache } from '@/hooks/useFetch';
import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, waitFor } from '@/test/utils';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { useSSOBypassAllowlistController } from '../sso-bypass-allowlist.controller';
import { useSSOBypassAddMemberFormModel, useSSOBypassAllowlistModel } from '../sso-bypass-allowlist.model';
import { SSOBypassAllowlistPage } from '../SSOBypassAllowlistPage';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
const failure = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
  });
const member = (userId: string, email: string) => ({ publicUserData: { userId, identifier: email } });
async function setup() {
  const result = await createFixtures(f => {
    f.withEnterpriseSso({ selfServeSSO: true });
    f.withOrganizations();
    f.withUser({
      email_addresses: ['test@clerk.com'],
      organization_memberships: [
        {
          name: 'Org1',
          self_serve_sso_enabled: true,
          permissions: ['org:sys_entconns_sso_bypass:manage', 'org:sys_memberships:read'],
        },
      ],
    });
  });
  result.fixtures.clerk.organization!.ssoBypassAllowlist.getUsers.mockResolvedValue([]);
  result.fixtures.clerk.organization!.getRoles.mockResolvedValue({
    data: [{ id: 'role_admin', key: 'org:admin', name: 'Admin' }],
    total_count: 1,
  });
  return result;
}
function useConnectedForm() {
  const page = useSSOBypassAllowlistModel();
  const form = useSSOBypassAddMemberFormModel({
    ...page,
    allowlistedUserIds: new Set<string>(),
    onReset: vi.fn(),
    onResult: vi.fn(),
  });
  return { page, form };
}
async function openForm(view: ReturnType<typeof render>) {
  await view.userEvent.click(view.getByRole('button', { name: 'Add' }));
  return view.findByLabelText('Email address');
}
beforeEach(() => {
  clearFetchCache();
});

describe('SSO bypass request ownership', () => {
  it('keeps one email submission pending through lookup and mutation', async () => {
    const { wrapper, fixtures } = await setup();
    const lookup = createDeferredPromise<unknown>();
    const addition = createDeferredPromise<unknown>();
    const organization = fixtures.clerk.organization!;
    organization.getMemberships.mockReturnValueOnce(lookup.promise);
    organization.ssoBypassAllowlist.addUser.mockReturnValueOnce(addition.promise);
    const view = render(<SSOBypassAllowlistPage onBack={vi.fn()} />, { wrapper });
    const email = await openForm(view);
    fireEvent.change(email, { target: { value: 'member@clerk.com' } });
    const button = view.getByRole('button', { name: 'Add members' });
    const form = email.closest('form')!;
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    await waitFor(() => expect(organization.getMemberships).toHaveBeenCalledOnce());
    expect(button).toBeDisabled();
    expect(email).toBeDisabled();
    await view.userEvent.click(view.getByRole('radio', { name: 'Role' }));
    expect(view.getByRole('radio', { name: 'Email' })).toBeChecked();
    await act(async () => {
      lookup.resolve({ data: [member('user_member', 'member@clerk.com')], total_count: 1 });
      await lookup.promise;
    });
    await waitFor(() => expect(organization.ssoBypassAllowlist.addUser).toHaveBeenCalledOnce());
    expect(button).toBeDisabled();
    fireEvent.submit(form);
    expect(organization.getMemberships).toHaveBeenCalledOnce();
    await act(async () => {
      addition.resolve({});
      await addition.promise;
    });
    expect(await view.findByText('Added member successfully')).toBeVisible();
  });

  it.each(['organization', 'actor', 'session', 'client', 'permission', 'unmount', 'caller'] as const)(
    'stops email pagination after losing its %s',
    async loss => {
      const { wrapper, fixtures } = await setup();
      const organization = fixtures.clerk.organization!;
      const lookup = createDeferredPromise<unknown>();
      organization.getMemberships.mockReturnValueOnce(lookup.promise);
      const { result, unmount } = renderHook(useConnectedForm, { wrapper });
      let active = true;
      const request = result.current.form.findMemberByEmail('member@clerk.com', () => active);
      if (loss === 'unmount') {
        unmount();
      } else if (loss === 'caller') {
        active = false;
      } else if (loss === 'permission') {
        vi.spyOn(fixtures.clerk.session!, 'checkAuthorization').mockReturnValue(false);
      } else if (loss === 'organization') {
        vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue({ ...organization, id: 'org_other' });
      } else if (loss === 'actor') {
        vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_other' });
      } else if (loss === 'session') {
        vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_other' });
      } else {
        vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({ ...fixtures.clerk.client, id: 'client_other' });
      }
      await act(async () => {
        lookup.resolve({ data: [member('near', 'near@clerk.com')], total_count: 2 });
        await request;
      });
      expect(organization.getMemberships).toHaveBeenCalledOnce();
      expect(organization.ssoBypassAllowlist.addUser).not.toHaveBeenCalled();
    },
  );

  it('stops role pagination when the caller closes', async () => {
    const { wrapper, fixtures } = await setup();
    const organization = fixtures.clerk.organization!;
    const page = createDeferredPromise<unknown>();
    organization.getMemberships.mockReturnValueOnce(page.promise);
    const { result } = renderHook(useConnectedForm, { wrapper });
    let active = true;
    const request = result.current.form.collectUserIdsByRole('org:admin', () => active);
    active = false;
    await act(async () => {
      page.resolve({ data: [member('user_member', 'member@clerk.com')], total_count: 2 });
      await request;
    });
    expect(organization.getMemberships).toHaveBeenCalledOnce();
    expect(organization.ssoBypassAllowlist.addUsers).not.toHaveBeenCalled();
  });

  it.each(['addUser', 'addUsers', 'removeUser'] as const)(
    'does not refresh a replacement source after %s completes',
    async action => {
      const { wrapper, fixtures } = await setup();
      const organization = fixtures.clerk.organization!;
      const pending = createDeferredPromise<unknown>();
      organization.ssoBypassAllowlist[action].mockReturnValueOnce(pending.promise);
      const { result } = renderHook(useSSOBypassAllowlistModel, { wrapper });
      await waitFor(() => expect(organization.ssoBypassAllowlist.getUsers).toHaveBeenCalledOnce());
      const request =
        action === 'addUser'
          ? result.current.addUser({ userId: 'user_member' })
          : action === 'addUsers'
            ? result.current.addUsers({ userIds: ['user_member'] })
            : result.current.removeUser('user_member');
      vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue({ ...organization, id: 'org_other' });
      await act(async () => {
        pending.resolve({ data: [], errors: [] });
        await request;
      });
      expect(organization.ssoBypassAllowlist.getUsers).toHaveBeenCalledOnce();
    },
  );

  it.each(['success', 'failure'] as const)('keeps the replacement form pending after an old %s', async outcome => {
    const { wrapper, fixtures } = await setup();
    const first = createDeferredPromise<unknown>();
    const second = createDeferredPromise<unknown>();
    const organization = fixtures.clerk.organization!;
    organization.getMemberships.mockResolvedValue({
      data: [member('user_member', 'member@clerk.com')],
      total_count: 1,
    });
    organization.ssoBypassAllowlist.addUser.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const view = render(<SSOBypassAllowlistPage onBack={vi.fn()} />, { wrapper });
    let email = await openForm(view);
    fireEvent.change(email, { target: { value: 'member@clerk.com' } });
    fireEvent.submit(email.closest('form')!);
    await waitFor(() => expect(organization.ssoBypassAllowlist.addUser).toHaveBeenCalledOnce());
    const session = { ...fixtures.clerk.session!, id: 'session_other' };
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(session);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, session };
    view.rerender(<SSOBypassAllowlistPage onBack={vi.fn()} />);
    expect(view.queryByLabelText('Email address')).not.toBeInTheDocument();
    expect(view.getByRole('searchbox')).toHaveValue('');
    email = await openForm(view);
    expect(email).toHaveValue('');
    fireEvent.change(email, { target: { value: 'member@clerk.com' } });
    const button = view.getByRole('button', { name: 'Add members' });
    fireEvent.submit(email.closest('form')!);
    await waitFor(() => expect(organization.ssoBypassAllowlist.addUser).toHaveBeenCalledTimes(2));
    await act(async () => {
      if (outcome === 'success') {
        first.resolve({});
      } else {
        first.reject(failure());
      }
      await first.promise.catch(() => {});
    });
    expect(button).toBeDisabled();
    expect(view.queryByText('Please try again')).not.toBeInTheDocument();
    expect(view.queryByText('Added member successfully')).not.toBeInTheDocument();
    await act(async () => {
      second.resolve({});
      await second.promise;
    });
    expect(await view.findByText('Added member successfully')).toBeVisible();
  });

  it('reports a live failure and allows a retry', async () => {
    const { wrapper, fixtures } = await setup();
    const organization = fixtures.clerk.organization!;
    organization.getMemberships.mockResolvedValue({
      data: [member('user_member', 'member@clerk.com')],
      total_count: 1,
    });
    organization.ssoBypassAllowlist.addUser.mockRejectedValueOnce(failure()).mockResolvedValueOnce({});
    const view = render(<SSOBypassAllowlistPage onBack={vi.fn()} />, { wrapper });
    const email = await openForm(view);
    fireEvent.change(email, { target: { value: 'member@clerk.com' } });
    fireEvent.submit(email.closest('form')!);
    expect(await view.findByText('Please try again')).toBeVisible();
    expect(email).toBeEnabled();
    fireEvent.submit(email.closest('form')!);
    expect(await view.findByText('Added member successfully')).toBeVisible();
    expect(organization.ssoBypassAllowlist.addUser).toHaveBeenCalledTimes(2);
  });

  it.each([false, true])('cancels queued dispatch on immediate unmount (Strict Mode: %s)', async strict => {
    const { wrapper, fixtures } = await setup();
    const component = <SSOBypassAllowlistPage onBack={vi.fn()} />;
    const view = render(strict ? <StrictMode>{component}</StrictMode> : component, { wrapper });
    const email = await openForm(view);
    fireEvent.change(email, { target: { value: 'member@clerk.com' } });
    act(() => {
      fireEvent.submit(email.closest('form')!);
      view.unmount();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(fixtures.clerk.organization!.getMemberships).not.toHaveBeenCalled();
  });

  it('does not revive callbacks when an account changes and returns', async () => {
    const { wrapper, fixtures } = await setup();
    const { result, rerender } = renderHook(useSSOBypassAllowlistModel, { wrapper });
    const old = result.current;
    const session = fixtures.clerk.session!;
    const getSession = vi.spyOn(fixtures.clerk, 'session', 'get');
    getSession.mockReturnValue({ ...session, id: 'session_other' });
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      session: fixtures.clerk.session,
    };
    rerender();
    getSession.mockReturnValue(session);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources, session };
    rerender();
    expect(result.current.scopeKey).not.toBe(old.scopeKey);
    await old.addUser({ userId: 'user_member' });
    expect(fixtures.clerk.organization!.ssoBypassAllowlist.addUser).not.toHaveBeenCalled();
  });

  it('shares removal ownership and permits a retry after failure', async () => {
    const { wrapper, fixtures } = await setup();
    const organization = fixtures.clerk.organization!;
    organization.ssoBypassAllowlist.getUsers.mockResolvedValue([
      {
        userId: 'user_member',
        publicUserData: { firstName: 'Member', lastName: 'One', identifier: 'member@clerk.com', imageUrl: '' },
      },
    ]);
    const pending = createDeferredPromise<unknown>();
    organization.ssoBypassAllowlist.removeUser.mockReturnValueOnce(pending.promise).mockResolvedValueOnce({});
    const Card = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
    const { result } = renderHook(() => useSSOBypassAllowlistController(useSSOBypassAllowlistModel()), {
      wrapper: ({ children }) => wrapper({ children: <Card>{children}</Card> }),
    });
    await waitFor(() => expect(result.current.entries).toHaveLength(1));
    act(() => {
      result.current.entries[0].onRemove();
      result.current.entries[0].onRemove();
    });
    await waitFor(() => expect(organization.ssoBypassAllowlist.removeUser).toHaveBeenCalledOnce());
    expect(result.current.entries[0].isLoading).toBe(true);
    await act(async () => {
      pending.reject(failure());
      await pending.promise.catch(() => {});
    });
    await waitFor(() => expect(result.current.cardError).toContain('Please try again'));
    expect(result.current.entries[0].isLoading).toBe(false);
    act(() => {
      result.current.entries[0].onRemove();
    });
    await waitFor(() => expect(organization.ssoBypassAllowlist.removeUser).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.entries[0].isLoading).toBe(false));
  });

  it('blocks all form commands after that form closes', async () => {
    const { wrapper, fixtures } = await setup();
    const page = renderHook(useSSOBypassAllowlistModel, { wrapper });
    const { result, unmount } = renderHook(
      () =>
        useSSOBypassAddMemberFormModel({
          ...page.result.current,
          allowlistedUserIds: new Set<string>(),
          onReset: vi.fn(),
          onResult: vi.fn(),
        }),
      { wrapper },
    );
    const form = result.current;
    unmount();
    expect(page.result.current.canRun()).toBe(true);
    await form.addUser({ userId: 'user_member' });
    await form.addUsers({ userIds: ['user_member'] });
    await form.findMemberByEmail('member@clerk.com');
    await form.collectUserIdsByRole('org:admin');
    const organization = fixtures.clerk.organization!;
    expect(organization.ssoBypassAllowlist.addUser).not.toHaveBeenCalled();
    expect(organization.ssoBypassAllowlist.addUsers).not.toHaveBeenCalled();
    expect(organization.getMemberships).not.toHaveBeenCalled();
  });

  it('does not refresh or return success when a child form closes during mutation', async () => {
    const { wrapper, fixtures } = await setup();
    const organization = fixtures.clerk.organization!;
    const pending = createDeferredPromise<unknown>();
    organization.ssoBypassAllowlist.addUser.mockReturnValueOnce(pending.promise);
    const page = renderHook(useSSOBypassAllowlistModel, { wrapper });
    const form = renderHook(
      () =>
        useSSOBypassAddMemberFormModel({
          ...page.result.current,
          allowlistedUserIds: new Set<string>(),
          onReset: vi.fn(),
          onResult: vi.fn(),
        }),
      { wrapper },
    );
    await waitFor(() => expect(organization.ssoBypassAllowlist.getUsers).toHaveBeenCalledOnce());
    const request = form.result.current.addUser({ userId: 'user_member' });
    form.unmount();
    let success: boolean | undefined;
    await act(async () => {
      pending.resolve({});
      success = await request;
    });
    expect(success).toBe(false);
    expect(page.result.current.canRun()).toBe(true);
    expect(organization.ssoBypassAllowlist.getUsers).toHaveBeenCalledOnce();
  });

  it('returns a copied bulk result without the returned user resources', async () => {
    const { wrapper, fixtures } = await setup();
    const response = {
      data: [{ userId: 'user_member', resourceMethod: vi.fn() }],
      errors: [{ code: 'resource_not_found', userId: 'user_missing' }],
    };
    fixtures.clerk.organization!.ssoBypassAllowlist.addUsers.mockResolvedValue(response);
    const { result } = renderHook(useSSOBypassAllowlistModel, { wrapper });
    let snapshot: Awaited<ReturnType<typeof result.current.addUsers>>;
    await act(async () => {
      snapshot = await result.current.addUsers({ userIds: ['user_member', 'user_missing'] });
    });
    response.data.length = 0;
    response.errors[0].code = 'changed';
    expect(snapshot).toEqual({ added: 1, errors: [{ code: 'resource_not_found' }] });
  });

  it('blocks role reads after membership permission is removed while bypass management remains allowed', async () => {
    const { wrapper, fixtures } = await setup();
    const { result } = renderHook(useConnectedForm, { wrapper });
    await waitFor(() => expect(result.current.form.roles).toHaveLength(1));
    vi.spyOn(fixtures.clerk.session!, 'checkAuthorization').mockImplementation(
      params => params.permission === 'org:sys_entconns_sso_bypass:manage',
    );
    expect(result.current.page.canRun()).toBe(true);
    await result.current.form.getRoleCounts();
    await result.current.form.collectUserIdsByRole('org:admin');
    expect(fixtures.clerk.organization!.getMemberships).not.toHaveBeenCalled();
  });
});
