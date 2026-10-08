import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { PhoneNumberResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, screen, waitFor } from '@/test/utils';

import { usePhoneFormModel } from '../phone-form.model';
import { PhoneForm } from '../PhoneForm';

const { createFixtures } = bindCreateFixtures('UserProfile');
const failure = () =>
  new ClerkAPIResponseError('Phone failed', {
    status: 422,
    data: [{ code: 'phone_failed', message: 'Phone failed' }],
  });

async function setup() {
  const view = await createFixtures(f => {
    f.withPhoneNumber();
    f.withUser({
      phone_numbers: [
        { id: 'first', phone_number: '+306911111110' },
        { id: 'second', phone_number: '+306911111111' },
      ],
    });
  });
  const user = view.fixtures.clerk.user!;
  const [first, second] = user.phoneNumbers;
  for (const phone of [first, second]) {
    phone.prepareVerification.mockResolvedValue(phone);
    phone.attemptVerification.mockResolvedValue(phone);
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

describe('Phone form ownership', () => {
  it('uses the latest canonical phone and discards SDK results', async () => {
    const view = await setup();
    const hook = renderHook(() => usePhoneFormModel({ phoneId: 'first', onSuccess: vi.fn(), onReset: vi.fn() }), {
      wrapper: view.wrapper,
    });
    const prepare = vi.fn().mockResolvedValue(view.first);
    const attempt = vi.fn().mockResolvedValue(view.first);
    view.user.phoneNumbers[0] = { ...view.first, prepareVerification: prepare, attemptVerification: attempt };
    await expect(hook.result.current.verification.prepareVerification()).resolves.toBeUndefined();
    await expect(hook.result.current.verification.attemptVerification('123456')).resolves.toBeUndefined();
    expect(prepare).toHaveBeenCalledOnce();
    expect(attempt).toHaveBeenCalledExactlyOnceWith({ code: '123456' });
    expect(view.first.prepareVerification).not.toHaveBeenCalled();
    expect(view.first.attemptVerification).not.toHaveBeenCalled();
    view.user.phoneNumbers.splice(0, 1);
    await expect(hook.result.current.verification.prepareVerification()).rejects.toThrow('no longer available');
  });

  it('invalidates retained commands when the target changes away and back', async () => {
    const view = await setup();
    const hook = renderHook(
      ({ id }: { id: string }) => usePhoneFormModel({ phoneId: id, onSuccess: vi.fn(), onReset: vi.fn() }),
      { wrapper: view.wrapper, initialProps: { id: 'first' } },
    );
    const old = hook.result.current;
    hook.rerender({ id: 'second' });
    expect(hook.result.current.verification.identifier).toBe(view.second.phoneNumber);
    hook.rerender({ id: 'first' });
    expect(hook.result.current.requestKey).not.toBe(old.requestKey);
    await old.verification.prepareVerification();
    await old.verification.attemptVerification('123456');
    await expect(old.addPhone.createPhone('+306933333333')).resolves.toBe(false);
    expect(view.first.prepareVerification).not.toHaveBeenCalled();
    expect(view.first.attemptVerification).not.toHaveBeenCalled();
    expect(view.user.createPhoneNumber).not.toHaveBeenCalled();
  });

  it.each(['user', 'session', 'client'] as const)('rejects commands after canonical %s changes', async field => {
    const view = await setup();
    const hook = renderHook(() => usePhoneFormModel({ phoneId: 'first', onSuccess: vi.fn(), onReset: vi.fn() }), {
      wrapper: view.wrapper,
    });
    const old = hook.result.current;
    vi.spyOn(view.fixtures.clerk, field, 'get').mockReturnValue({
      ...view.fixtures.clerk[field],
      id: 'other',
    } as never);
    await old.verification.prepareVerification();
    await old.verification.attemptVerification('123456');
    await expect(old.addPhone.createPhone('+306933333333')).resolves.toBe(false);
    expect(view.first.prepareVerification).not.toHaveBeenCalled();
    expect(view.first.attemptVerification).not.toHaveBeenCalled();
    expect(view.user.createPhoneNumber).not.toHaveBeenCalled();
  });

  it('uses a created phone until it enters the canonical list, then rejects its removal', async () => {
    const view = await setup();
    const created = { ...view.second, id: 'created' };
    view.user.createPhoneNumber.mockResolvedValueOnce(created);
    const hook = renderHook(() => usePhoneFormModel({ onSuccess: vi.fn(), onReset: vi.fn() }), {
      wrapper: view.wrapper,
    });
    await act(async () => {
      expect(await hook.result.current.addPhone.createPhone(created.phoneNumber)).toBe(true);
    });
    expect(hook.result.current.verification.identifier).toBe(created.phoneNumber);
    await hook.result.current.verification.prepareVerification();
    expect(created.prepareVerification).toHaveBeenCalledOnce();
    view.user.phoneNumbers.push(created);
    hook.rerender();
    view.user.phoneNumbers.pop();
    await expect(hook.result.current.verification.attemptVerification('123456')).rejects.toThrow('no longer available');
  });

  it.each(['success', 'failure'] as const)('ignores a late create %s after the target changes', async outcome => {
    const view = await setup();
    const deferred = createDeferredPromise<PhoneNumberResource>();
    view.user.createPhoneNumber.mockReturnValueOnce(deferred.promise);
    const hook = renderHook(
      ({ id }: { id?: string }) => usePhoneFormModel({ phoneId: id, onSuccess: vi.fn(), onReset: vi.fn() }),
      { wrapper: view.wrapper, initialProps: { id: undefined } },
    );
    const pending = hook.result.current.addPhone.createPhone('+306933333333');
    hook.rerender({ id: 'second' });
    await act(async () => {
      if (outcome === 'success') {
        deferred.resolve(view.first);
      } else {
        deferred.reject(failure());
      }
      expect(await pending).toBe(false);
    });
    expect(hook.result.current.verification.identifier).toBe(view.second.phoneNumber);
  });

  it('resets the rendered verification screen after an account change', async () => {
    const view = await setup();
    const props = { phoneId: 'first', onSuccess: vi.fn(), onReset: vi.fn() };
    const rendered = render(<PhoneForm {...props} />, { wrapper: view.wrapper });
    await screen.findByLabelText('Enter verification code');
    view.switchAccount();
    rendered.rerender(<PhoneForm {...props} />);
    expect(screen.queryByLabelText('Enter verification code')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toHaveValue('');
  });

  it('clears a created phone after an account change', async () => {
    const view = await setup();
    view.user.createPhoneNumber.mockResolvedValueOnce(view.first);
    const hook = renderHook(() => usePhoneFormModel({ onSuccess: vi.fn(), onReset: vi.fn() }), {
      wrapper: view.wrapper,
    });
    await act(async () => {
      await hook.result.current.addPhone.createPhone(view.first.phoneNumber);
    });
    const old = hook.result.current.verification;
    expect(old.identifier).toBe(view.first.phoneNumber);
    view.switchAccount();
    hook.rerender();
    expect(hook.result.current.hasExistingPhone).toBe(false);
    expect(hook.result.current.verification.identifier).toBe('');
    await old.prepareVerification();
    await old.attemptVerification('123456');
    expect(view.first.prepareVerification).not.toHaveBeenCalled();
    expect(view.first.attemptVerification).not.toHaveBeenCalled();
  });

  it('does not retry phone creation after the target changes during reverification', async () => {
    const view = await setup();
    view.user.createPhoneNumber.mockRejectedValueOnce(
      new ClerkAPIResponseError('Reverification required', {
        status: 401,
        data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
      }),
    );
    const open = vi.spyOn(view.fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
    const hook = renderHook(
      ({ id }: { id?: string }) => usePhoneFormModel({ phoneId: id, onSuccess: vi.fn(), onReset: vi.fn() }),
      { wrapper: view.wrapper, initialProps: { id: undefined } },
    );
    const pending = hook.result.current.addPhone.createPhone('+306933333333');
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    hook.rerender({ id: 'second' });
    await act(async () => {
      open.mock.calls[0][0].afterVerification!();
      expect(await pending).toBe(false);
    });
    expect(view.user.createPhoneNumber).toHaveBeenCalledOnce();
    expect(hook.result.current.verification.identifier).toBe(view.second.phoneNumber);
  });

  it.each(['success', 'failure'] as const)('keeps the new phone screen after a late verification %s', async outcome => {
    const view = await setup();
    const deferred = createDeferredPromise<PhoneNumberResource>();
    view.first.attemptVerification.mockReturnValueOnce(deferred.promise);
    const props = { onSuccess: vi.fn(), onReset: vi.fn() };
    const rendered = render(
      <PhoneForm
        {...props}
        phoneId='first'
      />,
      { wrapper: view.wrapper },
    );
    await rendered.userEvent.type(screen.getByLabelText('Enter verification code'), '123456');
    await waitFor(() => expect(view.first.attemptVerification).toHaveBeenCalledOnce());
    rendered.rerender(
      <PhoneForm
        {...props}
        phoneId='second'
      />,
    );
    await waitFor(() => expect(view.second.prepareVerification).toHaveBeenCalledOnce());
    await act(async () => {
      if (outcome === 'success') {
        deferred.resolve(view.first);
      } else {
        deferred.reject(failure());
      }
      await deferred.promise.catch(() => undefined);
    });
    expect(screen.getByLabelText('Enter verification code')).toHaveValue('');
    expect(screen.queryByText('Phone failed')).not.toBeInTheDocument();
    expect(props.onSuccess).not.toHaveBeenCalled();
  });
});
