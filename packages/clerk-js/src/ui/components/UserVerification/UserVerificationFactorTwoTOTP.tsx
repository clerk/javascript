import { useClerk, useSession, useUser } from '@clerk/shared/react';

import { useUserVerification } from '../../contexts';
import { Flow } from '../../customizables';
import { VerificationCodeCard, type VerificationCodeCardProps } from '../../elements';
import { useRouter } from '../../router';

export function UserVerificationFactorTwoTOTP(): JSX.Element {
  const { afterVerification, routing, afterVerificationUrl } = useUserVerification();
  const { user } = useUser();
  const { setActive, closeUserVerification } = useClerk();
  const { session } = useSession();
  const { navigate } = useRouter();

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    user
      ?.verifySessionAttemptSecondFactor({
        code,
      })
      .then(async () => {
        await resolve();
        await session?.getToken({ skipCache: true });
        await setActive({ session: session?.id });

        if (routing === 'virtual') {
          /**
           * if `afterVerificationUrl` and modal redirect there,
           * else if `afterVerificationUrl` redirect there,
           * else If modal close it,
           */
          afterVerification?.();
          closeUserVerification();
        } else {
          if (afterVerificationUrl) {
            await navigate(afterVerificationUrl);
          }
        }
      })
      .catch(err => reject(err));
  };

  return (
    <Flow.Part part='totp2Fa'>
      <VerificationCodeCard
        // @ts-expect-error
        cardTitle={'Verification required'}
        // @ts-expect-error
        cardSubtitle={'In order to make changes, please verify it’s really you by entering the password.'}
        // @ts-expect-error
        inputLabel={'Verification code'}
        onCodeEntryFinishedAction={action}
        profileImageUrl={user?.imageUrl}
      />
    </Flow.Part>
  );
}
