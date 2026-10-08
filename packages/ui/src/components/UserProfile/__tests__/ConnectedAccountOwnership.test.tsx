import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ExternalAccountResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@/test/utils';
import { ActionRoot } from '@/ui/elements/Action/ActionRoot';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { useConnectMenuButtonModel } from '../connected-accounts-menu.model';
import { useConnectedAccountController } from '../connected-accounts-section.controller';
import { useConnectedAccountModel, useConnectedAccountsSectionModel } from '../connected-accounts-section.model';
import { ConnectedAccountsSection } from '../ConnectedAccountsSection';
import { useProfileConnectionController } from '../profile-connection.controller';
import { useRemoveConnectedAccountModel } from '../remove-resource.model';

const { createFixtures } = bindCreateFixtures('UserProfile');
type Flow = 'add' | 'reconnect' | 'reauthorize';
const response = {
  verification: { externalVerificationRedirectURL: new URL('https://provider.example/auth') },
} as ExternalAccountResource;
const failure = () =>
  new ClerkAPIResponseError('Connection failed', {
    status: 422,
    data: [{ code: 'oauth_access_denied', message: 'Connection failed' }],
  });

async function setup(flow: Flow = 'reconnect') {
  const view = await createFixtures(f => {
    f.withSocialProvider({ provider: 'google' });
    f.withUser({
      external_accounts: [
        {
          id: 'account',
          provider: 'google',
          email_address: 'first@clerk.com',
          approved_scopes: flow === 'reauthorize' ? 'existing_scope' : '',
          verification: {
            status: 'unverified',
            strategy: 'oauth_google',
            error: { code: 'external_account_missing_refresh_token', message: '' },
          } as any,
        },
      ],
    });
  });
  if (flow === 'reauthorize') {
    view.props.setProps({ componentName: 'UserProfile', additionalOAuthScopes: { google: ['new_scope'] } });
  }
  const user = view.fixtures.clerk.user!;
  const account = user.externalAccounts[0];
  user.createExternalAccount.mockResolvedValue(response);
  account.reauthorize.mockResolvedValue(response);
  const transport = {
    getRedirectUrl: vi.fn().mockResolvedValue('myapp://callback'),
    open: vi.fn().mockResolvedValue({ callbackUrl: 'myapp://callback?rotating_token_nonce=nonce' }),
  };
  Object.defineProperty(view.fixtures.clerk, '__internal_oauthTransport', { configurable: true, value: transport });
  const reload = vi.spyOn(user, 'reload').mockResolvedValue(user);
  const switchAccount = () => {
    const replacement = {
      ...user,
      id: 'replacement',
      externalAccounts: [],
      verifiedExternalAccounts: [],
      unverifiedExternalAccounts: [],
    };
    vi.spyOn(view.fixtures.clerk, 'user', 'get').mockReturnValue(replacement);
    view.fixtures.clerk.__internal_lastEmittedResources = {
      ...view.fixtures.clerk.__internal_lastEmittedResources,
      user: replacement,
    };
  };
  return { ...view, user, account, transport, reload, switchAccount };
}

function useConnection(flow: Flow) {
  const add = useConnectMenuButtonModel('oauth_google');
  const reconnect = useConnectedAccountModel('account');
  return flow === 'add' ? add.connect : reconnect.reconnect;
}

async function setupController(flow: 'add' | 'reconnect') {
  const view = await setup(flow);
  let command!: () => Promise<void>;
  let card!: ReturnType<typeof useCardState>;
  const AddProbe = () => {
    command = useProfileConnectionController(useConnectMenuButtonModel('oauth_google'), 'oauth_google').connect;
    return null;
  };
  const ReconnectProbe = () => {
    command = useConnectedAccountController(useConnectedAccountModel('account')).reconnect;
    return null;
  };
  const Probe = flow === 'add' ? AddProbe : ReconnectProbe;
  const Boundary = withCardStateProvider(({ visible = true }: { visible?: boolean }) => {
    card = useCardState();
    return (
      <ActionRoot
        value={null}
        onChange={vi.fn()}
      >
        {visible && <Probe />}
      </ActionRoot>
    );
  });
  const rendered = render(<Boundary />, { wrapper: view.wrapper });
  return {
    ...view,
    command: () => command(),
    card: () => card,
    hide: () => rendered.rerender(<Boundary visible={false} />),
  };
}

