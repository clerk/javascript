import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, waitFor } from '@/test/utils';

import { useInviteMembersFormModel } from '../invite-members-form.model';
import { InviteMembersForm } from '../InviteMembersForm';

const billing = vi.hoisted(() => ({ select: vi.fn(), subscription: vi.fn() }));
vi.mock('@/contexts', async importOriginal => ({
  ...(await importOriginal<typeof import('@/contexts')>()),
  usePlansContext: () => ({ handleSelectPlan: billing.select }),
  useSubscription: () => billing.subscription(),
}));
const { createFixtures } = bindCreateFixtures('OrganizationProfile');
const params = { emailAddresses: ['new@clerk.com'], role: 'member' };
const plan = { id: 'plan_first', availablePrices: [{ id: 'price_first' }] };
const insufficientSeats = () =>
  new ClerkAPIResponseError('Seats required', {
    status: 400,
    data: [{ code: 'insufficient_seats', message: 'Seats required', meta: { seats_quantity: 3 } }],
  });

beforeEach(() => {
  billing.select.mockReset();
  const item = { status: 'active', plan, priceId: 'price_first', planPeriod: 'month' };
  billing.subscription.mockReturnValue({ data: { subscriptionItems: [item] }, subscriptionItems: [item] });
});

async function setup() {
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
  fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [plan], total_count: 1 });
  const success = vi.fn();
  const view = () => (
    <StrictMode>
      <InviteMembersForm onSuccess={success} />
    </StrictMode>
  );
  const rendered = render(view(), { wrapper });
  const fill = async () => {
    await rendered.userEvent.type(rendered.getByTestId('tag-input'), 'new@clerk.com,');
    await waitFor(() => expect(rendered.getByRole('button', { name: 'Send invitations' })).toBeEnabled());
  };
  const submit = async () => {
    await fill();
    await rendered.userEvent.click(rendered.getByRole('button', { name: 'Send invitations' }));
  };
  return { ...rendered, wrapper, fixtures, success, view, fill, submit };
}

function changeSource(
  fixtures: Awaited<ReturnType<typeof setup>>['fixtures'],
  kind: 'account' | 'session' | 'client' | 'organization',
) {
  const resource = fixtures.clerk[kind === 'account' ? 'user' : kind];
  const name = kind === 'account' ? 'user' : kind;
  vi.spyOn(fixtures.clerk, name, 'get').mockReturnValue({ ...resource, id: `${kind}_changed` } as never);
}

