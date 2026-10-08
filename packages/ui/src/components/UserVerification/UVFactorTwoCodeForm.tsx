import type { PhoneCodeFactor, TOTPFactor } from '@clerk/shared/types';

import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';

import type { LocalizationKey } from '../../localization';
import { useUVCodeController } from './uv-code-action.controller';
import { useUVFactorTwoCodeModel } from './uv-factor-two-code.model';
import { UVFactorTwoCodeView } from './uv-factor-two-code.view';

export type UVFactorTwoCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  factor: PhoneCodeFactor | TOTPFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  prepare?: () => Promise<void>;
  showAlternativeMethods?: boolean;
};

type SignInFactorTwoCodeFormProps = UVFactorTwoCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton?: LocalizationKey;
  identityPreviewEditButtonAriaLabel: LocalizationKey;
};

export const UVFactorTwoCodeForm = (props: SignInFactorTwoCodeFormProps) => {
  const model = useUVFactorTwoCodeModel(props.factor);
  const controller = useUVCodeController(
    { ...model, prepare: props.prepare },
    props.factorAlreadyPrepared,
    props.onFactorPrepare,
  );
  return (
    <UVFactorTwoCodeView
      cardTitle={props.cardTitle}
      cardSubtitle={props.cardSubtitle}
      resendButton={props.resendButton}
      inputLabel={props.inputLabel}
      action={controller.action}
      prepare={controller.prepare ? () => void controller.prepare?.() : undefined}
      safeIdentifier={model.safeIdentifier}
      profileImageUrl={model.profileImageUrl}
      identityPreviewEditButtonAriaLabel={props.identityPreviewEditButtonAriaLabel}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      showAlternativeMethods={props.showAlternativeMethods}
    />
  );
};
