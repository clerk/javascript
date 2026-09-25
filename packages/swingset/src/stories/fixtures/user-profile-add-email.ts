import type { UserProfileAccountSectionViewProps } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.view';
import type { UserProfileAddEmailDialogProps } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-add-email.dialog';

import { settleAfter } from './simulated-latency';

interface FixtureOptions {
  failAt?: UserProfileAddEmailDialogProps['step'];
  onVerified?: (emailAddress: string) => void;
}

export function createUserProfileAddEmailFixture({ failAt, onVerified }: FixtureOptions = {}): Pick<
  UserProfileAccountSectionViewProps,
  'onSendEmailCode' | 'onVerifyEmailCode'
> {
  return {
    onSendEmailCode: async () => {
      await settleAfter(700);
      if (failAt === 'email') {
        throw new Error('We couldn’t send a code. Try again.');
      }
    },
    onVerifyEmailCode: async (emailAddress, code) => {
      await settleAfter(700);
      if (failAt === 'verify' || code === '000000') {
        throw new Error('That code is incorrect. Try again.');
      }
      onVerified?.(emailAddress);
    },
  };
}
