import { ClerkRuntimeError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { useActivateStepModel } from '../activate-step.model';
import { ActivateStep } from '../ActivateStep';

const source = vi.hoisted(() => ({
  ownerKey: 'owner_first',
  connectionId: 'connection_first' as string | undefined,
  canRun: vi.fn(() => true),
  activate: vi.fn(),
  exit: vi.fn(),
  active: false,
}));
vi.mock('../../ConfigureSSOContext', () => ({
  useConfigureSSO: () => ({
    ownerKey: source.ownerKey,
    canRun: source.canRun,
    enterpriseConnection: source.connectionId ? { id: source.connectionId, domains: ['clerk.com'] } : undefined,
    organizationEnterpriseConnection: { isActive: source.active },
    enterpriseConnectionMutations: { setConnectionActive: source.activate },
    onExit: source.exit,
  }),
}));
const { createFixtures } = bindCreateFixtures('ConfigureSSO');
const failed = () => new ClerkRuntimeError('Activation failed', { code: 'activation_failed' });

beforeEach(() => {
  source.ownerKey = 'owner_first';
  source.connectionId = 'connection_first';
  source.canRun.mockReset().mockReturnValue(true);
  source.activate.mockReset().mockResolvedValue(undefined);
  source.exit = vi.fn();
  source.active = false;
});

async function setup() {
  const { wrapper, fixtures } = await createFixtures();
  const telemetry = vi.spyOn(fixtures.clerk.telemetry!, 'record').mockImplementation(() => {});
  const view = () => (
    <CardStateProvider>
      <StrictMode>
        <ActivateStep />
      </StrictMode>
    </CardStateProvider>
  );
  const activationEvents = () => telemetry.mock.calls.filter(([event]) => event.payload?.step === 'activate');
  return { ...render(view(), { wrapper }), wrapper, activationEvents, view };
}

describe('SSO activation request ownership', () => {
  it('starts one request for duplicate clicks before React renders', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<void>();
    source.activate.mockReturnValueOnce(deferred.promise);
    const activate = view.getByRole('button', { name: 'Activate SSO' });
    act(() => {
      activate.click();
      activate.click();
    });
    await waitFor(() => expect(source.activate).toHaveBeenCalledOnce());
    expect(view.getByRole('button', { name: /Skip for now/i })).toBeDisabled();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(source.exit).toHaveBeenCalledOnce();
    expect(view.activationEvents()).toHaveLength(1);
  });

  it.each(['success', 'failure'] as const)('ignores old %s and keeps the new connection loading', async outcome => {
    const view = await setup();
    const first = createDeferredPromise<void>();
    const second = createDeferredPromise<void>();
    source.activate.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    await view.userEvent.click(view.getByRole('button', { name: 'Activate SSO' }));
    source.connectionId = 'connection_second';
    view.rerender(view.view());
    await view.userEvent.click(view.getByRole('button', { name: 'Activate SSO' }));
    expect(source.activate).toHaveBeenLastCalledWith('connection_second', true);
    await act(async () => {
      if (outcome === 'success') {
        first.resolve();
      } else {
        first.reject(failed());
      }
      await first.promise.catch(() => {});
    });
    expect(view.getByRole('button', { name: /Skip for now/i })).toBeDisabled();
    expect(view.queryByText(/Activation failed/i)).not.toBeInTheDocument();
    expect(source.exit).not.toHaveBeenCalled();
    expect(view.activationEvents()).toHaveLength(0);
    await act(async () => {
      second.resolve();
      await second.promise;
    });
    expect(source.exit).toHaveBeenCalledOnce();
    expect(view.activationEvents()).toHaveLength(1);
  });

  it('does not dispatch after source ownership is lost before rendering', async () => {
    const view = await setup();
    source.canRun.mockReturnValue(false);
    await view.userEvent.click(view.getByRole('button', { name: 'Activate SSO' }));
    await view.userEvent.click(view.getByRole('button', { name: /Skip for now/i }));
    expect(source.activate).not.toHaveBeenCalled();
    expect(source.exit).not.toHaveBeenCalled();
    expect(view.activationEvents()).toHaveLength(0);
  });

  it.each(['close', 'owner-loss'] as const)('ignores activation success after %s', async change => {
    const view = await setup();
    const deferred = createDeferredPromise<void>();
    source.activate.mockReturnValueOnce(deferred.promise);
    await view.userEvent.click(view.getByRole('button', { name: 'Activate SSO' }));
    if (change === 'close') {
      view.unmount();
    } else {
      source.canRun.mockReturnValue(false);
    }
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(source.exit).not.toHaveBeenCalled();
    expect(view.activationEvents()).toHaveLength(0);
  });

  it('uses the latest exit callback for a current activation', async () => {
    const view = await setup();
    const firstExit = source.exit;
    const deferred = createDeferredPromise<void>();
    source.activate.mockReturnValueOnce(deferred.promise);
    await view.userEvent.click(view.getByRole('button', { name: 'Activate SSO' }));
    source.exit = vi.fn();
    view.rerender(view.view());
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(firstExit).not.toHaveBeenCalled();
    expect(source.exit).toHaveBeenCalledOnce();
  });

  it('clears a failed connection error when the selected connection changes', async () => {
    const view = await setup();
    source.activate.mockRejectedValueOnce(failed());
    await view.userEvent.click(view.getByRole('button', { name: 'Activate SSO' }));
    expect(await view.findByText(/Activation failed/i)).toBeVisible();
    source.connectionId = 'connection_second';
    view.rerender(view.view());
    expect(view.queryByText(/Activation failed/i)).not.toBeInTheDocument();
  });

  it('permits a retry after a synchronous failure', async () => {
    const view = await setup();
    source.activate.mockImplementationOnce(() => {
      throw failed();
    });
    await view.userEvent.click(view.getByRole('button', { name: 'Activate SSO' }));
    expect(await view.findByText(/Activation failed/i)).toBeVisible();
    await view.userEvent.click(view.getByRole('button', { name: 'Activate SSO' }));
    expect(source.activate).toHaveBeenCalledTimes(2);
    expect(source.exit).toHaveBeenCalledOnce();
  });

  it('keeps Done disabled if the connection becomes active before its request settles', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<void>();
    source.activate.mockReturnValueOnce(deferred.promise);
    await view.userEvent.click(view.getByRole('button', { name: 'Activate SSO' }));
    source.active = true;
    view.rerender(view.view());
    expect(view.getByRole('button', { name: 'Done' })).toBeDisabled();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(source.exit).toHaveBeenCalledOnce();
  });

  it('exits once for duplicate Skip clicks', async () => {
    const view = await setup();
    const skip = view.getByRole('button', { name: /Skip for now/i });
    act(() => {
      skip.click();
      skip.click();
    });
    expect(source.exit).toHaveBeenCalledOnce();
    expect(source.activate).not.toHaveBeenCalled();
  });

  it('cancels queued activation when the step closes immediately', async () => {
    const view = await setup();
    act(() => {
      view.getByRole('button', { name: 'Activate SSO' }).click();
      view.unmount();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(source.activate).not.toHaveBeenCalled();
  });

  it('does not revive a retained command when the connection changes and returns', async () => {
    const { wrapper } = await createFixtures();
    const hook = renderHook(useActivateStepModel, { wrapper });
    const first = hook.result.current;
    source.connectionId = 'connection_second';
    hook.rerender();
    source.connectionId = 'connection_first';
    hook.rerender();
    await first.activate();
    first.onExit?.();
    expect(source.activate).not.toHaveBeenCalled();
    expect(source.exit).not.toHaveBeenCalled();
  });
});
