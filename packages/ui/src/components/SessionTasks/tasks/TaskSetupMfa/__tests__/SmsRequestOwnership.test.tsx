import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useSmsCodeFlowModel } from '../sms-code-flow.model';
import type { SmsCodeFlowModel } from '../sms-code-flow.types';
import { useSmsVerifyPhoneController } from '../sms-verify-phone.controller';
import { SmsCodeFlow } from '../SmsCodeFlowScreen';

const { createFixtures } = bindCreateFixtures('TaskSetupMFA');
const failure = () =>
  new ClerkAPIResponseError('Phone failed', {
    status: 422,
    data: [{ code: 'phone_failed', message: 'Phone failed', long_message: 'Phone failed' }],
  });
async function setup(verified = false) {
  const view = await createFixtures(f => {
    f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
    f.withUser({
      email_addresses: ['test@clerk.com'],
      tasks: [{ key: 'setup-mfa' }],
      phone_numbers: ['first', 'second'].map((id, index) => ({
        id,
        phone_number: `+30691111111${index}`,
        reserved_for_second_factor: false,
        verification: { status: verified ? 'verified' : 'unverified', strategy: 'phone_code' } as any,
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
  const changeAccount = () => {
    const replacement = { ...user, id: 'other_user', phoneNumbers: [] };
    vi.spyOn(view.fixtures.clerk, 'user', 'get').mockReturnValue(replacement);
    view.fixtures.clerk.__internal_lastEmittedResources = {
      ...view.fixtures.clerk.__internal_lastEmittedResources,
      user: replacement,
    };
  };
  return { ...view, user, first, second, changeAccount };
}
async function setupVerification() {
  const view = await setup();
  const callbacks = { success: vi.fn(), reset: vi.fn() };
  let model!: SmsCodeFlowModel;
  let controller!: ReturnType<typeof useSmsVerifyPhoneController>;
  let card!: ReturnType<typeof useCardState>;
  const Verify = () => {
    controller = useSmsVerifyPhoneController(model.verification, callbacks.success, callbacks.reset);
    card = useCardState();
    return null;
  };
  const Parent = ({ visible = true }: { visible?: boolean }) => {
    model = useSmsCodeFlowModel();
    return model.verification.phoneId && visible ? (
      <CardStateProvider key={model.verification.scopeKey}>
        <Verify />
      </CardStateProvider>
    ) : null;
  };
  const rendered = render(
    <StrictMode>
      <Parent />
    </StrictMode>,
    { wrapper: view.wrapper },
  );
  act(() => {
    model.selectUnverifiedPhone('first');
  });
  await waitFor(() => expect(view.first.prepareVerification).toHaveBeenCalledOnce());
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
  };
}

describe('SMS MFA request ownership', () => {
  it('returns plain rows and command results and copies backup codes', async () => {
    const view = await setup();
    const hook = renderHook(() => useSmsCodeFlowModel(), { wrapper: view.wrapper });
    expect(Object.keys(hook.result.current.phones[0]).sort()).toEqual(['flag', 'formattedPhone', 'id', 'isVerified']);
    expect(hook.result.current).not.toHaveProperty('resourceRef');
    act(() => {
      expect(hook.result.current.selectUnverifiedPhone('first')).toBe(true);
    });
    await expect(hook.result.current.verification.prepare()).resolves.toBe(true);
    await expect(hook.result.current.verification.attempt('123456')).resolves.toBe(true);
    const codes = ['one', 'two'];
    view.first.setReservedForSecondFactor.mockResolvedValue({ ...view.first, backupCodes: codes });
    await act(async () => {
      expect(await hook.result.current.verification.enableMfa()).toBe(true);
    });
    codes.push('three');
    expect(hook.result.current.backupCodes).toEqual(['one', 'two']);
  });

  it.each(['user', 'session', 'client'] as const)(
    'rejects retained commands when the canonical %s changes',
    async field => {
      const view = await setup();
      const hook = renderHook(() => useSmsCodeFlowModel(), { wrapper: view.wrapper });
      act(() => {
        hook.result.current.selectUnverifiedPhone('first');
      });
      const retained = hook.result.current;
      vi.spyOn(view.fixtures.clerk, field, 'get').mockReturnValue({
        ...view.fixtures.clerk[field],
        id: 'other',
      } as never);
      expect(retained.selectUnverifiedPhone('second')).toBe(false);
      await expect(retained.createPhone('+16505551234')).resolves.toBe(false);
      await expect(retained.enableVerifiedPhone('first')).resolves.toBe(false);
      await expect(retained.verification.prepare()).resolves.toBe(false);
      await expect(retained.verification.attempt('123456')).resolves.toBe(false);
      await expect(retained.verification.enableMfa()).resolves.toBe(false);
      expect(view.user.createPhoneNumber).not.toHaveBeenCalled();
      expect(view.first.prepareVerification).not.toHaveBeenCalled();
      expect(view.first.attemptVerification).not.toHaveBeenCalled();
      expect(view.first.setReservedForSecondFactor).not.toHaveBeenCalled();
    },
  );

  it('does not revive verification commands after selecting A, B, then A', async () => {
    const view = await setup();
    const hook = renderHook(() => useSmsCodeFlowModel(), { wrapper: view.wrapper });
    act(() => {
      hook.result.current.selectUnverifiedPhone('first');
    });
    const old = hook.result.current.verification;
    act(() => {
      hook.result.current.selectUnverifiedPhone('second');
    });
    act(() => {
      hook.result.current.selectUnverifiedPhone('first');
    });
    await expect(old.prepare()).resolves.toBe(false);
    await expect(old.attempt('123456')).resolves.toBe(false);
    await expect(old.enableMfa()).resolves.toBe(false);
    expect(view.first.prepareVerification).not.toHaveBeenCalled();
  });

  it.each(['success', 'failure'] as const)('ignores late creation %s after an account change', async outcome => {
    const view = await setup();
    const deferred = createDeferredPromise<any>();
    view.user.createPhoneNumber.mockReturnValue(deferred.promise);
    const hook = renderHook(() => useSmsCodeFlowModel(), { wrapper: view.wrapper });
    const pending = hook.result.current.createPhone('+16505551234');
    view.changeAccount();
    if (outcome === 'success') {
      deferred.resolve(view.first);
    } else {
      deferred.reject(failure());
    }
    await expect(pending).resolves.toBe(false);
    hook.rerender();
    expect(hook.result.current.verification.phoneId).toBeUndefined();
    expect(hook.result.current.backupCodes).toBeUndefined();
  });

  it('rejects commands retained after the model unmounts', async () => {
    const view = await setup();
    const hook = renderHook(() => useSmsCodeFlowModel(), { wrapper: view.wrapper });
    act(() => {
      hook.result.current.selectUnverifiedPhone('first');
    });
    const retained = hook.result.current;
    hook.unmount();
    await expect(retained.createPhone('+16505551234')).resolves.toBe(false);
    await expect(retained.verification.prepare()).resolves.toBe(false);
    await expect(retained.verification.enableMfa()).resolves.toBe(false);
    expect(view.user.createPhoneNumber).not.toHaveBeenCalled();
  });

  it('starts one verified-phone request and blocks navigation while it runs', async () => {
    const view = await setup(true);
    const deferred = createDeferredPromise<any>();
    view.first.setReservedForSecondFactor.mockReturnValue(deferred.promise);
    const rendered = render(
      <SmsCodeFlow
        onSuccess={vi.fn()}
        goToStartStep={vi.fn()}
      />,
      { wrapper: view.wrapper },
    );
    const phone = rendered.getByRole('button', { name: /1110/ });
    const cancel = rendered.getByRole('button', { name: /cancel/i });
    const add = rendered.getByRole('button', { name: /add phone number/i });
    act(() => {
      phone.click();
      phone.click();
      cancel.click();
      add.click();
    });
    await waitFor(() => expect(view.first.setReservedForSecondFactor).toHaveBeenCalledOnce());
    await act(async () => {
      deferred.resolve(view.first);
      await deferred.promise;
    });
    expect(await rendered.findByText(/SMS code verification enabled/i)).toBeVisible();
  });

  it('holds form loading until phone creation finishes', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<any>();
    view.user.createPhoneNumber.mockReturnValue(deferred.promise);
    const rendered = render(
      <SmsCodeFlow
        onSuccess={vi.fn()}
        goToStartStep={vi.fn()}
      />,
      { wrapper: view.wrapper },
    );
    await rendered.userEvent.click(rendered.getByRole('button', { name: /add phone number/i }));
    await rendered.userEvent.type(rendered.getByLabelText(/phone number/i), '6505551234');
    const submit = rendered.getByRole('button', { name: /continue/i });
    const form = rendered.container.querySelector('form')!;
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    await waitFor(() => expect(view.user.createPhoneNumber).toHaveBeenCalledOnce());
    expect(submit).toBeDisabled();
    expect(rendered.getByRole('button', { name: /cancel/i })).toBeDisabled();
    await act(async () => {
      deferred.resolve(view.first);
      await deferred.promise;
    });
    expect(await rendered.findByLabelText(/verification code/i)).toBeVisible();
  });

  it('waits for preparation and accepts one code attempt', async () => {
    const view = await setupVerification();
    const deferred = createDeferredPromise<any>();
    view.first.prepareVerification.mockReturnValueOnce(deferred.promise);
    view.controller().onResendCodeClicked();
    await waitFor(() => expect(view.first.prepareVerification).toHaveBeenCalledTimes(2));
    const resolve = vi.fn().mockResolvedValue(undefined);
    const reject = vi.fn().mockResolvedValue(undefined);
    act(() => {
      view.controller().onCodeEntryFinishedAction('123456', resolve, reject);
      view.controller().onCodeEntryFinishedAction('123456', resolve, reject);
    });
    expect(view.first.attemptVerification).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve(view.first);
      await deferred.promise;
    });
    await waitFor(() => expect(view.callbacks.success).toHaveBeenCalledOnce());
    expect(view.first.attemptVerification).toHaveBeenCalledOnce();
    expect(view.first.setReservedForSecondFactor).toHaveBeenCalledOnce();
    expect(resolve).toHaveBeenCalledOnce();
    expect(reject).not.toHaveBeenCalled();
  });

  it('does not enable MFA after closure during the verification success delay', async () => {
    const view = await setupVerification();
    const delay = createDeferredPromise<void>();
    const resolve = vi.fn().mockReturnValue(delay.promise);
    const reject = vi.fn().mockResolvedValue(undefined);
    act(() => {
      view.controller().onCodeEntryFinishedAction('123456', resolve, reject);
    });
    await waitFor(() => expect(resolve).toHaveBeenCalledOnce());
    view.hide();
    await act(async () => {
      delay.resolve();
      await delay.promise;
    });
    expect(view.first.setReservedForSecondFactor).not.toHaveBeenCalled();
    expect(view.callbacks.success).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
  });

  it.each(['success', 'failure'] as const)('ignores a late code %s after account ownership is lost', async outcome => {
    const view = await setupVerification();
    const deferred = createDeferredPromise<any>();
    view.first.attemptVerification.mockReturnValue(deferred.promise);
    const resolve = vi.fn().mockResolvedValue(undefined);
    const reject = vi.fn().mockResolvedValue(undefined);
    act(() => {
      view.controller().onCodeEntryFinishedAction('123456', resolve, reject);
    });
    await waitFor(() => expect(view.first.attemptVerification).toHaveBeenCalledOnce());
    view.changeAccount();
    await act(async () => {
      if (outcome === 'success') {
        deferred.resolve(view.first);
      } else {
        deferred.reject(failure());
      }
      await deferred.promise.catch(() => {});
    });
    expect(resolve).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
    expect(view.first.setReservedForSecondFactor).not.toHaveBeenCalled();
    expect(view.callbacks.success).not.toHaveBeenCalled();
  });

  it('does not publish backup codes when selection changes during MFA enablement', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<any>();
    view.first.setReservedForSecondFactor.mockReturnValueOnce(deferred.promise);
    const hook = renderHook(() => useSmsCodeFlowModel(), { wrapper: view.wrapper });
    act(() => {
      hook.result.current.selectUnverifiedPhone('first');
    });
    const pending = hook.result.current.verification.enableMfa();
    act(() => {
      hook.result.current.selectUnverifiedPhone('second');
    });
    deferred.resolve({ ...view.first, backupCodes: ['old_code'] });
    await expect(pending).resolves.toBe(false);
    expect(hook.result.current.verification.phoneId).toBe('second');
    expect(hook.result.current.backupCodes).toBeUndefined();
  });

  it('rejects a creation result after its caller closes', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<any>();
    view.user.createPhoneNumber.mockReturnValueOnce(deferred.promise);
    const hook = renderHook(() => useSmsCodeFlowModel(), { wrapper: view.wrapper });
    let open = true;
    const pending = hook.result.current.createPhone('+16505551234', () => open);
    open = false;
    deferred.resolve(view.first);
    await expect(pending).resolves.toBe(false);
    expect(hook.result.current.verification.phoneId).toBeUndefined();
  });

  it('permits another code attempt after a failure', async () => {
    const view = await setupVerification();
    view.first.attemptVerification.mockRejectedValueOnce(failure());
    const resolve = vi.fn().mockResolvedValue(undefined);
    const reject = vi.fn().mockResolvedValue(undefined);
    act(() => {
      view.controller().onCodeEntryFinishedAction('000000', resolve, reject);
    });
    await waitFor(() => expect(reject).toHaveBeenCalledOnce());
    await waitFor(() => expect(view.card().isLoading).toBe(false));
    act(() => {
      view.controller().onCodeEntryFinishedAction('123456', resolve, reject);
    });
    await waitFor(() => expect(view.callbacks.success).toHaveBeenCalledOnce());
    expect(view.first.attemptVerification).toHaveBeenCalledTimes(2);
    expect(view.first.setReservedForSecondFactor).toHaveBeenCalledOnce();
  });

  it.each(['success', 'failure'] as const)(
    'resets the wizard and ignores old selection %s after an account change',
    async outcome => {
      const view = await setup(true);
      const deferred = createDeferredPromise<any>();
      view.first.setReservedForSecondFactor.mockReturnValueOnce(deferred.promise);
      const callbacks = { onSuccess: vi.fn(), goToStartStep: vi.fn() };
      const rendered = render(<SmsCodeFlow {...callbacks} />, { wrapper: view.wrapper });
      await rendered.userEvent.click(rendered.getByRole('button', { name: /1110/ }));
      await waitFor(() => expect(view.first.setReservedForSecondFactor).toHaveBeenCalledOnce());
      view.changeAccount();
      rendered.rerender(<SmsCodeFlow {...callbacks} />);
      expect(rendered.getByLabelText(/phone number/i)).toBeVisible();
      await act(async () => {
        if (outcome === 'success') {
          deferred.resolve({ ...view.first, backupCodes: ['old_code'] });
        } else {
          deferred.reject(failure());
        }
        await deferred.promise.catch(() => {});
      });
      expect(rendered.queryByText(/SMS code verification enabled/i)).not.toBeInTheDocument();
      expect(rendered.queryByText('Phone failed')).not.toBeInTheDocument();
      expect(rendered.queryByText('old_code')).not.toBeInTheDocument();
      expect(callbacks.onSuccess).not.toHaveBeenCalled();
    },
  );
});
