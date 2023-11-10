import type { SignInFactor, SignInStrategy } from '@clerk/types';

import {
  allStrategiesButtonsComparator,
  otpPrefFactorComparator,
  passwordPrefFactorComparator,
} from './factorSortingUtils';

describe('otpPrefFactorComparator(a,b)', function () {
  it('sorts an array of factors based on the otp pref sorter', function () {
    const factors: SignInFactor[] = [
      { strategy: 'password' },
      { strategy: 'password' },
      { strategy: 'email_code', emailAddressId: '', safeIdentifier: '' },
      { strategy: 'phone_code', phoneNumberId: '', safeIdentifier: '' },
      { strategy: 'email_link', emailAddressId: '', safeIdentifier: '' },
      { strategy: 'email_link', emailAddressId: '', safeIdentifier: '' },
    ];

    const expectedOrder: SignInStrategy[] = [
      'email_link',
      'email_link',
      'email_code',
      'phone_code',
      'password',
      'password',
    ];

    expect(factors.sort(otpPrefFactorComparator).map(f => f.strategy)).toEqual(expectedOrder);
  });
});

describe('passwordPrefFactorComparator(a,b)', function () {
  it('sorts an array of factors based on the password pref sorter', function () {
    const factors: SignInFactor[] = [
      { strategy: 'email_code', emailAddressId: '', safeIdentifier: '' },
      { strategy: 'password' },
      { strategy: 'phone_code', phoneNumberId: '', safeIdentifier: '' },
      { strategy: 'email_link', emailAddressId: '', safeIdentifier: '' },
      { strategy: 'password' },
      { strategy: 'email_link', emailAddressId: '', safeIdentifier: '' },
    ];

    const expectedOrder: SignInStrategy[] = [
      'password',
      'password',
      'email_link',
      'email_link',
      'email_code',
      'phone_code',
    ];

    expect(factors.sort(passwordPrefFactorComparator).map(f => f.strategy)).toEqual(expectedOrder);
  });
});

describe('allStrategiesButtonsComparator(a,b)', function () {
  it('sorts an array of factors based on the password pref sorter', function () {
    const factors: SignInFactor[] = [
      { strategy: 'email_code', emailAddressId: '', safeIdentifier: '' },
      { strategy: 'password' },
      { strategy: 'phone_code', phoneNumberId: '', safeIdentifier: '' },
      { strategy: 'email_link', emailAddressId: '', safeIdentifier: '' },
      { strategy: 'password' },
      { strategy: 'email_link', emailAddressId: '', safeIdentifier: '' },
    ];

    const expectedOrder: SignInStrategy[] = [
      'email_link',
      'email_link',
      'email_code',
      'phone_code',
      'password',
      'password',
    ];

    expect(factors.sort(allStrategiesButtonsComparator).map(f => f.strategy)).toEqual(expectedOrder);
  });
});
