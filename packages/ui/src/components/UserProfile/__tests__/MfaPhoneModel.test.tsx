import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';

import { useMfaPhoneCodeScreenModel } from '../mfa-phone-code-screen.model';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('SMS MFA model commands', () => {
  it('uses the selected phone for verification and returns generated backup codes as display data', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withPhoneNumber({ second_factors: ['phone_code'], used_for_second_factor: true });
      f.withBackupCode();
      f.withUser({
        phone_numbers: [{ id: 'phone_selected', phone_number: '+306911111111' }],
        two_factor_enabled: true,
      });
    });
    const phone = fixtures.clerk.user!.phoneNumbers[0];
    phone.prepareVerification.mockResolvedValue(phone);
    phone.attemptVerification.mockResolvedValue(phone);
    phone.setReservedForSecondFactor.mockImplementation(() => {
      phone.backupCodes = ['123456', '654321'];
      return Promise.resolve(phone);
    });
    const { result, rerender } = renderHook(() => useMfaPhoneCodeScreenModel(), { wrapper });

    act(() => {
      result.current.selectPhone('phone_selected');
    });
    rerender();
    expect(result.current.verifyPhone.verification.identifier).toBe('+306911111111');

    await act(async () => {
      await result.current.verifyPhone.verification.prepareVerification();
      await result.current.verifyPhone.verification.attemptVerification('111111');
      await result.current.verifyPhone.enableMfa();
    });
    rerender();

    expect(phone.prepareVerification).toHaveBeenCalledOnce();
    expect(phone.attemptVerification).toHaveBeenCalledExactlyOnceWith({ code: '111111' });
    expect(phone.setReservedForSecondFactor).toHaveBeenCalledExactlyOnceWith({ reserved: true });
    expect(result.current.hasNewBackupCodes).toBe(true);
    expect(result.current.backupCodes).toEqual(['123456', '654321']);
    expect(result.current.backupCodes).not.toBe(phone.backupCodes);
  });
});
