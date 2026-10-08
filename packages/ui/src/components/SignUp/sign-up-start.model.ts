import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { SIGN_UP_MODES } from '@clerk/shared/internal/clerk-js/constants';
import { getClerkQueryParam } from '@clerk/shared/internal/clerk-js/queryParams';
import { useClerk } from '@clerk/shared/react';
import type { SignUpCreateParams, SignUpResource } from '@clerk/shared/types';
import { useContext, useRef } from 'react';

import { createPasswordError } from '@/ui/utils/passwordUtils';
import { createUsernameError } from '@/ui/utils/usernameUtils';

import { useAuthenticationRequestScopeModel } from '../../common/authentication-request-scope.model';
import { SignInContext, useCoreSignUp, useEnvironment, useSignUpContext } from '../../contexts';
import { useAppearance, useLocalizations } from '../../customizables';
import { useRouter } from '../../router';
import { getPreferredAlternativePhoneChannelForCombinedFlow } from '../SignIn/utils';
import type { SignUpStartData } from './sign-up-start.types';
import type { ActiveIdentifier } from './signUpFormHelpers';
import { determineActiveFields, emailOrPhone, getInitialActiveIdentifier, showFormFields } from './signUpFormHelpers';
import { useCompleteSignUpFlow } from './useCompleteSignUpFlow';

