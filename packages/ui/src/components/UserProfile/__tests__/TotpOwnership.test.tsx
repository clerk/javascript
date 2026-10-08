import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';
import type { TOTPResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, screen, waitFor } from '@/test/utils';
import { ActionRoot } from '@/ui/elements/Action/ActionRoot';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { localizationKeys } from '@/ui/localization';

import { useAddAuthenticatorAppController } from '../add-authenticator-app.controller';
import { AddAuthenticatorApp } from '../AddAuthenticatorApp';
import { useMfaTotpModel } from '../mfa-totp.model';
import { MfaTOTPScreen } from '../MfaTOTPScreen';
import { useVerifyTOTPController } from '../verify-totp.controller';
import { VerifyTOTP } from '../VerifyTOTP';

const { createFixtures } = bindCreateFixtures('UserProfile');
const totp = {
  id: 'totp',
  uri: 'otpauth://totp/Test:test@clerk.com?secret=TESTSECRET&issuer=Test',
  secret: 'TESTSECRET',
  backupCodes: ['12345678', '87654321'],
} as TOTPResource;
const failure = () =>
  new ClerkAPIResponseError('TOTP failed', {
    status: 422,
    data: [{ code: 'totp_failed', message: 'TOTP failed' }],
  });
const callbacks = () => ({ onSuccess: vi.fn(), onReset: vi.fn(), onBack: vi.fn() });

async function setup() {
  const view = await createFixtures(f => {
    f.withAuthenticatorApp();
    f.withBackupCode();
    f.withUser({ email_addresses: ['test@clerk.com'] });
  });
  const user = view.fixtures.clerk.user!;
  user.createTOTP.mockResolvedValue(totp);
  user.verifyTOTP.mockResolvedValue(totp);
  const switchAccount = () => {
    const replacement = { ...user, id: 'replacement' };
    vi.spyOn(view.fixtures.clerk, 'user', 'get').mockReturnValue(replacement);
    view.fixtures.clerk.__internal_lastEmittedResources = {
      ...view.fixtures.clerk.__internal_lastEmittedResources,
      user: replacement,
    };
  };
  return { ...view, user, switchAccount };
}

