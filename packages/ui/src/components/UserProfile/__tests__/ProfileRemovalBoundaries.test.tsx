import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@/test/utils';

import {
  useRemoveConnectedAccountModel,
  useRemoveEmailModel,
  useRemoveMfaPhoneCodeModel,
  useRemoveMfaTOTPModel,
  useRemovePhoneModel,
  useRemoveWeb3WalletModel,
} from '../remove-resource.model';
import {
  RemoveConnectedAccountForm,
  RemoveEmailForm,
  RemoveMfaPhoneCodeForm,
  RemoveMfaTOTPForm,
  RemovePhoneForm,
  RemoveWeb3WalletForm,
} from '../RemoveResourceForm';

const { createFixtures } = bindCreateFixtures('UserProfile');
const kinds = ['email', 'phone', 'wallet', 'mfaPhone', 'totp', 'connected'] as const;
type Kind = (typeof kinds)[number];
const sdkResult = { id: 'sdk-result', reload: vi.fn() };
const failure = () =>
  new ClerkAPIResponseError('Removal failed', {
    status: 422,
    data: [{ code: 'removal_failed', message: 'Removal failed' }],
  });

function useModels(id = 'first') {
  return {
    email: useRemoveEmailModel(id),
    phone: useRemovePhoneModel(id),
    wallet: useRemoveWeb3WalletModel(id),
    mfaPhone: useRemoveMfaPhoneCodeModel(id),
    totp: useRemoveMfaTOTPModel(),
    connected: useRemoveConnectedAccountModel(id),
  };
}

function removal(kind: Kind, id: string, onSuccess = vi.fn(), onReset = vi.fn()) {
  const props = { onSuccess, onReset };
  switch (kind) {
    case 'email':
      return (
        <RemoveEmailForm
          emailId={id}
          {...props}
        />
      );
    case 'phone':
      return (
        <RemovePhoneForm
          phoneId={id}
          {...props}
        />
      );
    case 'wallet':
      return (
        <RemoveWeb3WalletForm
          walletId={id}
          {...props}
        />
      );
    case 'mfaPhone':
      return (
        <RemoveMfaPhoneCodeForm
          phoneId={id}
          {...props}
        />
      );
    case 'totp':
      return <RemoveMfaTOTPForm {...props} />;
    case 'connected':
      return (
        <RemoveConnectedAccountForm
          accountId={id}
          {...props}
        />
      );
  }
}

async function setup() {
  const view = await createFixtures(f => {
    f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
    f.withAuthenticatorApp();
    f.withWeb3Wallet();
    f.withSocialProvider({ provider: 'google' });
    f.withUser({
      email_addresses: ['first', 'second'].map(id => ({ id, email_address: `${id}@clerk.com` })),
      phone_numbers: ['first', 'second'].map((id, index) => ({
        id,
        phone_number: `+30691111111${index}`,
        reserved_for_second_factor: true,
        verification: { status: 'verified', strategy: 'phone_code' } as any,
      })),
      web3_wallets: ['first', 'second'].map(id => ({
        id,
        web3_wallet: `0x${id}`,
        verification: { status: 'verified', strategy: 'web3_metamask_signature' },
      })) as any,
      external_accounts: ['first', 'second'].map(id => ({ id, provider: 'google', email_address: `${id}@clerk.com` })),
      totp_enabled: true,
      two_factor_enabled: true,
    });
  });
  const user = view.fixtures.clerk.user!;
  const effects = {
    email: vi.spyOn(user.emailAddresses[0], 'destroy'),
    phone: vi.spyOn(user.phoneNumbers[0], 'destroy'),
    wallet: vi.spyOn(user.web3Wallets[0], 'destroy'),
    mfaPhone: vi.spyOn(user.phoneNumbers[0], 'setReservedForSecondFactor'),
    totp: vi.spyOn(user, 'disableTOTP'),
    connected: vi.spyOn(user.externalAccounts[0], 'destroy'),
  };
  Object.values(effects).forEach(effect => effect.mockResolvedValue(sdkResult as never));
  const switchAccount = (extra = {}) => {
    const replacement = { ...user, id: 'replacement', ...extra };
    vi.spyOn(view.fixtures.clerk, 'user', 'get').mockReturnValue(replacement);
    view.fixtures.clerk.__internal_lastEmittedResources = {
      ...view.fixtures.clerk.__internal_lastEmittedResources,
      user: replacement,
    };
  };
  const removeTarget = (kind: Kind) => {
    switch (kind) {
      case 'email':
        user.emailAddresses.splice(0, 1);
        break;
      case 'phone':
        user.phoneNumbers.splice(0, 1);
        break;
      case 'wallet':
        user.web3Wallets.splice(0, 1);
        break;
      case 'connected':
        user.externalAccounts.splice(0, 1);
        break;
      case 'mfaPhone':
        Object.assign(user.phoneNumbers[0], { reservedForSecondFactor: false });
        break;
      case 'totp':
        Object.assign(user, { totpEnabled: false });
        break;
    }
  };
  return { ...view, user, effects, switchAccount, removeTarget };
}

