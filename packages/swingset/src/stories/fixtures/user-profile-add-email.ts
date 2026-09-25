import type { UserProfileEmailVerifier } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.types';
import type { UserProfileAccountSectionViewProps } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.view';

interface FixtureOptions {
  fail?: 'create' | 'verify';
  onCreated?: (id: string, emailAddress: string) => void;
  onVerified?: (id: string) => void;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function createUserProfileAddEmailFixture({ fail, onCreated, onVerified }: FixtureOptions = {}): Pick<
  UserProfileAccountSectionViewProps,
  'onCreateEmail' | 'getEmailVerifier'
> {
  const verifier = (id: string): UserProfileEmailVerifier => ({
    start: () => ({ method: 'code', sent: delay(700).then(() => undefined) }),
    verifyCode: async code => {
      await delay(700);
      if (fail === 'verify' || code === '000000') {
        throw new Error('That code is incorrect. Try again.');
      }
      onVerified?.(id);
    },
  });

  return {
    onCreateEmail: async emailAddress => {
      await delay(700);
      if (fail === 'create') {
        throw new Error('We couldn’t add this email. Try again.');
      }
      const id = `email_${Date.now()}`;
      onCreated?.(id, emailAddress);
      return verifier(id);
    },
    getEmailVerifier: verifier,
  };
}
