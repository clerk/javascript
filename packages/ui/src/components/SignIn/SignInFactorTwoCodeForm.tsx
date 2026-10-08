import type { EmailCodeFactor, PhoneCodeFactor, TOTPFactor } from '@clerk/shared/types';

import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';

import type { LocalizationKey } from '../../localization';
import { useSignInFactorTwoCodeFormController } from './sign-in-factor-two-code-form.controller';
import { useSignInFactorTwoCodeFormModel } from './sign-in-factor-two-code-form.model';
import { SignInFactorTwoCodeFormView } from './sign-in-factor-two-code-form.view';

export type SignInFactorTwoCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  showClientTrustNotice?: boolean;
  factor: EmailCodeFactor | PhoneCodeFactor | TOTPFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  prepare?: () => Promise<void>;
};

export type SignInFactorTwoCodeFormProps = SignInFactorTwoCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton?: LocalizationKey;
};

export const SignInFactorTwoCodeForm = (props: SignInFactorTwoCodeFormProps) => {
  const model = useSignInFactorTwoCodeFormModel(props);
  const controller = useSignInFactorTwoCodeFormController(model, props);

  return <SignInFactorTwoCodeFormView {...controller} />;
};