describe('Invite members request ownership', () => {
  it.each(['account', 'session', 'client', 'organization'] as const)(
    'ignores an invite failure after a pending %s change',
    async kind => {
      const view = await setup();
      const resource = view.fixtures.clerk.organization!;
      const deferred = createDeferredPromise<[]>();
      resource.inviteMembers.mockReturnValueOnce(deferred.promise);
      await view.submit();
      changeSource(view.fixtures, kind);
      await act(async () => {
        deferred.reject(insufficientSeats());
        await deferred.promise.catch(() => {});
      });
      expect(view.fixtures.clerk.billing.getPlans).not.toHaveBeenCalled();
      expect(billing.select).not.toHaveBeenCalled();
      expect(view.success).not.toHaveBeenCalled();
    },
  );

  it('does not open sandbox checkout after the caller loses ownership', async () => {
    const view = await setup();
    const hook = renderHook(() => useInviteMembersFormModel(), { wrapper: view.wrapper });
    const deferred = createDeferredPromise<{ data: (typeof plan)[]; total_count: number }>();
    view.fixtures.clerk.billing.getPlans.mockReturnValueOnce(deferred.promise);
    let active = true;
    const pending = hook.result.current.openSandboxCheckout(params, null, () => active);
    active = false;
    deferred.resolve({ data: [plan], total_count: 1 });
    await pending;
    expect(view.fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
  });

  it('clears old input when the session changes and returns', async () => {
    const view = await setup();
    await view.fill();
    const session = view.fixtures.clerk.session;
    const changed = { ...session!, id: 'session_changed' };
    const getter = vi.spyOn(view.fixtures.clerk, 'session', 'get').mockReturnValue(changed);
    view.fixtures.clerk.__internal_lastEmittedResources = {
      ...view.fixtures.clerk.__internal_lastEmittedResources!,
      session: changed,
    };
    view.rerender(view.view());
    expect(view.getByRole('button', { name: 'Send invitations' })).toBeDisabled();
    getter.mockReturnValue(session);
    view.fixtures.clerk.__internal_lastEmittedResources = {
      ...view.fixtures.clerk.__internal_lastEmittedResources,
      session,
    };
    view.rerender(view.view());
    expect(view.getByRole('button', { name: 'Send invitations' })).toBeDisabled();
    expect(view.getByTestId('tag-input')).toHaveValue('');
  });

  it('submits once through a same-source rerender and duplicate events', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<[]>();
    view.fixtures.clerk.organization?.inviteMembers.mockReturnValueOnce(deferred.promise);
    await view.fill();
    const form = view.container.querySelector('form')!;
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    await waitFor(() => expect(view.fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledOnce());
    view.rerender(view.view());
    fireEvent.submit(form);
    expect(view.fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve([]);
      await deferred.promise;
    });
    await waitFor(() => expect(view.success).toHaveBeenCalledOnce());
  });

  it.each(['account', 'session', 'client', 'organization'] as const)(
    'rejects retained model commands after a %s change',
    async kind => {
      const view = await setup();
      const hook = renderHook(() => useInviteMembersFormModel(view.success), { wrapper: view.wrapper });
      const model = hook.result.current;
      changeSource(view.fixtures, kind);
      await model.inviteMembers(params);
      await model.openSandboxCheckout(params, null);
      await model.openSeatCheckout(3, null, vi.fn());
      expect(view.fixtures.clerk.organization?.inviteMembers).not.toHaveBeenCalled();
      expect(view.fixtures.clerk.billing.getPlans).not.toHaveBeenCalled();
      expect(view.success).not.toHaveBeenCalled();
    },
  );

  it('does not revalidate invitations or report success after the form closes', async () => {
    const view = await setup();
    const organization = view.fixtures.clerk.organization!;
    const deferred = createDeferredPromise<[]>();
    organization.inviteMembers.mockReturnValueOnce(deferred.promise);
    await view.submit();
    const calls = organization.getInvitations.mock.calls.length;
    view.unmount();
    await act(async () => {
      deferred.resolve([]);
      await deferred.promise;
    });
    expect(organization.getInvitations).toHaveBeenCalledTimes(calls);
    expect(view.success).not.toHaveBeenCalled();
  });

  it('stops a plan lookup from opening checkout after the form closes', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<{ data: (typeof plan)[]; total_count: number }>();
    view.fixtures.clerk.organization?.inviteMembers.mockRejectedValueOnce(insufficientSeats());
    view.fixtures.clerk.billing.getPlans.mockReturnValueOnce(deferred.promise);
    await view.submit();
    await waitFor(() => expect(view.fixtures.clerk.billing.getPlans).toHaveBeenCalledOnce());
    view.unmount();
    await act(async () => {
      deferred.resolve({ data: [plan], total_count: 1 });
      await deferred.promise;
    });
    expect(billing.select).not.toHaveBeenCalled();
  });

  it('retries the original invitation once after checkout completes', async () => {
    const view = await setup();
    view.fixtures.clerk.organization?.inviteMembers.mockRejectedValueOnce(insufficientSeats());
    await view.submit();
    await waitFor(() => expect(billing.select).toHaveBeenCalledOnce());
    await waitFor(() => expect(view.getByRole('button', { name: 'Send invitations' })).toBeEnabled());
    const deferred = createDeferredPromise<[]>();
    view.fixtures.clerk.organization?.inviteMembers.mockReturnValueOnce(deferred.promise);
    const send = view.getByRole('button', { name: 'Send invitations' });
    const complete = billing.select.mock.calls[0][0].onSubscriptionComplete;
    act(() => {
      complete();
      complete();
    });
    await waitFor(() => expect(view.fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledTimes(2));
    expect(view.fixtures.clerk.organization?.inviteMembers).toHaveBeenLastCalledWith(params);
    expect(send).toBeDisabled();
    await act(async () => {
      deferred.resolve([]);
      await deferred.promise;
    });
    await waitFor(() => expect(view.success).toHaveBeenCalledOnce());
  });

  it('waits for initial form loading to finish when checkout completes immediately', async () => {
    const view = await setup();
    view.fixtures.clerk.organization?.inviteMembers.mockRejectedValueOnce(insufficientSeats());
    billing.select.mockImplementationOnce(({ onSubscriptionComplete }) => onSubscriptionComplete());
    await view.submit();
    await waitFor(() => expect(view.fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledTimes(2));
    expect(view.success).toHaveBeenCalledOnce();
  });

  it.each(['close', 'new-submit', 'account'] as const)('rejects an old checkout callback after %s', async kind => {
    const view = await setup();
    view.fixtures.clerk.organization?.inviteMembers.mockRejectedValueOnce(insufficientSeats());
    await view.submit();
    await waitFor(() => expect(billing.select).toHaveBeenCalledOnce());
    await waitFor(() => expect(view.getByRole('button', { name: 'Send invitations' })).toBeEnabled());
    const complete = billing.select.mock.calls[0][0].onSubscriptionComplete;
    if (kind === 'close') {
      view.unmount();
    } else if (kind === 'account') {
      changeSource(view.fixtures, 'account');
    } else {
      await view.userEvent.click(view.getByRole('button', { name: 'Send invitations' }));
    }
    const count = view.fixtures.clerk.organization?.inviteMembers.mock.calls.length;
    await act(async () => {
      complete();
      await Promise.resolve();
    });
    expect(view.fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledTimes(count!);
  });

  it('does not reopen checkout when the retry still needs more seats', async () => {
    const view = await setup();
    view.fixtures.clerk.organization?.inviteMembers.mockRejectedValue(insufficientSeats());
    await view.submit();
    await waitFor(() => expect(billing.select).toHaveBeenCalledOnce());
    await waitFor(() => expect(view.getByRole('button', { name: 'Send invitations' })).toBeEnabled());
    act(() => {
      billing.select.mock.calls[0][0].onSubscriptionComplete();
    });
    await waitFor(() => expect(view.fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledTimes(2));
    expect(billing.select).toHaveBeenCalledOnce();
    expect(await view.findByText(/Please change to a plan that supports/)).toBeVisible();
  });

  it('cancels queued dispatch when the form closes immediately', async () => {
    const view = await setup();
    await view.fill();
    act(() => {
      fireEvent.submit(view.container.querySelector('form')!);
      view.unmount();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(view.fixtures.clerk.organization?.inviteMembers).not.toHaveBeenCalled();
  });
});