export const useSignUpStartModel = (): SignUpStartData => {
  const clerk = useClerk();
  const signUp = useCoreSignUp();
  const { showOptionalFields } = useAppearance().parsedOptions;
  const { userSettings, authConfig } = useEnvironment();
  const { navigate } = useRouter();
  const { attributes } = userSettings;
  const ctx = useSignUpContext();
  const isWithinSignInContext = !!useContext(SignInContext);
  const { signInUrl, unsafeMetadata } = ctx;
  const completeSignUpFlow = useCompleteSignUpFlow();
  const isCombinedFlow = !!(ctx.isCombinedFlow && !!isWithinSignInContext);
  const { t, locale } = useLocalizations();
  const initialValues = ctx.initialValues || {};
  const { passwordSettings, usernameSettings } = userSettings;

  const getTicket = () => getClerkQueryParam('__clerk_ticket') || getClerkQueryParam('__clerk_invitation_token');

  const scope = useAuthenticationRequestScopeModel(
    'signUp',
    signUp,
    JSON.stringify([getTicket(), isCombinedFlow, ctx.afterSignUpUrl, ctx.ssoCallbackUrl, ctx.oidcPrompt]),
  );

  const redirecting = useRef({ key: scope.requestKey, active: false });
  if (redirecting.current.key !== scope.requestKey) {
    redirecting.current = { key: scope.requestKey, active: false };
  }
  const redirectOwner = redirecting.current;
  const complete = async (resource: SignUpResource, continuePath?: string) => {
    if (!scope.canRun()) {
      return;
    }
    redirectOwner.active = false;
    const redirectsToSSO =
      resource.status === 'missing_requirements' &&
      !resource.protectCheck &&
      !resource.missingFields.includes('protect_check') &&
      resource.missingFields.includes('enterprise_sso');
    await completeSignUpFlow({
      signUp: resource,
      verifyEmailPath: 'verify-email-address',
      verifyPhonePath: 'verify-phone-number',
      protectCheckPath: 'protect-check',
      continuePath,
    });
    if (scope.canRun()) {
      redirectOwner.active = redirectsToSSO;
    }
  };

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    initialValues: {
      firstName: signUp.firstName || initialValues.firstName || '',
      lastName: signUp.lastName || initialValues.lastName || '',
      emailAddress: signUp.emailAddress || initialValues.emailAddress || '',
      username: signUp.username || initialValues.username || '',
      phoneNumber: signUp.phoneNumber || initialValues.phoneNumber || '',
    },
    getInitialActiveIdentifier: () =>
      getInitialActiveIdentifier(attributes, userSettings.signUp.progressive, {
        phoneNumber: ctx.initialValues?.phoneNumber === null ? undefined : ctx.initialValues?.phoneNumber,
        emailAddress: ctx.initialValues?.emailAddress === null ? undefined : ctx.initialValues?.emailAddress,
        ...(isCombinedFlow
          ? {
              emailAddress: signUp.emailAddress,
              phoneNumber: signUp.phoneNumber,
            }
          : {}),
      }),
    legalConsentRequired: userSettings.signUp.legal_consent_enabled || false,
    buildUsernameError: (errors: Parameters<typeof createUsernameError>[0]) =>
      createUsernameError(errors, { t, locale, usernameSettings }),
    buildPasswordError: (errors: Parameters<typeof createPasswordError>[0]) =>
      createPasswordError(errors, { t, locale, passwordSettings }),
    getTicket,
    hasExistingSignUpWithTicket: () => Boolean(signUp.id && signUp.status !== null && getTicket()),
    getFields: (activeCommIdentifierType: ActiveIdentifier, hasTicket: boolean, hasEmail: boolean) =>
      determineActiveFields({
        attributes,
        hasTicket,
        hasEmail,
        activeCommIdentifierType,
        isProgressiveSignUp: userSettings.signUp.progressive,
        legalConsentRequired: userSettings.signUp.legal_consent_enabled,
      }),
    canToggleEmailPhone: emailOrPhone(attributes, userSettings.signUp.progressive),
    createTicket: async ticket => {
      if (!scope.canRun()) {
        return;
      }
      redirectOwner.active = false;
      const resource = await scope.run(() => signUp.create({ strategy: 'ticket', ticket, unsafeMetadata }));
      if (!resource) {
        return;
      }
      return {
        emailAddress: resource.emailAddress || '',
        hasMissingRequirements: resource.status === 'missing_requirements',
        complete: async () => {
          await complete(resource, 'continue');
        },
      };
    },
    isRedirectingToSSOProvider: () => scope.canRun() && redirectOwner.active,
    getOAuthError: () => signUp.verifications.externalAccount.error,
    resetOAuthAttempt: async () => {
      if (!scope.canRun()) {
        return;
      }
      redirectOwner.active = false;
      await scope.run(() => signUp.create({}));
    },
    getAlternativePhoneCodeProvider: channel => getAlternativePhoneCodeProviderData(channel) || null,
    submit: async (fields, { useTicket, channel }) => {
      if (!scope.canRun()) {
        return;
      }
      redirectOwner.active = false;
      const params: SignUpCreateParams = { ...fields };
      if (unsafeMetadata) {
        params.unsafeMetadata = unsafeMetadata;
      }
      if (useTicket) {
        params.strategy = 'ticket';
        if (!params.ticket) {
          const ticket = getTicket();
          if (ticket) {
            params.ticket = ticket;
          }
        }
      }
      const preferredChannel =
        channel ||
        (!params.strategy
          ? getPreferredAlternativePhoneChannelForCombinedFlow(
              authConfig.preferredChannels,
              'phoneNumber',
              params.phoneNumber || '',
            )
          : null);
      if (preferredChannel) {
        params.strategy = 'phone_code';
        params.channel = preferredChannel;
      }
      try {
        const resource = await scope.run(() => (useTicket ? signUp.upsert(params) : signUp.create(params)));
        if (!resource) {
          return;
        }
        await complete(resource);
      } catch (error) {
        if (!scope.canRun()) {
          return;
        }
        if (
          isClerkAPIResponseError(error) &&
          error.errors?.[0]?.code === 'enterprise_connection_id_is_required_with_multiple_connections'
        ) {
          await navigate('./enterprise-connections');
          return;
        }
        throw error;
      }
    },
    showOptionalFields,
    showFormFields: showFormFields(userSettings),
    hasOauthProviders: userSettings.authenticatableSocialStrategies.length > 0,
    hasWeb3Providers: userSettings.web3FirstFactors.length > 0,
    hasAlternativePhoneCodeProviders: userSettings.alternativePhoneCodeChannels.length > 0,
    isPublicMode: userSettings.signUp.mode === SIGN_UP_MODES.PUBLIC,
    isCombinedFlow,
    getSignInHref: () => clerk.buildUrlWithAuth(signInUrl),
  };
};
