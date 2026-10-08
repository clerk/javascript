import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { PhoneNumberResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@/test/utils';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { localizationKeys } from '@/ui/localization';

import { useMfaPhoneCodeScreenController } from '../mfa-phone-code-screen.controller';
import { useMfaPhoneCodeScreenModel } from '../mfa-phone-code-screen.model';
import { MfaPhoneCodeScreen } from '../MfaPhoneCodeScreen';
import { useAddPhoneController } from '../phone-form.controller';
import { useVerifyWithCodeController } from '../verify-with-code.controller';

const { createFixtures } = bindCreateFixtures('UserProfile');
const failure = () =>
  new ClerkAPIResponseError('Phone failed', {
    status: 422,
    data: [{ code: 'phone_failed', message: 'Phone failed' }],
  });
async function setup(backups = false) {
  const view = await createFixtures(f => {
    f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
    if (backups) {
      f.withBackupCode();
    }
    f.withUser({
      phone_numbers: ['first', 'second'].map((id, index) => ({
        id,
        phone_number: `+30691111111${index}`,
        reserved_for_second_factor: false,
        verification: { status: 'verified', strategy: 'phone_code' } as any,
      })),
    });
  });
  const user = view.fixtures.clerk.user!;
  const first = user.phoneNumbers[0];
  const second = user.phoneNumbers[1];
  for (const phone of [first, second]) {
    phone.prepareVerification.mockResolvedValue(phone);
    phone.attemptVerification.mockResolvedValue(phone);
    phone.setReservedForSecondFactor.mockResolvedValue(phone);
  }
  const switchAccount = () => {
    const replacement = { ...user, id: 'replacement', phoneNumbers: [] };
    vi.spyOn(view.fixtures.clerk, 'user', 'get').mockReturnValue(replacement);
    view.fixtures.clerk.__internal_lastEmittedResources = {
      ...view.fixtures.clerk.__internal_lastEmittedResources,
      user: replacement,
    };
  };
  return { ...view, user, first, second, switchAccount };
}
async function setupController() {
  const view = await setup();
  const callbacks = { onSuccess: vi.fn(), onReset: vi.fn() };
  let model!: ReturnType<typeof useMfaPhoneCodeScreenModel>;
  let controller!: ReturnType<typeof useMfaPhoneCodeScreenController>;
  let card!: ReturnType<typeof useCardState>;
  const Probe = () => {
    controller = useMfaPhoneCodeScreenController(model, callbacks);
    return null;
  };
  const Boundary = withCardStateProvider(({ visible }: { visible: boolean }) => {
    card = useCardState();
    return visible ? <Probe /> : null;
  });
  const Parent = ({ visible = true }: { visible?: boolean }) => {
    model = useMfaPhoneCodeScreenModel();
    return <Boundary visible={visible} />;
  };
  const rendered = render(<Parent />, { wrapper: view.wrapper });
  return {
    ...view,
    callbacks,
    model: () => model,
    controller: () => controller,
    card: () => card,
    hide: () => rendered.rerender(<Parent visible={false} />),
    refresh: () => rendered.rerender(<Parent />),
  };
}

describe('MFA phone request ownership', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns plain phone rows and discards verification SDK results', async () => {
    const view = await setup();
    const hook = renderHook(() => useMfaPhoneCodeScreenModel(), { wrapper: view.wrapper });
    expect(Object.keys(hook.result.current.addMfa.phones[0]).sort()).toEqual(['id', 'isVerified', 'label']);
    act(() => {
      hook.result.current.selectPhone('first');
    });
    await expect(hook.result.current.verifyPhone.verification.prepareVerification()).resolves.toBeUndefined();
    await expect(hook.result.current.verifyPhone.verification.attemptVerification('123456')).resolves.toBeUndefined();
  });

  it.each(['user', 'session', 'client'] as const)(
    'rejects retained commands after the canonical %s changes',
    async field => {
      const view = await setup();
      const hook = renderHook(() => useMfaPhoneCodeScreenModel(), { wrapper: view.wrapper });
      act(() => {
        hook.result.current.selectPhone('first');
      });
      const model = hook.result.current;
      vi.spyOn(view.fixtures.clerk, field, 'get').mockReturnValue({
        ...view.fixtures.clerk[field],
        id: 'other',
      } as never);
      expect(model.selectPhone('second')).toBe(false);
      await expect(model.addPhone.createPhone('+306933333333')).resolves.toBe(false);
      await expect(model.enablePhone('first')).resolves.toBe(false);
      await model.verifyPhone.verification.prepareVerification();
      await model.verifyPhone.verification.attemptVerification('123456');
      expect(view.user.createPhoneNumber).not.toHaveBeenCalled();
      expect(view.first.setReservedForSecondFactor).not.toHaveBeenCalled();
      expect(view.first.prepareVerification).not.toHaveBeenCalled();
      expect(view.first.attemptVerification).not.toHaveBeenCalled();
    },
  );

  it('clears the selected phone and backup codes after an account change', async () => {
    const view = await setup();
    view.first.backupCodes = ['old-code'];
    const hook = renderHook(() => useMfaPhoneCodeScreenModel(), { wrapper: view.wrapper });
    act(() => {
      hook.result.current.selectPhone('first');
    });
    expect(hook.result.current.backupCodes).toEqual(['old-code']);
    view.switchAccount();
    hook.rerender();
    expect(hook.result.current.verifyPhone.id).toBeUndefined();
    expect(hook.result.current.backupCodes).toBeUndefined();
    expect(hook.result.current.addMfa.phones).toEqual([]);
  });

  it('rejects an old selection after switching away and back to the same phone', async () => {
    const view = await setup();
    const hook = renderHook(() => useMfaPhoneCodeScreenModel(), { wrapper: view.wrapper });
    act(() => {
      hook.result.current.selectPhone('first');
    });
    const old = hook.result.current.verifyPhone;
    act(() => {
      hook.result.current.selectPhone('second');
    });
    act(() => {
      hook.result.current.selectPhone('first');
    });
    await old.verification.prepareVerification();
    await old.verification.attemptVerification('123456');
    await expect(old.enableMfa()).resolves.toBe(false);
    expect(view.first.prepareVerification).not.toHaveBeenCalled();
    expect(view.first.attemptVerification).not.toHaveBeenCalled();
    expect(view.first.setReservedForSecondFactor).not.toHaveBeenCalled();
  });

  it('resolves the canonical phone before enablement and rejects missing or enabled targets', async () => {
    const view = await setup();
    const hook = renderHook(() => useMfaPhoneCodeScreenModel(), { wrapper: view.wrapper });
    const enable = vi.fn().mockResolvedValue(view.first);
    view.user.phoneNumbers[0] = { ...view.first, setReservedForSecondFactor: enable };
    await act(async () => {
      expect(await hook.result.current.enablePhone('first')).toBe(true);
    });
    expect(enable).toHaveBeenCalledExactlyOnceWith({ reserved: true });
    expect(view.first.setReservedForSecondFactor).not.toHaveBeenCalled();
    view.user.phoneNumbers.splice(0, 1);
    await expect(hook.result.current.enablePhone('first')).resolves.toBe(false);
    Object.assign(view.second, { reservedForSecondFactor: true });
    await expect(hook.result.current.enablePhone('second')).resolves.toBe(false);
  });

  it.each(['success', 'failure'] as const)('suppresses a late enable %s after a wizard change', async outcome => {
    const view = await setupController();
    const deferred = createDeferredPromise<PhoneNumberResource>();
    view.first.setReservedForSecondFactor.mockReturnValueOnce(deferred.promise);
    let pending!: Promise<void>;
    act(() => {
      pending = view.controller().selectOrEnablePhone(view.model().addMfa.phones[0]);
    });
    act(() => {
      view.controller().goToStep(0);
      view.card().setError('Current error');
      view.card().beginRequest('current');
    });
    await act(async () => {
      if (outcome === 'success') {
        deferred.resolve(view.first);
      } else {
        deferred.reject(failure());
      }
      await pending;
    });
    expect(view.callbacks.onSuccess).not.toHaveBeenCalled();
    expect(view.controller().wizardProps.step).toBe(0);
    expect(view.card().error).toBe('Current error');
    expect(view.card().loadingMetadata).toBe('current');
    expect(view.model().verifyPhone.id).toBeUndefined();
  });

  it.each(['success', 'failure'] as const)(
    'suppresses a late enable %s when only the screen controller unmounts',
    async outcome => {
      const view = await setupController();
      const deferred = createDeferredPromise<PhoneNumberResource>();
      view.first.setReservedForSecondFactor.mockReturnValueOnce(deferred.promise);
      let pending!: Promise<void>;
      act(() => {
        pending = view.controller().selectOrEnablePhone(view.model().addMfa.phones[0]);
      });
      view.hide();
      act(() => {
        view.card().setError('Current error');
        view.card().beginRequest('current');
      });
      await act(async () => {
        if (outcome === 'success') {
          deferred.resolve(view.first);
        } else {
          deferred.reject(failure());
        }
        await pending;
      });
      expect(view.callbacks.onSuccess).not.toHaveBeenCalled();
      expect(view.card().error).toBe('Current error');
      expect(view.card().loadingMetadata).toBe('current');
      expect(view.model().verifyPhone.id).toBeUndefined();
    },
  );

  it('deduplicates enablement across two clicks in the same event batch', async () => {
    const view = await setupController();
    const deferred = createDeferredPromise<PhoneNumberResource>();
    view.first.setReservedForSecondFactor.mockReturnValueOnce(deferred.promise);
    let pending!: Promise<void>;
    act(() => {
      pending = view.controller().selectOrEnablePhone(view.model().addMfa.phones[0]);
      expect(view.controller().selectOrEnablePhone(view.model().addMfa.phones[0])).toBe(pending);
    });
    expect(view.first.setReservedForSecondFactor).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve(view.first);
      await pending;
    });
    expect(view.callbacks.onSuccess).toHaveBeenCalledExactlyOnceWith();
    expect(view.card().isLoading).toBe(false);
  });

  it.each(['wizard', 'account'] as const)('does not retry reverification after a %s change', async change => {
    const view = await setupController();
    view.first.setReservedForSecondFactor.mockRejectedValueOnce(
      new ClerkAPIResponseError('Reverification required', {
        status: 401,
        data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
      }),
    );
    const open = vi.spyOn(view.fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
    let pending!: Promise<void>;
    act(() => {
      pending = view.controller().selectOrEnablePhone(view.model().addMfa.phones[0]);
    });
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    const verification = open.mock.calls[0][0];
    if (change === 'wizard') {
      act(() => {
        view.controller().goToStep(0);
      });
    } else {
      view.switchAccount();
      view.refresh();
    }
    await act(async () => {
      verification.afterVerification!();
      await pending;
    });
    expect(view.first.setReservedForSecondFactor).toHaveBeenCalledOnce();
    expect(view.callbacks.onSuccess).not.toHaveBeenCalled();
  });

  it('completes when the successful SDK update removes its own row', async () => {
    const view = await setup();
    const onSuccess = vi.fn();
    view.first.setReservedForSecondFactor.mockImplementation(() => {
      Object.assign(view.first, { reservedForSecondFactor: true });
      return Promise.resolve(view.first);
    });
    render(
      <MfaPhoneCodeScreen
        onSuccess={onSuccess}
        onReset={vi.fn()}
      />,
      { wrapper: view.wrapper },
    );
    fireEvent.click(screen.getAllByRole('button', { name: /^GR / })[0]);
    await waitFor(() => expect(onSuccess).toHaveBeenCalledExactlyOnceWith());
    expect(screen.getAllByRole('button', { name: /^GR / })).toHaveLength(1);
  });

  it('shows generated backup codes after the successful row disappears', async () => {
    const view = await setup(true);
    const onSuccess = vi.fn();
    view.first.setReservedForSecondFactor.mockImplementation(() => {
      Object.assign(view.first, { reservedForSecondFactor: true, backupCodes: ['12345678'] });
      return Promise.resolve(view.first);
    });
    render(
      <MfaPhoneCodeScreen
        onSuccess={onSuccess}
        onReset={vi.fn()}
      />,
      { wrapper: view.wrapper },
    );
    fireEvent.click(screen.getAllByRole('button', { name: /^GR / })[0]);
    expect(await screen.findAllByText('12345678')).toHaveLength(2);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it.each(['success', 'failure'] as const)(
    'does not save a late phone create %s after the caller closes',
    async outcome => {
      const view = await setup();
      const deferred = createDeferredPromise<PhoneNumberResource>();
      view.user.createPhoneNumber.mockReturnValueOnce(deferred.promise);
      const hook = renderHook(() => useMfaPhoneCodeScreenModel(), { wrapper: view.wrapper });
      let active = true;
      const pending = hook.result.current.addPhone.createPhone('+306933333333', () => active);
      active = false;
      if (outcome === 'success') {
        deferred.resolve(view.first);
      } else {
        deferred.reject(failure());
      }
      await expect(pending).resolves.toBe(false);
      hook.rerender();
      expect(hook.result.current.verifyPhone.id).toBeUndefined();
    },
  );

  it('does not advance code verification after unmount during its success delay', async () => {
    const view = await setup();
    const next = vi.fn();
    let code!: ReturnType<typeof useVerifyWithCodeController>;
    const Probe = () => {
      code = useVerifyWithCodeController({
        identifier: 'phone',
        prepareVerification: vi.fn().mockResolvedValue(undefined),
        attemptVerification: vi.fn().mockResolvedValue(undefined),
        nextStep: next,
        onReset: vi.fn(),
      });
      return null;
    };
    const Boundary = withCardStateProvider(() => <Probe />);
    const rendered = render(<Boundary />, { wrapper: view.wrapper });
    vi.useFakeTimers();
    await act(async () => {
      code.otp.onFakeContinue();
      await Promise.resolve();
    });
    rendered.unmount();
    await act(async () => {
      vi.advanceTimersByTime(750);
      await Promise.resolve();
    });
    expect(next).not.toHaveBeenCalled();
  });

  it.each(['success', 'failure'] as const)('ignores a late create %s after the form unmounts', async outcome => {
    const view = await setup();
    const deferred = createDeferredPromise<PhoneNumberResource>();
    view.user.createPhoneNumber.mockReturnValueOnce(deferred.promise);
    const onSuccess = vi.fn();
    let model!: ReturnType<typeof useMfaPhoneCodeScreenModel>;
    let controller!: ReturnType<typeof useAddPhoneController>;
    let card!: ReturnType<typeof useCardState>;
    const Probe = () => {
      controller = useAddPhoneController(model.addPhone, {
        title: localizationKeys('userProfile.phoneNumberPage.title'),
        onSuccess,
        onReset: vi.fn(),
      });
      return null;
    };
    const Boundary = withCardStateProvider(({ visible }: { visible: boolean }) => {
      card = useCardState();
      return visible ? <Probe /> : null;
    });
    const Parent = ({ visible = true }: { visible?: boolean }) => {
      model = useMfaPhoneCodeScreenModel();
      return <Boundary visible={visible} />;
    };
    const rendered = render(<Parent />, { wrapper: view.wrapper });
    let pending!: Promise<void>;
    act(() => {
      const event = { preventDefault: vi.fn() } as any;
      pending = controller.addPhone(event);
      expect(controller.addPhone(event)).toBe(pending);
    });
    expect(view.user.createPhoneNumber).toHaveBeenCalledOnce();
    rendered.rerender(<Parent visible={false} />);
    act(() => {
      card.setError('Current error');
    });
    await act(async () => {
      if (outcome === 'success') {
        deferred.resolve(view.first);
      } else {
        deferred.reject(failure());
      }
      await pending;
    });
    expect(model.verifyPhone.id).toBeUndefined();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(card.error).toBe('Current error');
  });
});