describe('TOTP ownership', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns plain setup data, boolean verification and copied backup codes', async () => {
    const view = await setup();
    const hook = renderHook(() => useMfaTotpModel(), { wrapper: view.wrapper });
    let created: unknown;
    await act(async () => {
      created = await hook.result.current.createTOTP();
    });
    expect(created).toEqual({ uri: totp.uri, secret: totp.secret });
    expect(created).not.toBe(totp);
    expect(hook.result.current).not.toHaveProperty('pendingTotpRef');
    expect(hook.result.current).not.toHaveProperty('verifiedTotpRef');
    await act(async () => {
      expect(await hook.result.current.verifyCode('123456')).toBe(true);
    });
    expect(view.user.verifyTOTP).toHaveBeenCalledExactlyOnceWith({ code: '123456' });
    expect(hook.result.current.backupCodes).toEqual(totp.backupCodes);
    expect(hook.result.current.backupCodes).not.toBe(totp.backupCodes);
    hook.result.current.backupCodes!.pop();
    hook.rerender();
    expect(hook.result.current.backupCodes).toEqual(totp.backupCodes);
  });

  it('deduplicates pending creation and reuses its secret on later calls', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<TOTPResource>();
    view.user.createTOTP.mockReturnValueOnce(deferred.promise);
    const hook = renderHook(() => useMfaTotpModel(), { wrapper: view.wrapper });
    const pending = hook.result.current.createTOTP();
    expect(hook.result.current.createTOTP()).toBe(pending);
    expect(view.user.createTOTP).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve(totp);
      await pending;
    });
    await expect(hook.result.current.createTOTP()).resolves.toEqual({ uri: totp.uri, secret: totp.secret });
    expect(view.user.createTOTP).toHaveBeenCalledOnce();
  });

  it('retains copied display data instead of SDK resource objects', async () => {
    const view = await setup();
    const source = { ...totp, backupCodes: [...totp.backupCodes!] };
    view.user.createTOTP.mockResolvedValueOnce(source);
    view.user.verifyTOTP.mockResolvedValueOnce(source);
    const hook = renderHook(() => useMfaTotpModel(), { wrapper: view.wrapper });
    await act(async () => {
      await hook.result.current.createTOTP();
      await hook.result.current.verifyCode('123456');
    });
    source.secret = 'CHANGED';
    source.backupCodes.push('changed');
    hook.rerender();
    expect(hook.result.current.setup?.secret).toBe(totp.secret);
    expect(hook.result.current.backupCodes).toEqual(totp.backupCodes);
  });

  it.each(['user', 'session', 'client'] as const)(
    'blocks commands and hides secrets after canonical %s changes',
    async field => {
      const view = await setup();
      const hook = renderHook(() => useMfaTotpModel(), { wrapper: view.wrapper });
      await act(async () => {
        await hook.result.current.createTOTP();
        await hook.result.current.verifyCode('123456');
      });
      view.user.createTOTP.mockClear();
      view.user.verifyTOTP.mockClear();
      const old = hook.result.current;
      vi.spyOn(view.fixtures.clerk, field, 'get').mockReturnValue({
        ...view.fixtures.clerk[field],
        id: 'other',
      } as never);
      await expect(old.createTOTP()).resolves.toBeUndefined();
      await expect(old.verifyCode('123456')).resolves.toBe(false);
      hook.rerender();
      expect(hook.result.current.setup).toBeUndefined();
      expect(hook.result.current.backupCodes).toBeUndefined();
      expect(view.user.createTOTP).not.toHaveBeenCalled();
      expect(view.user.verifyTOTP).not.toHaveBeenCalled();
    },
  );

  it.each(['create', 'verify'] as const)('ignores a late %s success after an account change', async operation => {
    const view = await setup();
    const deferred = createDeferredPromise<TOTPResource>();
    view.user[operation === 'create' ? 'createTOTP' : 'verifyTOTP'].mockReturnValueOnce(deferred.promise);
    const hook = renderHook(() => useMfaTotpModel(), { wrapper: view.wrapper });
    const old = hook.result.current;
    const pending = operation === 'create' ? old.createTOTP() : old.verifyCode('123456');
    view.switchAccount();
    hook.rerender();
    await act(async () => {
      deferred.resolve(totp);
      expect(await pending).toBe(operation === 'create' ? undefined : false);
    });
    expect(hook.result.current.setup).toBeUndefined();
    expect(hook.result.current.backupCodes).toBeUndefined();
    expect(old.canRun()).toBe(false);
  });

  it.each(['create', 'verify'] as const)('suppresses a late %s failure after unmount', async operation => {
    const view = await setup();
    const deferred = createDeferredPromise<TOTPResource>();
    view.user[operation === 'create' ? 'createTOTP' : 'verifyTOTP'].mockReturnValueOnce(deferred.promise);
    const hook = renderHook(() => useMfaTotpModel(), { wrapper: view.wrapper });
    const pending =
      operation === 'create' ? hook.result.current.createTOTP() : hook.result.current.verifyCode('123456');
    hook.unmount();
    deferred.reject(failure());
    await expect(pending).resolves.toBe(operation === 'create' ? undefined : false);
  });

  it('does not retry creation after an account change during reverification', async () => {
    const view = await setup();
    view.user.createTOTP.mockRejectedValueOnce(
      new ClerkAPIResponseError('Reverification required', {
        status: 401,
        data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
      }),
    );
    const open = vi.spyOn(view.fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
    const hook = renderHook(() => useMfaTotpModel(), { wrapper: view.wrapper });
    const pending = hook.result.current.createTOTP();
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    view.switchAccount();
    hook.rerender();
    await act(async () => {
      open.mock.calls[0][0].afterVerification!();
      await pending;
    });
    expect(view.user.createTOTP).toHaveBeenCalledOnce();
    expect(hook.result.current.setup).toBeUndefined();
  });

  it('creates only one secret under StrictMode', async () => {
    const view = await setup();
    render(
      <StrictMode>
        <ActionRoot>
          <MfaTOTPScreen {...callbacks()} />
        </ActionRoot>
      </StrictMode>,
      { wrapper: view.wrapper },
    );
    await screen.findByText(/scan the following QR code/i);
    expect(view.user.createTOTP).toHaveBeenCalledOnce();
  });

  it('reports a current setup failure under StrictMode', async () => {
    const view = await setup();
    view.user.createTOTP.mockRejectedValueOnce(failure());
    let model!: ReturnType<typeof useMfaTotpModel>;
    let card!: ReturnType<typeof useCardState>;
    const Probe = () => {
      card = useCardState();
      useAddAuthenticatorAppController(model, {
        ...callbacks(),
        title: localizationKeys('userProfile.mfaTOTPPage.title'),
      });
      return null;
    };
    const Boundary = withCardStateProvider(Probe);
    const Parent = () => {
      model = useMfaTotpModel();
      return <Boundary />;
    };
    render(
      <StrictMode>
        <ActionRoot>
          <Parent />
        </ActionRoot>
      </StrictMode>,
      { wrapper: view.wrapper },
    );
    await waitFor(() => expect(card.error).toBe('TOTP failed'));
    expect(view.user.createTOTP).toHaveBeenCalledOnce();
  });

  it('completes the rendered setup and displays backup codes', async () => {
    const view = await setup();
    const rendered = render(
      <ActionRoot>
        <MfaTOTPScreen {...callbacks()} />
      </ActionRoot>,
      { wrapper: view.wrapper },
    );
    await screen.findByText(/scan the following QR code/i);
    await rendered.userEvent.click(screen.getByRole('button', { name: /continue/i }));
    await rendered.userEvent.type(screen.getByLabelText('Enter verification code'), '123456');
    expect(await screen.findAllByText('12345678')).toHaveLength(2);
    expect(view.user.verifyTOTP).toHaveBeenCalledExactlyOnceWith({ code: '123456' });
  });

  it.each(['unmount', 'back', 'reset'] as const)(
    'does not advance after %s during the OTP success delay',
    async change => {
      const view = await setup();
      const props = callbacks();
      let controller!: ReturnType<typeof useVerifyTOTPController>;
      const Probe = () => {
        const model = useMfaTotpModel();
        controller = useVerifyTOTPController(model, props);
        return null;
      };
      const Boundary = withCardStateProvider(Probe);
      const rendered = render(<Boundary />, { wrapper: view.wrapper });
      vi.useFakeTimers();
      await act(async () => {
        controller.otp.onFakeContinue();
        await Promise.resolve();
      });
      if (change === 'unmount') {
        rendered.unmount();
      } else {
        act(() => {
          if (change === 'back') {
            controller.onBack();
          } else {
            controller.onReset();
          }
        });
      }
      await act(async () => {
        vi.advanceTimersByTime(750);
        await Promise.resolve();
      });
      expect(props.onSuccess).not.toHaveBeenCalled();
    },
  );

  it('deduplicates verification in the same event batch and rejects late results after the view closes', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<TOTPResource>();
    view.user.verifyTOTP.mockReturnValueOnce(deferred.promise);
    const props = callbacks();
    let model!: ReturnType<typeof useMfaTotpModel>;
    let controller!: ReturnType<typeof useVerifyTOTPController>;
    const Probe = () => {
      controller = useVerifyTOTPController(model, props);
      return null;
    };
    const Boundary = withCardStateProvider(({ visible }: { visible: boolean }) => (visible ? <Probe /> : null));
    const Parent = ({ visible = true }: { visible?: boolean }) => {
      model = useMfaTotpModel();
      return <Boundary visible={visible} />;
    };
    const rendered = render(<Parent />, { wrapper: view.wrapper });
    act(() => {
      controller.otp.onFakeContinue();
      controller.otp.onFakeContinue();
    });
    expect(view.user.verifyTOTP).toHaveBeenCalledOnce();
    rendered.rerender(<Parent visible={false} />);
    await act(async () => {
      deferred.resolve(totp);
      await deferred.promise;
    });
    expect(model.backupCodes).toBeUndefined();
    expect(props.onSuccess).not.toHaveBeenCalled();
  });

  it('does not close the current action for an old setup cancellation', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<TOTPResource>();
    view.user.createTOTP.mockReturnValueOnce(deferred.promise);
    let controller!: ReturnType<typeof useAddAuthenticatorAppController>;
    let card!: ReturnType<typeof useCardState>;
    let model!: ReturnType<typeof useMfaTotpModel>;
    const props = callbacks();
    const onChange = vi.fn();
    const Probe = () => {
      controller = useAddAuthenticatorAppController(model, {
        ...props,
        title: localizationKeys('userProfile.mfaTOTPPage.title'),
      });
      return null;
    };
    const Boundary = withCardStateProvider(({ visible }: { visible: boolean }) => {
      card = useCardState();
      return visible ? <Probe /> : null;
    });
    const Parent = ({ visible = true }: { visible?: boolean }) => {
      model = useMfaTotpModel();
      return (
        <ActionRoot
          value='current'
          onChange={onChange}
        >
          <Boundary visible={visible} />
        </ActionRoot>
      );
    };
    const rendered = render(<Parent />, { wrapper: view.wrapper });
    await waitFor(() => expect(view.user.createTOTP).toHaveBeenCalledOnce());
    act(() => {
      controller.onReset();
      card.setError('Current error');
    });
    rendered.rerender(<Parent visible={false} />);
    await act(async () => {
      deferred.reject(new ClerkRuntimeError('Cancelled', { code: 'reverification_cancelled' }));
      await deferred.promise.catch(() => undefined);
    });
    expect(props.onReset).toHaveBeenCalledOnce();
    expect(card.error).toBe('Current error');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports the existing setup reference input without passing it into the controller', async () => {
    const view = await setup();
    const pendingTotpRef = { current: totp };
    render(
      <ActionRoot>
        <AddAuthenticatorApp
          pendingTotpRef={pendingTotpRef}
          title={localizationKeys('userProfile.mfaTOTPPage.title')}
          {...callbacks()}
        />
      </ActionRoot>,
      { wrapper: view.wrapper },
    );
    await screen.findByText(/scan the following QR code/i);
    expect(view.user.createTOTP).not.toHaveBeenCalled();
  });

  it('supports the existing verification reference input', async () => {
    const view = await setup();
    const verifiedTotpRef = { current: undefined as TOTPResource | undefined };
    const props = callbacks();
    const rendered = render(
      <VerifyTOTP
        verifiedTotpRef={verifiedTotpRef}
        {...props}
      />,
      { wrapper: view.wrapper },
    );
    await rendered.userEvent.type(screen.getByLabelText('Enter verification code'), '123456');
    await waitFor(() => expect(props.onSuccess).toHaveBeenCalledExactlyOnceWith());
    expect(verifiedTotpRef.current).toBe(totp);
  });

  it('closes the action for a current setup cancellation', async () => {
    const view = await setup();
    view.user.createTOTP.mockRejectedValueOnce(
      new ClerkRuntimeError('Cancelled', { code: 'reverification_cancelled' }),
    );
    const onChange = vi.fn();
    render(
      <ActionRoot
        value='current'
        onChange={onChange}
      >
        <MfaTOTPScreen {...callbacks()} />
      </ActionRoot>,
      { wrapper: view.wrapper },
    );
    await waitFor(() => expect(onChange).toHaveBeenCalledExactlyOnceWith(null));
  });

  it('uses the canonical user for verification at dispatch', async () => {
    const view = await setup();
    const hook = renderHook(() => useMfaTotpModel(), { wrapper: view.wrapper });
    const verify = vi.fn().mockResolvedValue(totp);
    vi.spyOn(view.fixtures.clerk, 'user', 'get').mockReturnValue({ ...view.user, verifyTOTP: verify });
    await act(async () => {
      expect(await hook.result.current.verifyCode('123456')).toBe(true);
    });
    expect(verify).toHaveBeenCalledExactlyOnceWith({ code: '123456' });
    expect(view.user.verifyTOTP).not.toHaveBeenCalled();
  });

  it('invalidates a pending request when the legacy reference changes', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<TOTPResource>();
    view.user.createTOTP.mockReturnValueOnce(deferred.promise);
    const first = { current: undefined as TOTPResource | undefined };
    const second = { current: { ...totp, secret: 'SECOND' } };
    const hook = renderHook(({ ref }) => useMfaTotpModel({ pendingTotpRef: ref }), {
      wrapper: view.wrapper,
      initialProps: { ref: first },
    });
    const pending = hook.result.current.createTOTP();
    hook.rerender({ ref: second });
    await act(async () => {
      deferred.resolve(totp);
      expect(await pending).toBeUndefined();
    });
    expect(first.current).toBeUndefined();
    expect(hook.result.current.setup?.secret).toBe('SECOND');
  });
});
