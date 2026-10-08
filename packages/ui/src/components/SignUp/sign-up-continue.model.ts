import { useClerk } from '@clerk/shared/react';
import { useContext } from 'react';

import { createUsernameError } from '@/ui/utils/usernameUtils';

import { useAuthenticationRequestScopeModel } from '../../common/authentication-request-scope.model';
import { SignInContext, useCoreSignUp, useEnvironment, useSignUpContext } from '../../contexts';
import { useLocalizations } from '../../customizables';
import { useRouter } from '../../router';
import type { ActiveIdentifier } from './signUpFormHelpers';
import {
  determineActiveFields,
  emailOrPhone,
  getInitialActiveIdentifier,
  minimizeFieldsForExistingSignup,
} from './signUpFormHelpers';
import { useCompleteSignUpFlow } from './useCompleteSignUpFlow';

export const useSignUpContinueModel = () => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const { displayConfig, userSettings } = useEnvironment();
  const { attributes, usernameSettings } = userSettings;
  const { t, locale } = useLocalizations();
  const {
    signInUrl,
    unsafeMetadata,
    initialValues = {},
    isCombinedFlow: combinedFlowEnabled,
    afterSignUpUrl,
    ssoCallbackUrl,
    oidcPrompt,
  } = useSignUpContext();
  const signUp = useCoreSignUp();
  const isWithinSignInContext = !!useContext(SignInContext);
  const isCombinedFlow = !!(combinedFlowEnabled && !!isWithinSignInContext);
  const isProgressiveSignUp = userSettings.signUp.progressive;
  const completeSignUpFlow = useCompleteSignUpFlow();
  const signUpId = signUp.id;
  const scope = useAuthenticationRequestScopeModel(
    'signUp',
    signUp,
    JSON.stringify([
      signUpId,
      initialValues,
      unsafeMetadata,
      isCombinedFlow,
      signInUrl,
      displayConfig.signUpUrl,
      afterSignUpUrl,
      ssoCallbackUrl,
      oidcPrompt,
    ]),
  );
  const canRun = () => scope.canRun() && signUp.id === signUpId;

  const onlyLegalConsentMissing =
    signUp.missingFields?.length === 1 &&
    signUp.missingFields[0] === 'legal_accepted' &&
    signUp.unverifiedFields?.length === 0;

  return {
    requestKey: scope.requestKey,
    canRun,
    hasSignUp: Boolean(signUp.id),
    isSetActiveInProgress: clerk.__internal_setActiveInProgress === true,
    navigateToSignUp: () => {
      if (canRun()) {
        return navigate(displayConfig.signUpUrl);
      }
      return;
    },
    initialValues,
    signUpEmailAddress: signUp.emailAddress,
    legalConsentRequired: userSettings.signUp.legal_consent_enabled || false,
    buildUsernameError: (errors: Parameters<typeof createUsernameError>[0]) =>
      createUsernameError(errors, { t, locale, usernameSettings }),
    initialActiveIdentifier: getInitialActiveIdentifier(attributes, isProgressiveSignUp),
    canToggleEmailPhone: emailOrPhone(attributes, isProgressiveSignUp),
    getFields: (activeCommIdentifierType: ActiveIdentifier, hasEmail: boolean) => {
      const fields = determineActiveFields({
        attributes,
        hasEmail,
        activeCommIdentifierType,
        signUp,
        isProgressiveSignUp,
        legalConsentRequired: userSettings.signUp.legal_consent_enabled,
      });
      minimizeFieldsForExistingSignup(fields, signUp);
      return fields;
    },
    isEmailAndPhoneMissing: () =>
      signUp.missingFields.includes('email_address') && signUp.missingFields.includes('phone_number'),
    submit: async (params: Parameters<typeof signUp.update>[0], canContinue: () => boolean = () => true) => {
      if (!canRun() || !canContinue()) {
        return;
      }
      try {
        const resource = await scope.run(() => signUp.update(unsafeMetadata ? { ...params, unsafeMetadata } : params));
        if (!resource || !canRun() || !canContinue()) {
          return;
        }
        await completeSignUpFlow({
          signUp: resource,
          verifyEmailPath: './verify-email-address',
          verifyPhonePath: './verify-phone-number',
          protectCheckPath: '../protect-check',
        });
      } catch (error) {
        if (canRun() && canContinue()) {
          throw error;
        }
      }
    },
    onlyLegalConsentMissing,
    hasOauthProviders: userSettings.authenticatableSocialStrategies.length > 0,
    hasVerifiedExternalAccount: signUp.verifications?.externalAccount?.status == 'verified',
    isCombinedFlow,
    getSignInHref: () => clerk.buildUrlWithAuth(signInUrl),
  };
};