describe.each(kinds)('Profile %s removal boundaries', kind => {
  it('does not dispatch when mounted without a user', async () => {
    const view = await setup();
    vi.spyOn(view.fixtures.clerk, 'user', 'get').mockReturnValue(null);
    view.fixtures.clerk.__internal_lastEmittedResources = {
      ...view.fixtures.clerk.__internal_lastEmittedResources,
      user: null,
    };
    const hook = renderHook(() => useModels(), { wrapper: view.wrapper });
    await expect(hook.result.current[kind].deleteResource()).resolves.toBe(false);
    expect(view.effects[kind]).not.toHaveBeenCalled();
  });

  it('preserves a failure from a current SDK request', async () => {
    const view = await setup();
    const error = failure();
    view.effects[kind].mockRejectedValueOnce(error);
    const hook = renderHook(() => useModels(), { wrapper: view.wrapper });
    await expect(hook.result.current[kind].deleteResource()).rejects.toBe(error);
  });

  it('returns plain completion without the SDK result', async () => {
    const view = await setup();
    const hook = renderHook(() => useModels(), { wrapper: view.wrapper });
    await expect(hook.result.current[kind].deleteResource()).resolves.toBe(true);
    expect(view.effects[kind]).toHaveBeenCalledOnce();
    if (kind === 'mfaPhone') {
      expect(view.effects[kind]).toHaveBeenCalledWith({ reserved: false });
    } else {
      expect(view.effects[kind]).toHaveBeenCalledWith();
    }
  });

  it.each(['user', 'session', 'client'] as const)(
    'rejects retained commands after the canonical %s changes',
    async field => {
      const view = await setup();
      const hook = renderHook(() => useModels(), { wrapper: view.wrapper });
      vi.spyOn(view.fixtures.clerk, field, 'get').mockReturnValue({
        ...view.fixtures.clerk[field],
        id: 'other',
      } as never);
      await expect(hook.result.current[kind].deleteResource()).resolves.toBe(false);
      expect(view.effects[kind]).not.toHaveBeenCalled();
    },
  );

  it('does not dispatch when the target is absent', async () => {
    const view = await setup();
    const hook = renderHook(() => useModels(), { wrapper: view.wrapper });
    view.removeTarget(kind);
    await expect(hook.result.current[kind].deleteResource()).resolves.toBe(false);
    expect(view.effects[kind]).not.toHaveBeenCalled();
  });

  it('does not dispatch after unmount', async () => {
    const view = await setup();
    const hook = renderHook(() => useModels(), { wrapper: view.wrapper });
    const retained = hook.result.current[kind];
    hook.unmount();
    await expect(retained.deleteResource()).resolves.toBe(false);
    expect(view.effects[kind]).not.toHaveBeenCalled();
  });

  it.each(['success', 'failure'] as const)('ignores a late %s after an account change or unmount', async outcome => {
    for (const change of ['account', 'unmount'] as const) {
      const view = await setup();
      const deferred = createDeferredPromise<any>();
      view.effects[kind].mockReturnValueOnce(deferred.promise);
      const hook = renderHook(() => useModels(), { wrapper: view.wrapper });
      const pending = hook.result.current[kind].deleteResource();
      if (change === 'account') {
        view.switchAccount();
        hook.rerender();
      } else {
        hook.unmount();
      }
      if (outcome === 'success') {
        deferred.resolve(sdkResult);
      } else {
        deferred.reject(failure());
      }
      await expect(pending).resolves.toBe(false);
      hook.unmount();
    }
  });

  it('keeps a current removal successful when the SDK removes its target', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<any>();
    view.effects[kind].mockReturnValueOnce(deferred.promise);
    const hook = renderHook(() => useModels(), { wrapper: view.wrapper });
    const pending = hook.result.current[kind].deleteResource();
    view.removeTarget(kind);
    hook.rerender();
    deferred.resolve(sdkResult);
    await expect(pending).resolves.toBe(true);
  });

  it('does not retry reverification after its form closes', async () => {
    const view = await setup();
    view.effects[kind].mockRejectedValueOnce(
      new ClerkAPIResponseError('Reverification required', {
        status: 401,
        data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
      }),
    );
    const open = vi.spyOn(view.fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
    const onSuccess = vi.fn();
    const rendered = render(removal(kind, 'first', onSuccess), { wrapper: view.wrapper });
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    const verification = open.mock.calls[0][0];
    rendered.unmount();
    await act(async () => {
      verification.afterVerification!();
      await Promise.resolve();
    });
    expect(view.effects[kind]).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe('Profile removal target changes', () => {
  it.each(['email', 'phone', 'wallet', 'mfaPhone'] as const)(
    'resets the %s display identifier for a new target',
    async kind => {
      const view = await setup();
      const hook = renderHook(({ id }) => useModels(id), { initialProps: { id: 'first' }, wrapper: view.wrapper });
      const original = hook.result.current[kind].identifier;
      hook.rerender({ id: 'second' });
      expect(hook.result.current[kind].identifier).toBeTruthy();
      expect(hook.result.current[kind].identifier).not.toBe(original);
    },
  );

  it.each(['email', 'phone', 'wallet', 'mfaPhone'] as const)(
    'resolves the latest %s resource at dispatch',
    async kind => {
      const view = await setup();
      const hook = renderHook(() => useModels(), { wrapper: view.wrapper });
      const current = vi.fn().mockResolvedValue(sdkResult);
      if (kind === 'email') {
        view.user.emailAddresses[0] = { ...view.user.emailAddresses[0], destroy: current };
      }
      if (kind === 'phone') {
        view.user.phoneNumbers[0] = { ...view.user.phoneNumbers[0], destroy: current };
      }
      if (kind === 'wallet') {
        view.user.web3Wallets[0] = { ...view.user.web3Wallets[0], destroy: current };
      }
      if (kind === 'mfaPhone') {
        view.user.phoneNumbers[0] = { ...view.user.phoneNumbers[0], setReservedForSecondFactor: current };
      }
      await expect(hook.result.current[kind].deleteResource()).resolves.toBe(true);
      expect(current).toHaveBeenCalledOnce();
      expect(view.effects[kind]).not.toHaveBeenCalled();
    },
  );

  it('accepts an identifier that becomes available after the first render', async () => {
    const view = await setup();
    const resource = view.user.emailAddresses.shift()!;
    const hook = renderHook(() => useRemoveEmailModel('first'), { wrapper: view.wrapper });
    expect(hook.result.current.identifier).toBeUndefined();
    view.user.emailAddresses.push(resource);
    hook.rerender();
    expect(hook.result.current.identifier).toBe('first@clerk.com');
  });

  it.each(['email', 'phone', 'wallet', 'mfaPhone'] as const)(
    'keeps a new %s form pending when the old target finishes',
    async kind => {
      const view = await setup();
      const old = createDeferredPromise<any>();
      const current = createDeferredPromise<any>();
      view.effects[kind].mockReturnValueOnce(old.promise);
      const next =
        kind === 'email'
          ? vi.spyOn(view.user.emailAddresses[1], 'destroy')
          : kind === 'wallet'
            ? vi.spyOn(view.user.web3Wallets[1], 'destroy')
            : kind === 'phone'
              ? vi.spyOn(view.user.phoneNumbers[1], 'destroy')
              : vi.spyOn(view.user.phoneNumbers[1], 'setReservedForSecondFactor');
      next.mockReturnValueOnce(current.promise);
      const onSuccess = vi.fn();
      const onReset = vi.fn();
      const rendered = render(removal(kind, 'first', onSuccess, onReset), { wrapper: view.wrapper });
      fireEvent.click(screen.getByRole('button', { name: /remove/i }));
      rendered.rerender(removal(kind, 'second', onSuccess, onReset));
      const button = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(button);
      await act(async () => {
        old.resolve(sdkResult);
        await old.promise;
      });
      expect(onSuccess).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
      expect(next).toHaveBeenCalledOnce();
      await act(async () => {
        current.resolve(sdkResult);
        await current.promise;
      });
      expect(onSuccess).toHaveBeenCalledExactlyOnceWith();
    },
  );

  it('resets a TOTP form when its account changes during a request', async () => {
    const view = await setup();
    const old = createDeferredPromise<any>();
    const current = createDeferredPromise<any>();
    view.effects.totp.mockReturnValueOnce(old.promise);
    const next = vi.fn().mockReturnValueOnce(current.promise);
    const onSuccess = vi.fn();
    const onReset = vi.fn();
    const rendered = render(removal('totp', 'first', onSuccess, onReset), { wrapper: view.wrapper });
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    view.switchAccount({ disableTOTP: next });
    rendered.rerender(removal('totp', 'first', onSuccess, onReset));
    const button = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(button);
    await act(async () => {
      old.resolve(sdkResult);
      await old.promise;
    });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
    expect(next).toHaveBeenCalledOnce();
    await act(async () => {
      current.resolve(sdkResult);
      await current.promise;
    });
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith();
  });
});
