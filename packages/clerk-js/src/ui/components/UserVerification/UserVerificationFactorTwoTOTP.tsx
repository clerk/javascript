import { useClerk } from '@clerk/shared/react';
import type { TOTPFactor } from '@clerk/types';

import { useUserVerification } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { useRouter } from '../../router';
import type { UVFactorTwoCodeCard } from './UVFactorTwoCodeForm';
import { UVFactorTwoCodeForm } from './UVFactorTwoCodeForm';

type UVFactorTwoTOTPCardProps = UVFactorTwoCodeCard & { factor: TOTPFactor };

export function UserVerificationFactorTwoTOTP(props: UVFactorTwoTOTPCardProps): JSX.Element {
  const { afterVerification, routing, afterVerificationUrl } = useUserVerification();
  const { closeUserVerification } = useClerk();
  const { navigate } = useRouter();

  const beforeEmit = async () => {
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
  };

  return (
    <Flow.Part part='totp2Fa'>
      <UVFactorTwoCodeForm
        {...props}
        beforeEmit={beforeEmit}
        cardTitle={localizationKeys('signIn.totpMfa.title')}
        cardSubtitle={localizationKeys('signIn.totpMfa.subtitle')}
        inputLabel={localizationKeys('signIn.totpMfa.formTitle')}
      />
    </Flow.Part>
  );
}