describe('Connected account boundaries and ownership', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns account IDs and plain display data', async () => {
    const { wrapper } = await setup();
    const { result } = renderHook(
      () => ({
        section: useConnectedAccountsSectionModel(),
        item: useConnectedAccountModel('account'),
      }),
      { wrapper },
    );
    expect(result.current.section.accountIds).toEqual(['account']);
    expect(result.current.section).not.toHaveProperty('accounts');
    expect(result.current.item).toMatchObject({ id: 'account', provider: 'google', label: 'first@clerk.com' });
    expect(result.current.item).not.toHaveProperty('account');
  });

  it('resets section errors when the account changes', async () => {
    const view = await setup();
    view.user.createExternalAccount.mockRejectedValueOnce(failure());
    const rendered = render(<ConnectedAccountsSection />, { wrapper: view.wrapper });
    fireEvent.click(screen.getByRole('button', { name: /reconnect/i }));
    expect(await screen.findByText('You did not grant access to your account.')).toBeInTheDocument();
    view.switchAccount();
    rendered.rerender(<ConnectedAccountsSection />);
    expect(screen.queryByText('You did not grant access to your account.')).not.toBeInTheDocument();
  });

  describe.each(['add', 'reconnect', 'reauthorize'] as const)('%s', flow => {
    it.each(['user', 'session', 'client'] as const)(
      'rejects a retained command after the canonical %s changes',
      async field => {
        const view = await setup(flow);
        const hook = renderHook(() => useConnection(flow), { wrapper: view.wrapper });
        vi.spyOn(view.fixtures.clerk, field, 'get').mockReturnValue({
          ...view.fixtures.clerk[field],
          id: 'other',
        } as never);
        await expect(hook.result.current()).resolves.toBe(false);
        expect(view.transport.getRedirectUrl).not.toHaveBeenCalled();
        expect(view.user.createExternalAccount).not.toHaveBeenCalled();
        expect(view.account.reauthorize).not.toHaveBeenCalled();
      },
    );

    it.each(['redirect', 'mutation', 'callback', 'reload'] as const)(
      'stops after %s when unmounted or after an account change',
      async stage => {
        for (const change of ['unmount', 'account'] as const) {
          const view = await setup(flow);
          const deferred = createDeferredPromise<any>();
          const mutation = flow === 'reauthorize' ? view.account.reauthorize : view.user.createExternalAccount;
          const steps = {
            redirect: view.transport.getRedirectUrl,
            mutation,
            callback: view.transport.open,
            reload: view.reload,
          };
          steps[stage].mockReturnValueOnce(deferred.promise);
          const hook = renderHook(() => useConnection(flow), { wrapper: view.wrapper });
          const pending = hook.result.current();
          await waitFor(() => expect(steps[stage]).toHaveBeenCalledOnce());
          if (change === 'unmount') {
            hook.unmount();
          } else {
            view.switchAccount();
            hook.rerender();
          }
          const values = {
            redirect: 'myapp://callback',
            mutation: response,
            callback: { callbackUrl: 'myapp://callback' },
            reload: view.user,
          };
          deferred.resolve(values[stage]);
          await expect(pending).resolves.toBe(false);
          if (stage === 'redirect') {
            expect(mutation).not.toHaveBeenCalled();
          }
          if (stage === 'redirect' || stage === 'mutation') {
            expect(view.transport.open).not.toHaveBeenCalled();
          }
          if (stage !== 'reload') {
            expect(view.reload).not.toHaveBeenCalled();
          }
          expect(view.fixtures.router.navigate).not.toHaveBeenCalled();
          hook.unmount();
        }
      },
    );

    it('returns plain completion and reloads the current user after the callback', async () => {
      const view = await setup(flow);
      const hook = renderHook(() => useConnection(flow), { wrapper: view.wrapper });
      await expect(hook.result.current()).resolves.toBe(true);
      expect(view.reload).toHaveBeenCalledExactlyOnceWith({ rotatingTokenNonce: 'nonce' });
      expect(view.transport.open).toHaveBeenCalledExactlyOnceWith(new URL('https://provider.example/auth'));
    });

    it('suppresses an old failure after an account change', async () => {
      const view = await setup(flow);
      const deferred = createDeferredPromise<any>();
      const mutation = flow === 'reauthorize' ? view.account.reauthorize : view.user.createExternalAccount;
      mutation.mockReturnValueOnce(deferred.promise);
      const hook = renderHook(() => useConnection(flow), { wrapper: view.wrapper });
      const pending = hook.result.current();
      await waitFor(() => expect(mutation).toHaveBeenCalledOnce());
      view.switchAccount();
      hook.rerender();
      deferred.reject(failure());
      await expect(pending).resolves.toBe(false);
    });
  });

  describe.each(['add', 'reconnect'] as const)('%s reverification', flow => {
    it.each(['unmount', 'account'] as const)('does not retry an old mutation after %s', async change => {
      const view = await setup(flow);
      view.user.createExternalAccount.mockRejectedValueOnce(
        new ClerkAPIResponseError('Reverification required', {
          status: 401,
          data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
        }),
      );
      const open = vi.spyOn(view.fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
      const hook = renderHook(() => useConnection(flow), { wrapper: view.wrapper });
      const pending = hook.result.current();
      await waitFor(() => expect(open).toHaveBeenCalledOnce());
      const verification = open.mock.calls[0][0];
      if (change === 'unmount') {
        hook.unmount();
      } else {
        view.switchAccount();
        hook.rerender();
      }
      await act(async () => {
        verification.afterVerification!();
        await expect(pending).resolves.toBe(false);
      });
      expect(view.user.createExternalAccount).toHaveBeenCalledOnce();
      expect(view.transport.open).not.toHaveBeenCalled();
    });
  });

  it.each(['add', 'reconnect'] as const)('deduplicates simultaneous %s requests', async flow => {
    const view = await setupController(flow);
    const deferred = createDeferredPromise<any>();
    view.user.createExternalAccount.mockReturnValueOnce(deferred.promise);
    let pending!: Promise<void>;
    act(() => {
      pending = view.command();
      expect(view.command()).toBe(pending);
    });
    await waitFor(() => expect(view.user.createExternalAccount).toHaveBeenCalledOnce());
    await act(async () => {
      deferred.resolve(response);
      await pending;
    });
    expect(view.transport.open).toHaveBeenCalledOnce();
    view.hide();
  });

  it.each(['add', 'reconnect'] as const)('preserves a current error after an old %s unmounts', async flow => {
    const view = await setupController(flow);
    const deferred = createDeferredPromise<any>();
    view.user.createExternalAccount.mockReturnValueOnce(deferred.promise);
    let pending!: Promise<void>;
    act(() => {
      pending = view.command();
    });
    await waitFor(() => expect(view.user.createExternalAccount).toHaveBeenCalledOnce());
    view.hide();
    act(() => {
      view.card().setError('Current error');
    });
    await act(async () => {
      deferred.reject(failure());
      await pending;
    });
    expect(view.card().error).toBe('Current error');
  });

  it.each([false, true])('releases only its own settling request with unmount=%s', async unmount => {
    const view = await setupController('add');
    vi.useFakeTimers();
    await act(async () => {
      await view.command();
    });
    expect(view.card().isLoading).toBe(true);
    if (unmount) {
      view.hide();
      expect(view.card().isLoading).toBe(false);
      act(() => {
        view.card().beginRequest('new-request');
      });
    }
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(view.card().isLoading).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(view.card().isLoading).toBe(unmount);
    if (unmount) {
      expect(view.card().loadingMetadata).toBe('new-request');
    }
  });

  it('does not remove a missing target or a previous user account', async () => {
    const view = await setup();
    const remove = vi.spyOn(view.account, 'destroy');
    const hook = renderHook(() => useRemoveConnectedAccountModel('account'), { wrapper: view.wrapper });
    view.user.externalAccounts.splice(0, 1);
    await expect(hook.result.current.deleteResource()).resolves.toBe(false);
    view.user.externalAccounts.push(view.account);
    view.switchAccount();
    await expect(hook.result.current.deleteResource()).resolves.toBe(false);
    expect(remove).not.toHaveBeenCalled();
  });

  it('discards the SDK removal result', async () => {
    const view = await setup();
    vi.spyOn(view.account, 'destroy').mockResolvedValueOnce(undefined);
    const hook = renderHook(() => useRemoveConnectedAccountModel('account'), { wrapper: view.wrapper });
    await expect(hook.result.current.deleteResource()).resolves.toBe(true);
  });

  it.each(['success', 'failure'] as const)('ignores a late removal %s after an account change', async outcome => {
    const view = await setup();
    const deferred = createDeferredPromise<void>();
    vi.spyOn(view.account, 'destroy').mockReturnValueOnce(deferred.promise);
    const hook = renderHook(() => useRemoveConnectedAccountModel('account'), { wrapper: view.wrapper });
    const pending = hook.result.current.deleteResource();
    view.switchAccount();
    hook.rerender();
    if (outcome === 'success') {
      deferred.resolve();
    } else {
      deferred.reject(failure());
    }
    await expect(pending).resolves.toBe(false);
    expect(hook.result.current.exists).toBe(false);
  });
});
