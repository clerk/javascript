import type { UserProfilePhoneVerifier } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.types';
import type { UserProfileAccountSectionViewProps } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.view';

interface FixtureOptions {
  fail?: 'create' | 'verify';
  onCreated?: (id: string, phoneNumber: string) => void;
  onVerified?: (id: string) => void;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function createUserProfileAddPhoneFixture({ fail, onCreated, onVerified }: FixtureOptions = {}): Pick<
  UserProfileAccountSectionViewProps,
  'onCreatePhone' | 'getPhoneVerifier'
> {
  const verifier = (id: string): UserProfilePhoneVerifier => ({
    sendCode: () => delay(700).then(() => undefined),
    verifyCode: async code => {
      await delay(700);
      if (fail === 'verify' || code === '000000') {
        throw new Error('That code is incorrect. Try again.');
      }
      onVerified?.(id);
    },
  });

  return {
    onCreatePhone: async phoneNumber => {
      await delay(700);
      if (fail === 'create') {
        throw new Error('We couldn’t add this phone number. Try again.');
      }
      const id = `phone_${Date.now()}`;
      onCreated?.(id, phoneNumber);
      return verifier(id);
    },
    getPhoneVerifier: verifier,
  };
}
