import type { UserProfileAddPhoneControllerOptions } from '@clerk/ui/mosaic/user-profile/user-profile-add-phone.controller';
import type { UserProfileAddPhoneViewProps } from '@clerk/ui/mosaic/user-profile/user-profile-add-phone.view';

interface FixtureOptions {
  failAt?: UserProfileAddPhoneViewProps['step'];
  onVerified?: (phoneNumber: string) => void;
}

export function createUserProfileAddPhoneFixture({
  failAt,
  onVerified,
}: FixtureOptions = {}): UserProfileAddPhoneControllerOptions {
  return {
    initialPhoneNumber: '+18015558181',
    onSend: async () => {
      await new Promise(resolve => setTimeout(resolve, 700));
      if (failAt === 'phone') {
        throw new Error('We couldn’t send a code. Try again.');
      }
    },
    onVerify: async (phoneNumber, code) => {
      await new Promise(resolve => setTimeout(resolve, 700));
      if (failAt === 'verify' || code === '000000') {
        throw new Error('That code is incorrect. Try again.');
      }
      onVerified?.(phoneNumber);
    },
  };
}
