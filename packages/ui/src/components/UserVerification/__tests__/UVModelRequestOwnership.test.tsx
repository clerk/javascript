import type { SessionVerificationResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { renderHook } from '@/test/utils';

import { useUVFactorOneCodeModel } from '../uv-factor-one-code.model';
import { useUVFactorTwoCodeModel } from '../uv-factor-two-code.model';
import { useUVFactorTwoPhoneCodeCardModel } from '../uv-factor-two-phone-code-card.model';

const { handleResponse } = vi.hoisted(() => ({ handleResponse: vi.fn(() => Promise.resolve()) }));
vi.mock('../use-after-verification', () => ({
  useAfterVerification: () => ({ handleVerificationResponse: handleResponse }),
}));

const { createFixtures } = bindCreateFixtures('UserVerification');
const factor = { strategy: 'phone_code' as const, phoneNumberId: 'phone_1', safeIdentifier: '+1•••1234' };
const response = { status: 'needs_second_factor' } as SessionVerificationResource;
const sources = ['user', 'session', 'client', 'organization'] as const;

beforeEach(() => handleResponse.mockClear());

const setup = async (kind: 'first' | 'second') => {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withUser({ username: 'clerkuser' });
  });
  const method = kind === 'first' ? 'attemptFirstFactorVerification' : 'attemptSecondFactorVerification';
  const attempt = vi.spyOn(fixtures.session, method);
  const useModel = kind === 'first' ? useUVFactorOneCodeModel : useUVFactorTwoCodeModel;
  const hook = renderHook(({ phoneNumberId }) => useModel({ ...factor, phoneNumberId }), {
    wrapper,
    initialProps: { phoneNumberId: 'phone_1' },
  });
  const changeSource = (field: (typeof sources)[number]) =>
    vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field], id: 'other' } as never);
  return { ...hook, attempt, changeSource };
};

describe.each(['first', 'second'] as const)('%s factor SDK request ownership', kind => {
  it.each(sources)('blocks retained commands after the canonical %s changes before render', async field => {
    const { result, attempt, changeSource } = await setup(kind);
    changeSource(field);
    const complete = await result.current.attempt('123456');
    await complete();
    expect(attempt).not.toHaveBeenCalled();
    expect(handleResponse).not.toHaveBeenCalled();
  });

  it.each(sources)('discards a pending result after the canonical %s changes', async field => {
    const { result, attempt, changeSource } = await setup(kind);
    const request = createDeferredPromise<SessionVerificationResource>();
    attempt.mockReturnValue(request.promise);
    const pending = result.current.attempt('123456');
    changeSource(field);
    request.resolve(response);
    const complete = await pending;
    await complete();
    expect(handleResponse).not.toHaveBeenCalled();
  });

  it('suppresses a late SDK error after unmount', async () => {
    const { result, attempt, unmount } = await setup(kind);
    const request = createDeferredPromise<SessionVerificationResource>();
    attempt.mockReturnValue(request.promise);
    const pending = result.current.attempt('123456');
    unmount();
    request.reject(new Error('Late failure'));
    const complete = await pending;
    await complete();
    expect(handleResponse).not.toHaveBeenCalled();
  });

  it('does not revive an earlier factor completion', async () => {
    const { result, attempt, rerender } = await setup(kind);
    attempt.mockResolvedValue(response);
    const complete = await result.current.attempt('123456');
    rerender({ phoneNumberId: 'phone_2' });
    rerender({ phoneNumberId: 'phone_1' });
    await complete();
    expect(handleResponse).not.toHaveBeenCalled();
  });

  it('preserves SDK errors for the current owner', async () => {
    const { result, attempt } = await setup(kind);
    const error = new Error('Current failure');
    attempt.mockRejectedValue(error);
    await expect(result.current.attempt('123456')).rejects.toBe(error);
  });
});

describe('Verification preparation SDK ownership', () => {
  it.each(['first', 'second'] as const)('blocks retained %s factor preparation after unmount', async kind => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ username: 'clerkuser' });
    });
    const method = kind === 'first' ? 'prepareFirstFactorVerification' : 'prepareSecondFactorVerification';
    const prepare = vi.spyOn(fixtures.session, method);
    const useModel = kind === 'first' ? useUVFactorOneCodeModel : useUVFactorTwoPhoneCodeCardModel;
    const { result, unmount } = renderHook(() => useModel(factor), { wrapper });
    const retained = result.current.prepare;
    unmount();
    await retained();
    expect(prepare).not.toHaveBeenCalled();
  });
});
