import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { getClerkQueryParam, removeClerkQueryParam } from '@clerk/shared/internal/clerk-js/queryParams';
import { useClerk } from '@clerk/shared/react';
import type { ClerkAPIError, SignInCreateParams, SignInResource } from '@clerk/shared/types';
import { isWebAuthnAutofillSupported, isWebAuthnSupported } from '@clerk/shared/webauthn';
import { useMemo, useRef } from 'react';

import { useAuthenticationRequestScopeModel } from '@/ui/common/authentication-request-scope.model';

import type { SignInStartIdentifier } from '../../common';
import { groupIdentifiers } from '../../common';
import { useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useTotalEnabledAuthMethods } from '../../hooks/useTotalEnabledAuthMethods';
import { useRouter } from '../../router';
import { buildRequest } from '../../utils/useFormControl';
import {
  shouldHandOffToEnterpriseConnection,
  shouldHandOffUnidentifiedToEnterpriseConnection,
} from './enterpriseSSOFactors';
import { handleCombinedFlowTransfer } from './handleCombinedFlowTransfer';
import { isProtectCheckRequiredError, navigateOnSignInProtectGate } from './handleProtectCheck';
import { SIGN_IN_RESET_PASSWORD_INTENT_PARAM } from './shared';
import { useSignInPasskeyModel } from './sign-in-passkey.model';
import type { SignInStartField, SignInStartModel, SignInStartRecovery } from './sign-in-start.types';
import {
  getPreferredAlternativePhoneChannel,
  getPreferredAlternativePhoneChannelForCombinedFlow,
  getSignUpAttributeFromIdentifier,
} from './utils';

const USER_VISIBLE_FIRST_FACTOR_ERROR_CODES = new Set<string>([
  ERROR_CODES.NOT_ALLOWED_TO_SIGN_UP,
  ERROR_CODES.OAUTH_ACCESS_DENIED,
  ERROR_CODES.NOT_ALLOWED_ACCESS,
  ERROR_CODES.SAML_USER_ATTRIBUTE_MISSING,
  ERROR_CODES.OAUTH_EMAIL_DOMAIN_RESERVED_BY_SAML,
  ERROR_CODES.USER_LOCKED,
  ERROR_CODES.EXTERNAL_ACCOUNT_NOT_FOUND,
  ERROR_CODES.SIGN_UP_MODE_RESTRICTED,
  ERROR_CODES.SIGN_UP_MODE_RESTRICTED_WAITLIST,
  ERROR_CODES.ENTERPRISE_SSO_USER_ATTRIBUTE_MISSING,
  ERROR_CODES.ENTERPRISE_SSO_EMAIL_ADDRESS_DOMAIN_MISMATCH,
  ERROR_CODES.ENTERPRISE_SSO_HOSTED_DOMAIN_MISMATCH,
  ERROR_CODES.SAML_EMAIL_ADDRESS_DOMAIN_MISMATCH,
  ERROR_CODES.ORGANIZATION_MEMBERSHIP_QUOTA_EXCEEDED_FOR_SSO,
  ERROR_CODES.CAPTCHA_INVALID,
  ERROR_CODES.FRAUD_DEVICE_BLOCKED,
  ERROR_CODES.FRAUD_ACTION_BLOCKED,
  ERROR_CODES.SIGNUP_RATE_LIMIT_EXCEEDED,
  ERROR_CODES.USER_BANNED,
  ERROR_CODES.USER_DEACTIVATED,
]);

