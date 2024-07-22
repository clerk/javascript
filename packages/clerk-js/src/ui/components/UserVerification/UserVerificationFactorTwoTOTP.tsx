import { useClerk, useSession, useUser } from '@clerk/shared/react';

import { useUserVerification } from '../../contexts';
import { Flow } from '../../customizables';
import { VerificationCodeCard, type VerificationCodeCardProps } from '../../elements';

export function UserVerificationFactorTwoTOTP(): JSX.Element {
  const { afterVerification, routing } = useUserVerification();
  const { user } = useUser();
  const { setActive, closeUserVerification } = useClerk();
  const { session } = useSession();

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    user
      ?.verifySessionAttemptSecondFactor({
        code,
      })
      .then(async () => {
        await resolve();
        await session?.getToken({ skipCache: true });
        await setActive({ session: session?.id });
        console.log('www', afterVerification);

        if (routing === 'virtual') {
          /**
           * if `afterVerificationUrl` and modal redirect there,
           * else if `afterVerificationUrl` redirect there,
           * else If modal close it,
           */
          afterVerification?.();
          closeUserVerification();
        }
      })
      .catch(err => reject(err));
  };

  return (
    <Flow.Part part='totp2Fa'>
      <VerificationCodeCard
        cardTitle={'Verification required'}
        cardSubtitle={'In order to make changes, please verify it’s really you by entering the password.'}
        inputLabel={'Verification code'}
        onCodeEntryFinishedAction={action}
        profileImageUrl={user?.imageUrl}
      />
    </Flow.Part>
  );
}
