import { useClerk } from '@clerk/shared/react/index';
import type { ClerkAPIError } from '@clerk/types';
import { useCallback } from 'react';

import { ERROR_CODES, SIGN_UP_MODES } from '../../../../core/constants';
import { useForm } from '../../../../ui/utils/useFormControl';
import { buildSSOCallbackURL } from '../../../common';
import { useEnvironment, useSignInContext } from '../../../contexts';
import { useCardState } from '../../../elements';
import { useRouter } from '../../../router';
import { handleError } from '../../../utils';
import { handleCombinedFlowTransfer } from '../handleCombinedFlowTransfer';
import { getSignUpAttributeFromIdentifier } from '../utils';

export const useSignInStartErrorHandler = () => {
  const card = useCardState();
  const clerk = useClerk();
  const signInContext = useSignInContext();
  const { displayConfig, userSettings } = useEnvironment();
  const { navigate } = useRouter();

  const store = useForm('sign-in-start');

  const attemptToRecoverFromSignInError = useCallback(
    async (e: any, organizationTicket?: string) => {
      if (!e.errors) {
        return;
      }

      const identifierField = store.getState(a => a.identifier);
      const instantPasswordField = store.getState(a => a.password);

      const alreadySignedInError: ClerkAPIError = e.errors.find(
        (e: ClerkAPIError) => e.code === 'identifier_already_signed_in',
      );
      const accountDoesNotExistError: ClerkAPIError = e.errors.find(
        (e: ClerkAPIError) =>
          e.code === ERROR_CODES.INVITATION_ACCOUNT_NOT_EXISTS || e.code === ERROR_CODES.FORM_IDENTIFIER_NOT_FOUND,
      );

      if (alreadySignedInError) {
        const sid = alreadySignedInError.meta!.sessionId!;
        await clerk.setActive({ session: sid, redirectUrl: signInContext.afterSignInUrl });
      } else if (signInContext.isCombinedFlow && accountDoesNotExistError) {
        const attribute = getSignUpAttributeFromIdentifier(identifierField);

        if (userSettings.signUp.mode === SIGN_UP_MODES.WAITLIST) {
          const waitlistUrl = clerk.buildWaitlistUrl(
            attribute === 'emailAddress'
              ? {
                  initialValues: {
                    [attribute]: identifierField.value,
                  },
                }
              : {},
          );
          return navigate(waitlistUrl);
        }

        clerk.client.signUp[attribute] = identifierField.value;

        const redirectUrl = buildSSOCallbackURL(signInContext, displayConfig.signUpUrl);
        const redirectUrlComplete = signInContext.afterSignUpUrl || '/';

        return handleCombinedFlowTransfer({
          afterSignUpUrl: signInContext.afterSignUpUrl || '/',
          clerk,
          handleError: e =>
            handleError(
              e,
              [
                // @ts-expect-error TODO: Fix the type of the store to address this
                identifierField,
                // @ts-expect-error TODO: Fix the type of the store to address this
                instantPasswordField,
              ],
              card.setError,
            ),
          identifierAttribute: attribute,
          identifierValue: identifierField.value,
          navigate,
          organizationTicket,
          signUpMode: userSettings.signUp.mode,
          redirectUrl,
          redirectUrlComplete,
          passwordEnabled: userSettings.attributes.password.required,
        });
      } else {
        // TODO: This will not work since `identifierField` does not container setError or clearFeedback
        handleError(
          e,
          [
            // @ts-expect-error TODO: Fix the type of the store to address this
            identifierField,
            // @ts-expect-error TODO: Fix the type of the store to address this
            instantPasswordField,
          ],
          card.setError,
        );
      }
    },
    [
      card.setError,
      clerk,
      displayConfig.signUpUrl,
      navigate,
      signInContext,
      store,
      userSettings.attributes.password.required,
      userSettings.signUp.mode,
    ],
  );

  return attemptToRecoverFromSignInError;
};