export const useSignInStartModel = (): SignInStartModel => {
  const clerk = useClerk();
  const { userSettings, authConfig } = useEnvironment();
  const signIn = useCoreSignIn();
  const { navigate } = useRouter();
  const ctx = useSignInContext();
  const organizationTicket = getClerkQueryParam('__clerk_ticket') || '';
  const clerkStatus = getClerkQueryParam('__clerk_status') || '';
  const { requestKey, canRun, run } = useAuthenticationRequestScopeModel(
    'signIn',
    signIn,
    JSON.stringify([
      'start',
      organizationTicket,
      clerkStatus,
      ctx.isCombinedFlow,
      ctx.afterSignInUrl,
      ctx.afterSignUpUrl,
      ctx.ssoCallbackUrl,
    ]),
  );
  const redirecting = useRef({ key: requestKey, active: false });
  if (redirecting.current.key !== requestKey) {
    redirecting.current = { key: requestKey, active: false };
  }
  const redirectOwner = redirecting.current;
  const supportEmail = useSupportEmail();
  const totalEnabledAuthMethods = useTotalEnabledAuthMethods();
  const identifierAttributes = useMemo<SignInStartIdentifier[]>(
    () => groupIdentifiers(userSettings.enabledFirstFactorIdentifiers),
    [userSettings.enabledFirstFactorIdentifiers],
  );

  /**
   * Passkeys
   */
  const onSecondFactor = () => navigate('factor-two');
  const passkey = useSignInPasskeyModel(onSecondFactor, 'protect-check');
  // @ts-expect-error - This is not a public API
  const { __internal_isWebAuthnSupported } = clerk;
  const isWebSupported = (__internal_isWebAuthnSupported ?? isWebAuthnSupported)();

  const buildSignInParams = (fields: SignInStartField[]): SignInCreateParams => {
    const hasPassword = fields.some(field => field.name === 'password' && !!field.value);

    /**
     * FAPI will return an error when password is submitted but the user's email matches requires enterprise sso authentication.
     * We need to strip password from the create request, and reconstruct it later.
     */
    if (!hasPassword || userSettings.enterpriseSSO.enabled) {
      fields = fields.filter(field => field.name !== 'password');
    }
    return {
      ...buildRequest(fields),
      ...(hasPassword && !userSettings.enterpriseSSO.enabled && { strategy: 'password' }),
    } as SignInCreateParams;
  };

  const activateSession = (sessionId: string | null | undefined) =>
    clerk.setActive({
      session: sessionId,
      navigate: async ({ session, decorateUrl }) => {
        await ctx.navigateOnSetActive({ session, redirectUrl: ctx.afterSignInUrl, decorateUrl });
      },
    });

  const authenticateWithEnterpriseSSO = async () => {
    if (!canRun()) {
      return;
    }
    redirectOwner.active = true;
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'enterprise_sso',
        redirectUrl: ctx.ssoCallbackUrl,
        redirectUrlComplete: ctx.afterSignInUrl || '/',
        oidcPrompt: ctx.oidcPrompt,
        continueSignIn: true,
      });
    } catch (err) {
      redirectOwner.active = false;
      if (!canRun()) {
        return;
      }
      // Preparing the hand-off can itself raise a challenge. No redirect was issued and the sign-in
      // is sitting on the gate instead. Handled here because the callers' recovery path drops
      // errors that didn't come from the API.
      if (isProtectCheckRequiredError(err) && navigateOnSignInProtectGate(signIn, navigate, 'protect-check')) {
        return;
      }
      throw err;
    }
  };

  const completeSignIn = async (
    resource: SignInResource,
    { ticket = false, resetPasswordIntent = false }: { ticket?: boolean; resetPasswordIntent?: boolean } = {},
  ): Promise<void> => {
    if (!canRun()) {
      return;
    }
    if (navigateOnSignInProtectGate(resource, navigate, 'protect-check')) {
      return;
    }
    switch (resource.status) {
      case 'needs_identifier':
        if (ticket) {
          console.error(clerkInvalidFAPIResponse(resource.status, supportEmail));
        } else if (shouldHandOffUnidentifiedToEnterpriseConnection(resource)) {
          await authenticateWithEnterpriseSSO();
        }
        break;
      case 'needs_first_factor':
        if (shouldHandOffToEnterpriseConnection(resource)) {
          await authenticateWithEnterpriseSSO();
        } else if (resetPasswordIntent) {
          await navigate('factor-one', {
            searchParams: new URLSearchParams({ [SIGN_IN_RESET_PASSWORD_INTENT_PARAM]: 'true' }),
          });
        } else {
          await navigate('factor-one');
        }
        break;
      case 'needs_second_factor':
        await navigate('factor-two');
        break;
      case 'needs_client_trust':
        await navigate('client-trust');
        break;
      case 'complete':
        if (ticket) {
          removeClerkQueryParam('__clerk_ticket');
        }
        await activateSession(resource.createdSessionId);
        break;
      default:
        console.error(clerkInvalidFAPIResponse(resource.status, supportEmail));
    }
  };

  return {
    requestKey,
    canRun,
    navigateToTicketSignUp: async searchParams => {
      await run(async () => {
        await navigate(ctx.isCombinedFlow ? 'create' : ctx.signUpUrl, { searchParams });
      });
    },
    totalEnabledAuthMethods,
    identifierAttributes,
    initialValues: ctx.initialValues ? { ...ctx.initialValues } : undefined,
    signUpUrl: ctx.signUpUrl,
    waitlistUrl: ctx.waitlistUrl,
    isCombinedFlow: ctx.isCombinedFlow,
    signUpMode: userSettings.signUp.mode,
    standardFormAttributes: [...userSettings.enabledFirstFactorIdentifiers],
    hasSocialOrWeb3Buttons: Boolean(
      userSettings.authenticatableSocialStrategies.length ||
      userSettings.web3FirstFactors.length ||
      userSettings.alternativePhoneCodeChannels.length,
    ),
    showAlternativePhoneCodeProviders: userSettings.alternativePhoneCodeChannels.length > 0,
    passwordBasedInstance: userSettings.instanceIsPasswordBased,
    passkeyEnabled: userSettings.attributes.passkey?.enabled,
    showPasskeySignInButton: userSettings.passkeySettings.show_sign_in_button,
    passkeyRequestKey: passkey.requestKey,
    canAuthenticateWithPasskey: passkey.canRun,
    passkeyAutofillAllowed: !!(userSettings.passkeySettings.allow_autofill && userSettings.attributes.passkey?.enabled),
    checkPasskeyAutofillSupport: () => {
      const host = clerk as typeof clerk & { __internal_isWebAuthnAutofillSupported?: () => Promise<boolean> };
      return (host.__internal_isWebAuthnAutofillSupported ?? isWebAuthnAutofillSupported)();
    },
    authenticateWithPasskey: passkey.authenticateWithPasskey,
    isWebSupported,
    organizationTicket,
    clerkStatus,
    buildUrlWithAuth: (url: string) => clerk.buildUrlWithAuth(url),
    lastAuthenticationStrategy: clerk.client?.lastAuthenticationStrategy,
    getFirstFactorError: () => {
      if (!canRun()) {
        return undefined;
      }
      const error = signIn.firstFactorVerification?.error;
      if (!error) {
        return undefined;
      }
      return USER_VISIBLE_FIRST_FACTOR_ERROR_CODES.has(error.code) ? { kind: 'api_error', error } : { kind: 'unknown' };
    },
    clearFirstFactorError: async () => {
      await run(async () => {
        await signIn.create({});
      });
    },
    createTicketSignIn: async ticket => {
      await run(async () => {
        await completeSignIn(await signIn.create({ strategy: 'ticket', ticket }), { ticket: true });
      });
    },
    submit: async (fields, options) =>
      run(async () => {
        const identifier = fields.find(field => field.id === 'identifier');
        const attribute = getSignUpAttributeFromIdentifier({ type: identifier?.type, value: identifier?.value ?? '' });
        // If the user has already selected an alternative phone code provider, we use that.
        const channel =
          options.channel || getPreferredAlternativePhoneChannel(fields, authConfig.preferredChannels, 'identifier');
        if (channel) {
          // We need to send the alternative phone code provider channel in the sign in request
          // together with the phone_code strategy, in order for FAPI to create a Verification upon this first request.
          fields = [...fields, { id: 'strategy', value: 'phone_code' }, { id: 'channel', value: channel }];
        }
        // On top of the context-level preconditions, sign-up-if-missing only
        // supports identifiers that can be verified out-of-band.
        const hasPassword = fields.some(field => field.name === 'password' && !!field.value);
        const signUpIfMissing = ctx.signUpIfMissingEnabled && attribute !== 'username' && !hasPassword;
        let resource = await signIn.create({
          ...buildSignInParams(fields),
          ...(signUpIfMissing && { signUpIfMissing: true }),
        });
        if (!canRun()) {
          return;
        }
        const password = fields.find(field => field.name === 'password')?.value;
        if (
          userSettings.enterpriseSSO.enabled &&
          password &&
          !resource.supportedFirstFactors?.some(factor => factor.strategy === 'enterprise_sso')
        ) {
          resource = await resource.attemptFirstFactor({ strategy: 'password', password });
        }
        await completeSignIn(resource, options);
      }),
    isRedirectingToSSOProvider: () => canRun() && redirectOwner.active,
    recoverSignInError: async (error, identifier, channel) =>
      (await run<SignInStartRecovery>(async () => {
        if (!error || typeof error !== 'object' || !('errors' in error) || !Array.isArray(error.errors)) {
          return 'ignored';
        }
        const errors = error.errors as ClerkAPIError[];
        const instantPasswordError = errors.find(
          error =>
            error.code === ERROR_CODES.INVALID_STRATEGY_FOR_USER ||
            error.code === ERROR_CODES.FORM_PASSWORD_INCORRECT ||
            error.code === ERROR_CODES.FORM_PASSWORD_PWNED,
        );
        if (instantPasswordError) {
          return 'retry_identifier';
        }
        if (errors.some(error => error.code === ERROR_CODES.SESSION_EXISTS)) {
          await activateSession(clerk.client.lastActiveSessionId);
          return 'handled';
        }
        const alreadySignedIn = errors.find(error => error.code === 'identifier_already_signed_in');
        if (alreadySignedIn) {
          const sessionId = alreadySignedIn.meta?.sessionId;
          if (typeof sessionId !== 'string') {
            return 'unhandled';
          }
          await activateSession(sessionId);
          return 'handled';
        }
        const accountDoesNotExist = errors.some(
          error =>
            error.code === ERROR_CODES.INVITATION_ACCOUNT_NOT_EXISTS ||
            error.code === ERROR_CODES.FORM_IDENTIFIER_NOT_FOUND,
        );
        if (!ctx.isCombinedFlow || !accountDoesNotExist) {
          return 'unhandled';
        }
        const attribute = getSignUpAttributeFromIdentifier(identifier);
        await handleCombinedFlowTransfer({
          canRun,
          afterSignUpUrl: ctx.afterSignUpUrl || '/',
          clerk,
          handleError: error => {
            throw error;
          },
          identifierAttribute: attribute,
          identifierValue: identifier.value,
          navigate,
          organizationTicket,
          signUpMode: userSettings.signUp.mode,
          redirectUrl: ctx.ssoCallbackUrl,
          redirectUrlComplete: ctx.afterSignUpUrl || '/',
          oidcPrompt: ctx.oidcPrompt,
          navigateOnSetActive: ctx.navigateOnSetActive,
          passwordEnabled: userSettings.attributes.password?.required ?? false,
          alternativePhoneCodeChannel:
            channel ||
            getPreferredAlternativePhoneChannelForCombinedFlow(
              authConfig.preferredChannels,
              attribute,
              identifier.value,
            ),
          unsafeMetadata: ctx.unsafeMetadata,
        });
        return 'handled';
      })) ?? 'ignored',
  };
};
