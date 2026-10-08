import { useCodePreparationController } from '@/ui/common/useCodePreparationController';
import { useCodeSubmissionController } from '@/ui/common/useCodeSubmissionController';

import { localizationKeys } from '../../customizables';
import type { SignInFactorTwoCodeData, SignInFactorTwoCodeViewProps } from './sign-in-code-form.types';
import type { SignInFactorTwoCodeFormProps } from './SignInFactorTwoCodeForm';

export const useSignInFactorTwoCodeFormController = (
  model: SignInFactorTwoCodeData,
  props: SignInFactorTwoCodeFormProps,
): SignInFactorTwoCodeViewProps => {
  const preparation = useCodePreparationController({
    requestKey: model.requestKey,
    canRun: model.canRun,
    shouldAvoidPrepare: !model.prepareFactor,
    shouldAvoidInitialPrepare: props.factorAlreadyPrepared || !model.prepareFactor,
    prepareRequest: async () => {
      try {
        await model.prepareFactor?.();
        if (model.canRun()) {
          props.onFactorPrepare();
        }
      } catch (error) {
        const recovery = model.getErrorRecovery(error);
        if (recovery) {
          await recovery.complete();
        } else {
          throw error;
        }
      }
    },
  });
  const prepare = model.prepareFactor ? preparation.prepare : undefined;
  const action = useCodeSubmissionController(model);

  return {
    cardTitle: props.cardTitle,
    cardSubtitle: model.resettingPassword ? localizationKeys('signIn.forgotPassword.subtitle') : props.cardSubtitle,
    cardNotice:
      props.showClientTrustNotice || model.showNewDeviceVerificationNotice
        ? localizationKeys('signIn.newDeviceVerificationNotice')
        : undefined,
    resendButton: props.resendButton,
    inputLabel: props.inputLabel,
    action,
    prepare,
    safeIdentifier: model.safeIdentifier,
    profileImageUrl: model.profileImageUrl,
    onShowAlternativeMethodsClicked: props.onShowAlternativeMethodsClicked,
    onDifferentAccountClicked: model.signInAsDifferentUser,
    resettingPassword: model.resettingPassword,
  };
};
