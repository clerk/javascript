import type { PhoneCodeFactor, SignInFactor } from '@clerk/shared/types';

import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';

import { type LocalizationKey } from '../../localization';
import { useSignInFactorOneAlternativeChannelCodeController } from './sign-in-factor-one-alternative-channel-code.controller';
import { useSignInFactorOneAlternativeChannelCodeModel } from './sign-in-factor-one-alternative-channel-code.model';
import { SignInFactorOneAlternativeChannelCodeView } from './sign-in-factor-one-alternative-channel-code.view';

export type SignInFactorOneAlternativeChannelCodeCard = Pick<
  VerificationCodeCardProps,
  'onShowAlternativeMethodsClicked' | 'showAlternativeMethods' | 'onBackLinkClicked'
> & {
  factor: PhoneCodeFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  onChangePhoneCodeChannel: (factor: SignInFactor) => void;
};

export type SignInFactorOneAlternativeChannelCodeFormProps = SignInFactorOneAlternativeChannelCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton: LocalizationKey;
};

export const SignInFactorOneAlternativeChannelCodeForm = (props: SignInFactorOneAlternativeChannelCodeFormProps) => {
  const model = useSignInFactorOneAlternativeChannelCodeModel(props);
  const controller = useSignInFactorOneAlternativeChannelCodeController(model);
  return (
    <SignInFactorOneAlternativeChannelCodeView
      cardTitle={props.cardTitle}
      cardSubtitle={props.cardSubtitle}
      inputLabel={props.inputLabel}
      resendButton={props.resendButton}
      onBackLinkClicked={props.onBackLinkClicked}
      {...controller}
    />
  );
};
