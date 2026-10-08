import type { SessionVerificationResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { renderHook } from '@/test/utils';

import { createUVCodeEntryAction } from '../uv-code-action.controller';
import { useUVFactorOneCodeModel } from '../uv-factor-one-code.model';
import { useUVFactorTwoCodeModel } from '../uv-factor-two-code.model';

const { handleResponse } = vi.hoisted(() => ({ handleResponse: vi.fn(() => Promise.resolve()) }));
vi.mock('../use-after-verification', () => ({
  useAfterVerification: () => ({ handleVerificationResponse: handleResponse }),
}));
const { createFixtures } = bindCreateFixtures('UserVerification');
const factor = { strategy: 'phone_code' as const, phoneNumberId: 'phone_1', safeIdentifier: '+1•••1234' };

beforeEach(() => {
  handleResponse.mockClear();
});

describe('Verification code response boundary', () => {
  it.each(['first', 'second'] as const)('keeps the %s factor SDK response inside the model', async kind => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ username: 'clerkuser' });
    });
    const method = kind === 'first' ? 'attemptFirstFactorVerification' : 'attemptSecondFactorVerification';
    const response = {
      status: 'needs_second_factor',
      supportedSecondFactors: [],
    } as unknown as SessionVerificationResource;
    vi.spyOn(fixtures.session, method).mockResolvedValue(response);
    const useModel = kind === 'first' ? useUVFactorOneCodeModel : useUVFactorTwoCodeModel;
    const { result } = renderHook(() => useModel(factor), { wrapper });
    const complete = await result.current.attempt('123456');
    expect(typeof complete).toBe('function');
    expect(complete).not.toBe(response);
    expect(result.current).not.toHaveProperty('complete');
    expect(handleResponse).not.toHaveBeenCalled();
    await complete();
    expect(handleResponse).toHaveBeenCalledExactlyOnceWith(response);
  });

  it('does not expose the first-factor preparation response', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ username: 'clerkuser' });
    });
    vi.spyOn(fixtures.session, 'prepareFirstFactorVerification').mockResolvedValue({
      status: 'needs_first_factor',
    } as unknown as SessionVerificationResource);
    const { result } = renderHook(() => useUVFactorOneCodeModel(factor), { wrapper });
    await expect(result.current.prepare()).resolves.toBeUndefined();
  });

  it('finishes field success before calling the model completion command', async () => {
    const success = createDeferredPromise<void>();
    const complete = vi.fn(() => Promise.resolve());
    const attempt = vi.fn(() => Promise.resolve(complete));
    const resolve = vi.fn(() => success.promise);
    const reject = vi.fn(() => Promise.resolve());
    createUVCodeEntryAction(attempt)('123456', resolve, reject);
    await Promise.resolve();
    expect(attempt).toHaveBeenCalledExactlyOnceWith('123456');
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(complete).not.toHaveBeenCalled();
    success.resolve();
    await success.promise;
    await Promise.resolve();
    expect(complete).toHaveBeenCalledTimes(1);
    expect(reject).not.toHaveBeenCalled();
  });

  it('rejects the field when the SDK attempt fails', async () => {
    const error = new Error('Verification failed');
    const resolve = vi.fn(() => Promise.resolve());
    const reject = vi.fn(() => Promise.resolve());
    createUVCodeEntryAction(() => Promise.reject(error))('123456', resolve, reject);
    await Promise.resolve();
    await Promise.resolve();
    expect(resolve).not.toHaveBeenCalled();
    expect(reject).toHaveBeenCalledExactlyOnceWith(error);
  });

  it('does not continue verification when field success fails', async () => {
    const error = new Error('Field failed');
    const complete = vi.fn(() => Promise.resolve());
    const reject = vi.fn(() => Promise.resolve());
    createUVCodeEntryAction(() => Promise.resolve(complete))('123456', () => Promise.reject(error), reject);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(complete).not.toHaveBeenCalled();
    expect(reject).toHaveBeenCalledExactlyOnceWith(error);
  });
});
