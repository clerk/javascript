import type { EmailCodeFactor, PhoneCodeFactor } from '@clerk/shared/types';

import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorTwoCodeCard } from './SignInFactorTwoCodeForm';
import { SignInFactorTwoCodeForm } from './SignInFactorTwoCodeForm';

type Props = {
  props: SignInFactorTwoCodeCard & { factor: EmailCodeFactor | PhoneCodeFactor };
  prepare: () => Promise<void>;
  variant: 'email' | 'phone';
};

export const SignInFactorTwoChannelCodeView = ({ props, prepare, variant }: Props): JSX.Element => {
  if (variant === 'email') {
    return (
      <Flow.Part part='emailCode2Fa'>
        <SignInFactorTwoCodeForm
          {...props}
          cardTitle={localizationKeys('signIn.emailCodeMfa.title')}
          cardSubtitle={localizationKeys('signIn.emailCodeMfa.subtitle')}
          inputLabel={localizationKeys('signIn.emailCodeMfa.formTitle')}
          resendButton={localizationKeys('signIn.emailCodeMfa.resendButton')}
          prepare={prepare}
        />
      </Flow.Part>
    );
  }

  return (
    <Flow.Part part='phoneCode2Fa'>
      <SignInFactorTwoCodeForm
        {...props}
        cardTitle={localizationKeys('signIn.phoneCodeMfa.title')}
        cardSubtitle={localizationKeys('signIn.phoneCodeMfa.subtitle')}
        inputLabel={localizationKeys('signIn.phoneCodeMfa.formTitle')}
        resendButton={localizationKeys('signIn.phoneCodeMfa.resendButton')}
        prepare={prepare}
      />
    </Flow.Part>
  );
};
