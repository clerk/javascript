import type { EmailCodeFactor, PhoneCodeFactor } from '@clerk/shared/types';

import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';

import type { LocalizationKey } from '../../localization';
import { useUVCodeController } from './uv-code-action.controller';
import { useUVFactorOneCodeModel } from './uv-factor-one-code.model';
import { UVFactorOneCodeView } from './uv-factor-one-code.view';

export type UVFactorOneCodeCard = Pick<
  VerificationCodeCardProps,
  'onShowAlternativeMethodsClicked' | 'showAlternativeMethods' | 'onBackLinkClicked'
> & {
  factor: EmailCodeFactor | PhoneCodeFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
};

export type UVFactorOneCodeFormProps = UVFactorOneCodeCard & {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton: LocalizationKey;
  identityPreviewEditButtonAriaLabel: LocalizationKey;
};

export const UVFactorOneCodeForm = (props: UVFactorOneCodeFormProps) => {
  const model = useUVFactorOneCodeModel(props.factor);
  const controller = useUVCodeController(model, props.factorAlreadyPrepared, props.onFactorPrepare);
  return (
    <UVFactorOneCodeView
      cardTitle={props.cardTitle}
      cardSubtitle={props.cardSubtitle}
      inputLabel={props.inputLabel}
      resendButton={props.resendButton}
      identityPreviewEditButtonAriaLabel={props.identityPreviewEditButtonAriaLabel}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      showAlternativeMethods={props.showAlternativeMethods}
      onBackLinkClicked={props.onBackLinkClicked}
      safeIdentifier={model.safeIdentifier}
      profileImageUrl={model.profileImageUrl}
      action={controller.action}
      prepare={() => void controller.prepare?.()}
    />
  );
};
