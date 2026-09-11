import type { UserProfileAccountSectionViewProps } from '@clerk/ui/mosaic/user-profile/user-profile-account-section/user-profile-account-section.view';
import type { UserProfileAddPhoneViewProps } from '@clerk/ui/mosaic/user-profile/user-profile-add-phone.view';

interface FixtureOptions {
  failAt?: UserProfileAddPhoneViewProps['step'];
  onVerified?: (phoneNumber: string) => void;
}

export function createUserProfileAddPhoneFixture({ failAt, onVerified }: FixtureOptions = {}): Pick<
  UserProfileAccountSectionViewProps,
  'onSendPhoneCode' | 'onVerifyPhoneCode'
> {
  return {
    onSendPhoneCode: async () => {
      await new Promise(resolve => setTimeout(resolve, 700));
      if (failAt === 'phone') {
        throw new Error('We couldn’t send a code. Try again.');
      }
    },
    onVerifyPhoneCode: async (phoneNumber, code) => {
      await new Promise(resolve => setTimeout(resolve, 700));
      if (failAt === 'verify' || code === '000000') {
        throw new Error('That code is incorrect. Try again.');
      }
      onVerified?.(phoneNumber);
    },
  };
}
