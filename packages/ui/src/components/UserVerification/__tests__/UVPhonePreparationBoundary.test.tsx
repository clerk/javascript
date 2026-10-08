import type { SessionVerificationResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { renderHook } from '@/test/utils';

import { useUVFactorTwoPhoneCodeCardModel } from '../uv-factor-two-phone-code-card.model';

const { createFixtures } = bindCreateFixtures('UserVerification');

const setup = async () => {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withUser({ username: 'clerkuser' });
  });
  const prepare = vi.spyOn(fixtures.session, 'prepareSecondFactorVerification');
  const hook = renderHook(
    () =>
      useUVFactorTwoPhoneCodeCardModel({
        strategy: 'phone_code',
        phoneNumberId: 'phone_1',
        safeIdentifier: '+1•••1234',
      }),
    { wrapper },
  );
  return { ...hook, prepare };
};

describe('Phone verification preparation boundary', () => {
  it('completes preparation without exposing the SDK verification resource', async () => {
    const { result, prepare } = await setup();
    prepare.mockResolvedValue({
      status: 'needs_second_factor',
      supportedSecondFactors: [],
    } as unknown as SessionVerificationResource);
    await expect(result.current.prepare()).resolves.toBeUndefined();
    expect(prepare).toHaveBeenCalledExactlyOnceWith({ strategy: 'phone_code', phoneNumberId: 'phone_1' });
  });

  it('preserves preparation errors for the interaction controller', async () => {
    const { result, prepare } = await setup();
    const error = new Error('Preparation failed');
    prepare.mockRejectedValue(error);
    await expect(result.current.prepare()).rejects.toBe(error);
  });
});
