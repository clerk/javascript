import type { UserProfileAccountSectionViewProps } from '@clerk/ui/mosaic/user-profile/user-profile-account-section/user-profile-account-section.view';
import type { UserProfileAddEmailViewProps } from '@clerk/ui/mosaic/user-profile/user-profile-add-email.view';

interface FixtureOptions {
  failAt?: UserProfileAddEmailViewProps['step'];
  onVerified?: (emailAddress: string) => void;
}

export function createUserProfileAddEmailFixture({ failAt, onVerified }: FixtureOptions = {}): Pick<
  UserProfileAccountSectionViewProps,
  'onSendEmailCode' | 'onVerifyEmailCode'
> {
  return {
    onSendEmailCode: async () => {
      await new Promise(resolve => setTimeout(resolve, 700));
      if (failAt === 'email') {
        throw new Error('We couldn’t send a code. Try again.');
      }
    },
    onVerifyEmailCode: async (emailAddress, code) => {
      await new Promise(resolve => setTimeout(resolve, 700));
      if (failAt === 'verify' || code === '000000') {
        throw new Error('That code is incorrect. Try again.');
      }
      onVerified?.(emailAddress);
    },
  };
}
