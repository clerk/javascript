import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';
import type { TOTPResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useTotpVerifyController } from '../totp-code-flow.controller';
import { useTotpCodeFlowModel } from '../totp-code-flow.model';
import type { TotpCodeFlowModel } from '../totp-code-flow.types';
import { TOTPCodeFlow } from '../TOTPCodeFlowScreen';

const { createFixtures } = bindCreateFixtures('TaskSetupMFA');
const secret = (value = 'FIRST_SECRET') =>
  ({
    uri: `otpauth://totp/Clerk:test?secret=${value}&issuer=Clerk`,
    secret: value,
  }) as TOTPResource;
const failure = () =>
  new ClerkAPIResponseError('TOTP failed', {
    status: 422,
    data: [{ code: 'totp_failed', message: 'TOTP failed', long_message: 'TOTP failed' }],
  });
async function setup() {
  const view = await createFixtures(f => {
    f.withAuthenticatorApp({ enabled: true });
    f.withBackupCode();
    f.withUser({ email_addresses: ['test@clerk.com'], tasks: [{ key: 'setup-mfa' }] });
  });
  const user = view.fixtures.clerk.user!;
  user.createTOTP.mockResolvedValue(secret());
  user.verifyTOTP.mockResolvedValue({ backupCodes: ['one', 'two'] } as TOTPResource);
  const changeAccount = () => {
    const replacement = { ...user, id: 'other_user', createTOTP: user.createTOTP, verifyTOTP: user.verifyTOTP };
    vi.spyOn(view.fixtures.clerk, 'user', 'get').mockReturnValue(replacement);
    view.fixtures.clerk.__internal_lastEmittedResources = {
      ...view.fixtures.clerk.__internal_lastEmittedResources,
      user: replacement,
    };
  };
  return { ...view, user, changeAccount };
}
async function setupVerification() {
  const view = await setup();
  const callbacks = { success: vi.fn(), reset: vi.fn() };
  let model!: TotpCodeFlowModel;
  let controller!: ReturnType<typeof useTotpVerifyController>;
  let card!: ReturnType<typeof useCardState>;
  const Observe = () => {
    card = useCardState();
    return null;
  };
  const Verify = () => {
    controller = useTotpVerifyController(model.verification, callbacks.success, callbacks.reset);
    return null;
  };
  const Parent = ({ visible = true }: { visible?: boolean }) => {
    model = useTotpCodeFlowModel();
    return (
      <CardStateProvider>
        <Observe />
        {visible && <Verify key={model.verification.scopeKey} />}
      </CardStateProvider>
    );
  };
  const rendered = render(
    <StrictMode>
      <Parent />
    </StrictMode>,
    { wrapper: view.wrapper },
  );
  return {
    ...view,
    callbacks,
    model: () => model,
    controller: () => controller,
    card: () => card,
    hide: () =>
      rendered.rerender(
        <StrictMode>
          <Parent visible={false} />
        </StrictMode>,
      ),
    refresh: () =>
      rendered.rerender(
        <StrictMode>
          <Parent />
        </StrictMode>,
      ),
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('TOTP setup request ownership', () => {
  it('returns copied seed data and boolean verification results', async () => {
    const view = await setup();
    const rawSeed = { ...secret(), reload: vi.fn() };
    const codes = ['one', 'two'];
    view.user.createTOTP.mockResolvedValue(rawSeed);
    view.user.verifyTOTP.mockResolvedValue({ backupCodes: codes, reload: vi.fn() } as unknown as TOTPResource);
    const hook = renderHook(() => useTotpCodeFlowModel(), { wrapper: view.wrapper });
    let created: Awaited<ReturnType<TotpCodeFlowModel['creation']['create']>> | undefined;
    await act(async () => {
      created = await hook.result.current.creation.create();
    });
    expect(created).toEqual({ status: 'created', totp: { uri: rawSeed.uri, secret: 'FIRST_SECRET' } });
    rawSeed.secret = 'changed';
    expect(created).toHaveProperty('totp.secret', 'FIRST_SECRET');
    await act(async () => {
      expect(await hook.result.current.verification.verifyCode('123456')).toBe(true);
    });
    codes.push('three');
    expect(hook.result.current.backupCodes).toEqual(['one', 'two']);
  });

  it.each(['user', 'session', 'client'] as const)(
    'rejects retained commands after the canonical %s changes',
    async field => {
      const view = await setup();
      const hook = renderHook(() => useTotpCodeFlowModel(), { wrapper: view.wrapper });
      const retained = hook.result.current;
      vi.spyOn(view.fixtures.clerk, field, 'get').mockReturnValue({
        ...view.fixtures.clerk[field],
        id: 'other',
      } as never);
      await expect(retained.creation.create()).resolves.toEqual({ status: 'stale' });
      await expect(retained.verification.verifyCode('123456')).resolves.toBe(false);
      expect(view.user.createTOTP).not.toHaveBeenCalled();
      expect(view.user.verifyTOTP).not.toHaveBeenCalled();
    },
  );

  it('invalidates retained verification commands when a new seed is created', async () => {
    const view = await setup();
    const hook = renderHook(() => useTotpCodeFlowModel(), { wrapper: view.wrapper });
    await act(async () => {
      await hook.result.current.creation.create();
    });
    const first = hook.result.current.verification;
    await act(async () => {
      await hook.result.current.creation.create();
    });
    await expect(first.verifyCode('123456')).resolves.toBe(false);
    expect(view.user.verifyTOTP).not.toHaveBeenCalled();
  });

  it('does not store backup codes after its caller closes', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<TOTPResource>();
    view.user.verifyTOTP.mockReturnValueOnce(deferred.promise);
    const hook = renderHook(() => useTotpCodeFlowModel(), { wrapper: view.wrapper });
    let open = true;
    const pending = hook.result.current.verification.verifyCode('123456', () => open);
    open = false;
    deferred.resolve({ backupCodes: ['old_code'] } as TOTPResource);
    await expect(pending).resolves.toBe(false);
    expect(hook.result.current.backupCodes).toBeUndefined();
  });

  it('rejects model commands retained after unmount', async () => {
    const view = await setup();
    const hook = renderHook(() => useTotpCodeFlowModel(), { wrapper: view.wrapper });
    const retained = hook.result.current;
    hook.unmount();
    await expect(retained.creation.create()).resolves.toEqual({ status: 'stale' });
    await expect(retained.verification.verifyCode('123456')).resolves.toBe(false);
    expect(view.user.createTOTP).not.toHaveBeenCalled();
    expect(view.user.verifyTOTP).not.toHaveBeenCalled();
  });

  it('creates one seed under Strict Mode', async () => {
    const view = await setup();
    const rendered = render(
      <StrictMode>
        <TOTPCodeFlow
          onSuccess={vi.fn()}
          goToStartStep={vi.fn()}
        />
      </StrictMode>,
      { wrapper: view.wrapper },
    );
    await rendered.findByRole('button', { name: /can't scan qr code/i });
    expect(view.user.createTOTP).toHaveBeenCalledOnce();
  });

  it('does not create a seed when the flow closes before queued dispatch', async () => {
    const view = await setup();
    const rendered = render(
      <TOTPCodeFlow
        onSuccess={vi.fn()}
        goToStartStep={vi.fn()}
      />,
      { wrapper: view.wrapper },
    );
    rendered.unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(view.user.createTOTP).not.toHaveBeenCalled();
  });

  it.each(['success', 'failure', 'cancelled'] as const)(
    'ignores old creation %s while a new account is loading',
    async outcome => {
      const view = await setup();
      const old = createDeferredPromise<TOTPResource>();
      const current = createDeferredPromise<TOTPResource>();
      view.user.createTOTP.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
      const callbacks = { onSuccess: vi.fn(), goToStartStep: vi.fn() };
      const rendered = render(<TOTPCodeFlow {...callbacks} />, { wrapper: view.wrapper });
      await waitFor(() => expect(view.user.createTOTP).toHaveBeenCalledOnce());
      view.changeAccount();
      rendered.rerender(<TOTPCodeFlow {...callbacks} />);
      await waitFor(() => expect(view.user.createTOTP).toHaveBeenCalledTimes(2));
      await act(async () => {
        if (outcome === 'success') {
          old.resolve(secret('OLD_SECRET'));
        } else if (outcome === 'cancelled') {
          old.reject(new ClerkRuntimeError('Cancelled', { code: 'reverification_cancelled' }));
        } else {
          old.reject(failure());
        }
        await old.promise.catch(() => {});
      });
      expect(rendered.queryByRole('button', { name: /can't scan qr code/i })).not.toBeInTheDocument();
      expect(rendered.queryByText('TOTP failed')).not.toBeInTheDocument();
      expect(callbacks.goToStartStep).not.toHaveBeenCalled();
      await act(async () => {
        current.resolve(secret('NEW_SECRET'));
        await current.promise;
      });
      await rendered.userEvent.click(await rendered.findByRole('button', { name: /can't scan qr code/i }));
      expect(rendered.getByDisplayValue('NEW_SECRET')).toBeVisible();
      expect(rendered.queryByDisplayValue('OLD_SECRET')).not.toBeInTheDocument();
    },
  );

  it('uses the latest callback when current reverification is cancelled', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<TOTPResource>();
    view.user.createTOTP.mockReturnValueOnce(deferred.promise);
    const first = vi.fn();
    const latest = vi.fn();
    const onSuccess = vi.fn();
    const rendered = render(
      <TOTPCodeFlow
        onSuccess={onSuccess}
        goToStartStep={first}
      />,
      { wrapper: view.wrapper },
    );
    await waitFor(() => expect(view.user.createTOTP).toHaveBeenCalledOnce());
    rendered.rerender(
      <TOTPCodeFlow
        onSuccess={onSuccess}
        goToStartStep={latest}
      />,
    );
    await act(async () => {
      deferred.reject(new ClerkRuntimeError('Cancelled', { code: 'reverification_cancelled' }));
      await deferred.promise.catch(() => {});
    });
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledOnce();
  });

  it('runs one verification for duplicate submissions and closes once after the success delay', async () => {
    const view = await setupVerification();
    const deferred = createDeferredPromise<TOTPResource>();
    view.user.verifyTOTP.mockReturnValueOnce(deferred.promise);
    vi.useFakeTimers();
    await act(async () => {
      view.controller().otp.onFakeContinue();
      view.controller().otp.onFakeContinue();
      view.controller().onReset();
      await Promise.resolve();
    });
    expect(view.user.verifyTOTP).toHaveBeenCalledOnce();
    expect(view.card().isLoading).toBe(true);
    expect(view.callbacks.reset).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve({ backupCodes: ['one'] } as TOTPResource);
      await deferred.promise;
    });
    expect(view.callbacks.success).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(750);
    });
    expect(view.callbacks.success).toHaveBeenCalledOnce();
    expect(view.card().isLoading).toBe(false);
  });

  it('does not close after unmount during the success delay', async () => {
    const view = await setupVerification();
    vi.useFakeTimers();
    await act(async () => {
      view.controller().otp.onFakeContinue();
      await Promise.resolve();
    });
    expect(view.user.verifyTOTP).toHaveBeenCalledOnce();
    view.hide();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(750);
    });
    expect(view.callbacks.success).not.toHaveBeenCalled();
    expect(view.card().isLoading).toBe(false);
  });

  it.each(['success', 'failure'] as const)(
    'ignores a late verification %s after account ownership is lost',
    async outcome => {
      const view = await setupVerification();
      const deferred = createDeferredPromise<TOTPResource>();
      view.user.verifyTOTP.mockReturnValueOnce(deferred.promise);
      act(() => {
        view.controller().otp.onFakeContinue();
      });
      await waitFor(() => expect(view.user.verifyTOTP).toHaveBeenCalledOnce());
      view.changeAccount();
      await act(async () => {
        if (outcome === 'success') {
          deferred.resolve({ backupCodes: ['old_code'] } as TOTPResource);
        } else {
          deferred.reject(failure());
        }
        await deferred.promise.catch(() => {});
      });
      expect(view.callbacks.success).not.toHaveBeenCalled();
      expect(view.card().error).toBeUndefined();
      expect(view.model().backupCodes).toBeUndefined();
    },
  );

  it('does not release a newer request after its verification step closes', async () => {
    const view = await setupVerification();
    const deferred = createDeferredPromise<TOTPResource>();
    view.user.verifyTOTP.mockReturnValueOnce(deferred.promise);
    await act(async () => {
      view.controller().otp.onFakeContinue();
      await Promise.resolve();
    });
    await waitFor(() => expect(view.user.verifyTOTP).toHaveBeenCalledOnce());
    view.hide();
    let release: (() => void) | undefined;
    act(() => {
      release = view.card().beginRequest();
    });
    expect(release).toBeDefined();
    await act(async () => {
      deferred.resolve({} as TOTPResource);
      await deferred.promise;
    });
    expect(view.card().isLoading).toBe(true);
    act(() => {
      release?.();
    });
    expect(view.card().isLoading).toBe(false);
  });

  it('permits a retry after a synchronous verification failure', async () => {
    const view = await setupVerification();
    view.user.verifyTOTP.mockImplementationOnce(() => {
      throw failure();
    });
    vi.useFakeTimers();
    await act(async () => {
      view.controller().otp.onFakeContinue();
      await Promise.resolve();
    });
    expect(view.card().error).toMatch(/TOTP failed/);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(750);
    });
    expect(view.card().isLoading).toBe(false);
    await act(async () => {
      view.controller().otp.onFakeContinue();
      await Promise.resolve();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(750);
    });
    expect(view.user.verifyTOTP).toHaveBeenCalledTimes(2);
    expect(view.callbacks.success).toHaveBeenCalledOnce();
  });
});
