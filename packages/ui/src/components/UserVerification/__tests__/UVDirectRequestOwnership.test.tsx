import type { SessionVerificationResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { renderHook, waitFor } from '@/test/utils';

import { useUserVerificationFactorOnePasswordModel } from '../user-verification-factor-one-password.model';
import { useUVFactorOnePasskeysModel } from '../uv-factor-one-passkeys.model';
import { useUVFactorTwoBackupCodeModel } from '../uv-factor-two-backup-code.model';

const { handleResponse } = vi.hoisted(() => ({ handleResponse: vi.fn(() => Promise.resolve()) }));
vi.mock('../use-after-verification', () => ({
  useAfterVerification: () => ({ handleVerificationResponse: handleResponse }),
}));
const { createFixtures } = bindCreateFixtures('UserVerification');
const response = { status: 'complete' } as SessionVerificationResource;
const cases = [
  {
    name: 'password',
    method: 'attemptFirstFactorVerification' as const,
    useCommand: () => useUserVerificationFactorOnePasswordModel().verifyPassword,
  },
  {
    name: 'backup code',
    method: 'attemptSecondFactorVerification' as const,
    useCommand: () => useUVFactorTwoBackupCodeModel().verifyBackupCode,
  },
  {
    name: 'passkey',
    method: 'verifyWithPasskey' as const,
    useCommand: () => useUVFactorOnePasskeysModel().verifyWithPasskey,
  },
];

beforeEach(() => {
  handleResponse.mockReset();
});

describe.each(cases)('$name request ownership', ({ method, useCommand }) => {
  const setup = async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ username: 'clerkuser' });
    });
    const request = createDeferredPromise<SessionVerificationResource>();
    const sdk = vi.spyOn(fixtures.session, method).mockReturnValue(request.promise);
    const hook = renderHook(useCommand, { wrapper });
    const changeSource = (field: 'user' | 'session' | 'client' | 'organization') =>
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field], id: 'other' } as never);
    return { ...hook, sdk, request, changeSource };
  };

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks a retained command after the canonical %s changes',
    async field => {
      const { result, sdk, request, changeSource } = await setup();
      changeSource(field);
      request.resolve(response);
      await result.current('secret');
      expect(sdk).not.toHaveBeenCalled();
      expect(handleResponse).not.toHaveBeenCalled();
    },
  );

  it('discards a late result after unmount', async () => {
    const { result, request, unmount } = await setup();
    const pending = result.current('secret');
    unmount();
    request.resolve(response);
    await pending;
    expect(handleResponse).not.toHaveBeenCalled();
  });

  it('suppresses an SDK error after source ownership changes', async () => {
    const { result, request, changeSource } = await setup();
    const pending = result.current('secret');
    changeSource('session');
    request.reject(new Error('Late failure'));
    await expect(pending).resolves.toBeUndefined();
    expect(handleResponse).not.toHaveBeenCalled();
  });

  it('preserves an SDK error for the current owner', async () => {
    const { result, request } = await setup();
    const pending = result.current('secret');
    const error = new Error('Current failure');
    request.reject(error);
    await expect(pending).rejects.toBe(error);
  });

  it('suppresses a completion error after the screen closes', async () => {
    const { result, request, unmount } = await setup();
    const completion = createDeferredPromise<void>();
    handleResponse.mockReturnValue(completion.promise);
    const pending = result.current('secret');
    request.resolve(response);
    await waitFor(() => expect(handleResponse).toHaveBeenCalledTimes(1));
    unmount();
    completion.reject(new Error('Late activation failure'));
    await expect(pending).resolves.toBeUndefined();
  });

  it('preserves a completion error for the current owner', async () => {
    const { result, request } = await setup();
    const error = new Error('Activation failed');
    handleResponse.mockRejectedValue(error);
    const pending = result.current('secret');
    request.resolve(response);
    await expect(pending).rejects.toBe(error);
  });

  it('passes the current result to completion without exposing the SDK response', async () => {
    const { result, request } = await setup();
    const pending = result.current('secret');
    request.resolve(response);
    await expect(pending).resolves.toBeUndefined();
    expect(handleResponse).toHaveBeenCalledExactlyOnceWith(response);
  });
});
