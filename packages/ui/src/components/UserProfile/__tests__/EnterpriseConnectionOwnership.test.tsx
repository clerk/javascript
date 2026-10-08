import { ClerkAPIResponseError } from '@clerk/shared/error';
import { CLERK_MODAL_STATE } from '@clerk/shared/internal/clerk-js/constants';
import type { EnterpriseConnectionResource, ExternalAccountResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { useEnterpriseAccountsSectionModel } from '../enterprise-accounts-section.model';
import { useProfileConnectionController } from '../profile-connection.controller';

const { createFixtures } = bindCreateFixtures('UserProfile');
const response = {
  verification: { externalVerificationRedirectURL: new URL('https://provider.example/auth') },
} as ExternalAccountResource;
const failure = () =>
  new ClerkAPIResponseError('Connection failed', {
    status: 422,
    data: [{ code: 'oauth_access_denied', message: 'Connection failed' }],
  });

async function setup() {
  const view = await createFixtures(f => {
    f.withEnterpriseSso();
    f.withUser({ enterprise_accounts: [] });
  });
  const user = view.fixtures.clerk.user!;
  const connections = ['first', 'second'].map(id => ({
    id,
    name: id,
    provider: 'saml_okta',
    logoPublicUrl: ' https://example.com/logo.svg ',
    allowOrganizationAccountLinking: true,
    reload: vi.fn(),
  })) as unknown as EnterpriseConnectionResource[];
  user.getEnterpriseConnections.mockResolvedValue(connections);
  user.createExternalAccount.mockResolvedValue(response);
  const navigate = vi.spyOn(view.fixtures.clerk, '__internal_windowNavigate').mockImplementation(() => undefined);
  const switchAccount = (getEnterpriseConnections = vi.fn().mockResolvedValue([])) => {
    const replacement = { ...user, id: 'replacement', enterpriseAccounts: [], getEnterpriseConnections };
    vi.spyOn(view.fixtures.clerk, 'user', 'get').mockReturnValue(replacement);
    view.fixtures.clerk.__internal_lastEmittedResources = {
      ...view.fixtures.clerk.__internal_lastEmittedResources,
      user: replacement,
    };
  };
  return { ...view, user, connections, navigate, switchAccount };
}

async function setupModel() {
  const view = await setup();
  const hook = renderHook(() => useEnterpriseAccountsSectionModel(), { wrapper: view.wrapper });
  await waitFor(() => expect(hook.result.current.linkableConnections).toHaveLength(2));
  return { ...view, ...hook };
}

async function setupController() {
  const view = await setup();
  let model!: ReturnType<typeof useEnterpriseAccountsSectionModel>;
  let controller!: ReturnType<typeof useProfileConnectionController>;
  let card!: ReturnType<typeof useCardState>;
  const Probe = ({ connectionId }: { connectionId: string }) => {
    controller = useProfileConnectionController(
      {
        requestKey: JSON.stringify([model.requestKey, connectionId]),
        canRun: model.canRun,
        connect: canContinue => model.connect(connectionId, canContinue),
      },
      `enterprise_${connectionId}`,
    );
    return null;
  };
  const Boundary = withCardStateProvider(({ visible, connectionId }: { visible: boolean; connectionId: string }) => {
    card = useCardState();
    return visible ? <Probe connectionId={connectionId} /> : null;
  });
  const Parent = ({ visible = true, connectionId = 'first' }: { visible?: boolean; connectionId?: string }) => {
    model = useEnterpriseAccountsSectionModel();
    return (
      <Boundary
        visible={visible}
        connectionId={connectionId}
      />
    );
  };
  const rendered = render(<Parent />, { wrapper: view.wrapper });
  await waitFor(() => expect(model.linkableConnections).toHaveLength(2));
  return {
    ...view,
    command: () => controller.connect(),
    card: () => card,
    hide: () => rendered.rerender(<Parent visible={false} />),
    select: (connectionId: string) => rendered.rerender(<Parent connectionId={connectionId} />),
  };
}

describe('Enterprise connection boundaries and ownership', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns plain connection rows with no SDK methods', async () => {
    const view = await setupModel();
    expect(view.result.current.linkableConnections[0]).toEqual({
      id: 'first',
      name: 'first',
      providerIconId: 'okta',
      providerIconUrl: 'https://example.com/logo.svg',
    });
    expect(view.result.current).not.toHaveProperty('user');
  });

  it('does not retain the previous account query data', async () => {
    const view = await setupModel();
    const deferred = createDeferredPromise<EnterpriseConnectionResource[]>();
    const getConnections = vi.fn().mockReturnValue(deferred.promise);
    view.switchAccount(getConnections);
    view.rerender();
    expect(view.result.current.linkableConnections).toEqual([]);
    await waitFor(() => expect(getConnections).toHaveBeenCalledOnce());
    await act(async () => {
      deferred.resolve([]);
      await deferred.promise;
    });
    expect(view.result.current.shouldRender).toBe(false);
  });

  it('navigates through Clerk and returns plain completion', async () => {
    const view = await setupModel();
    await expect(view.result.current.connect('first', () => true)).resolves.toBe(true);
    expect(view.user.createExternalAccount).toHaveBeenCalledExactlyOnceWith({
      enterpriseConnectionId: 'first',
      redirectUrl: window.location.href,
    });
    expect(view.navigate).toHaveBeenCalledExactlyOnceWith(new URL('https://provider.example/auth'), undefined);
  });

  it('keeps modal state in the redirect URL', async () => {
    const view = await setupModel();
    view.props.setProps({ componentName: 'UserProfile', mode: 'modal' } as any);
    view.rerender();
    await view.result.current.connect('first', () => true);
    const redirectUrl = view.user.createExternalAccount.mock.calls[0][0].redirectUrl;
    expect(JSON.parse(window.atob(new URL(redirectUrl).searchParams.get(CLERK_MODAL_STATE)!))).toMatchObject({
      componentName: 'UserProfile',
    });
  });

  it.each(['user', 'session', 'client'] as const)(
    'rejects retained commands after the canonical %s changes',
    async field => {
      const view = await setupModel();
      vi.spyOn(view.fixtures.clerk, field, 'get').mockReturnValue({
        ...view.fixtures.clerk[field],
        id: 'other',
      } as never);
      await expect(view.result.current.connect('first', () => true)).resolves.toBe(false);
      expect(view.user.createExternalAccount).not.toHaveBeenCalled();
    },
  );

  it.each(['missing', 'not-linkable', 'already-linked'] as const)('rejects a %s connection', async state => {
    const view = await setupModel();
    if (state === 'missing') {
      view.connections.splice(0, 1);
    } else if (state === 'not-linkable') {
      view.connections[0].allowOrganizationAccountLinking = false;
    } else {
      view.user.enterpriseAccounts.push({ enterpriseConnectionId: 'first' } as never);
    }
    await expect(view.result.current.connect('first', () => true)).resolves.toBe(false);
    expect(view.user.createExternalAccount).not.toHaveBeenCalled();
  });

  it.each(['success', 'failure'] as const)('ignores a late SDK %s after an account change', async outcome => {
    const view = await setupModel();
    const deferred = createDeferredPromise<ExternalAccountResource>();
    view.user.createExternalAccount.mockReturnValueOnce(deferred.promise);
    const pending = view.result.current.connect('first', () => true);
    view.switchAccount();
    view.rerender();
    if (outcome === 'success') {
      deferred.resolve(response);
    } else {
      deferred.reject(failure());
    }
    await expect(pending).resolves.toBe(false);
    expect(view.navigate).not.toHaveBeenCalled();
  });

  it('starts one request for duplicate submissions', async () => {
    const view = await setupController();
    const deferred = createDeferredPromise<ExternalAccountResource>();
    view.user.createExternalAccount.mockReturnValueOnce(deferred.promise);
    let pending!: Promise<void>;
    act(() => {
      pending = view.command();
      expect(view.command()).toBe(pending);
    });
    expect(view.user.createExternalAccount).toHaveBeenCalledOnce();
    expect(view.card().isLoading).toBe(true);
    await act(async () => {
      deferred.resolve(response);
      await pending;
    });
    expect(view.navigate).toHaveBeenCalledOnce();
    view.hide();
    expect(view.card().isLoading).toBe(false);
  });

  it.each(['success', 'failure'] as const)('ignores old %s while a new target is pending', async outcome => {
    const view = await setupController();
    const old = createDeferredPromise<ExternalAccountResource>();
    const current = createDeferredPromise<ExternalAccountResource>();
    view.user.createExternalAccount.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
    let previous!: Promise<void>;
    let pending!: Promise<void>;
    act(() => {
      previous = view.command();
    });
    view.select('second');
    act(() => {
      pending = view.command();
    });
    expect(view.user.createExternalAccount).toHaveBeenCalledTimes(2);
    await act(async () => {
      if (outcome === 'success') {
        old.resolve(response);
      } else {
        old.reject(failure());
      }
      await previous;
    });
    expect(view.navigate).not.toHaveBeenCalled();
    expect(view.card().error).toBeUndefined();
    expect(view.card().loadingMetadata).toBe('enterprise_second');
    await act(async () => {
      current.resolve(response);
      await pending;
    });
    expect(view.navigate).toHaveBeenCalledOnce();
    view.hide();
  });

  it.each(['success', 'failure'] as const)('ignores late %s when only the button unmounts', async outcome => {
    const view = await setupController();
    const deferred = createDeferredPromise<ExternalAccountResource>();
    view.user.createExternalAccount.mockReturnValueOnce(deferred.promise);
    let pending!: Promise<void>;
    act(() => {
      pending = view.command();
    });
    view.hide();
    act(() => {
      view.card().setError('Current error');
      view.card().beginRequest('current');
    });
    await act(async () => {
      if (outcome === 'success') {
        deferred.resolve(response);
      } else {
        deferred.reject(failure());
      }
      await pending;
    });
    expect(view.navigate).not.toHaveBeenCalled();
    expect(view.card().error).toBe('Current error');
    expect(view.card().loadingMetadata).toBe('current');
  });

  it('releases loading and shows an error when the verification URL is missing', async () => {
    const view = await setupController();
    view.user.createExternalAccount.mockResolvedValueOnce({} as ExternalAccountResource);
    await act(async () => {
      await view.command();
    });
    expect(view.card().isLoading).toBe(false);
    expect(view.card().error).toContain('OAuth flow did not receive a verification URL.');
  });

  it('cancels the old settling timer when the target changes', async () => {
    const view = await setupController();
    vi.useFakeTimers();
    await act(async () => {
      await view.command();
    });
    expect(view.card().isLoading).toBe(true);
    view.select('second');
    expect(view.card().isLoading).toBe(false);
    act(() => {
      view.card().beginRequest('current');
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(view.card().loadingMetadata).toBe('current');
  });

  it.each(['unmount', 'account'] as const)('does not retry reverification after %s', async change => {
    const view = await setupController();
    view.user.createExternalAccount.mockRejectedValueOnce(
      new ClerkAPIResponseError('Reverification required', {
        status: 401,
        data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
      }),
    );
    const open = vi.spyOn(view.fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
    let pending!: Promise<void>;
    act(() => {
      pending = view.command();
    });
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    const verification = open.mock.calls[0][0];
    if (change === 'unmount') {
      view.hide();
    } else {
      view.switchAccount();
      view.select('first');
    }
    await act(async () => {
      verification.afterVerification!();
      await pending;
    });
    expect(view.user.createExternalAccount).toHaveBeenCalledOnce();
    expect(view.navigate).not.toHaveBeenCalled();
  });
});
