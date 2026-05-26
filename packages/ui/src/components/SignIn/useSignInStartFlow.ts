import { SIGN_UP_MODES } from '@clerk/shared/internal/clerk-js/constants';
import { getClerkQueryParam, removeClerkQueryParam } from '@clerk/shared/internal/clerk-js/queryParams';
import { useClerk } from '@clerk/shared/react';
import type { SignInResource } from '@clerk/shared/types';
import { isWebAuthnAutofillSupported, isWebAuthnSupported } from '@clerk/shared/webauthn';
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { isMobileDevice } from '@/ui/utils/isMobileDevice';
import type { FormControlState } from '@/ui/utils/useFormControl';
import { buildRequest, useFormControl } from '@/ui/utils/useFormControl';

import type { SignInStartIdentifier } from '../../common';
import { getIdentifierControlDisplayValues, groupIdentifiers } from '../../common';
import { useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { useLoadingStatus } from '../../hooks';
import { useTotalEnabledAuthMethods } from '../../hooks/useTotalEnabledAuthMethods';
import { useRouter } from '../../router';
import { handleCombinedFlowTransfer } from './handleCombinedFlowTransfer';
import { hasMultipleEnterpriseConnections, useHandleAuthenticateWithPasskey } from './shared';
import type { SignInStartEffect, SignInStartEvent, SignInStartState } from './signInStartMachine';
import { initSignInStartState, signInStartReducer } from './signInStartMachine';
import {
  getPreferredAlternativePhoneChannel,
  getPreferredAlternativePhoneChannelForCombinedFlow,
  getSignUpAttributeFromIdentifier,
} from './utils';

export type SignInStartViewConfig = {
  identifierAttributes: SignInStartIdentifier[];
  currentIdentifier: ReturnType<typeof getIdentifierControlDisplayValues>['currentIdentifier'];
  nextIdentifier: ReturnType<typeof getIdentifierControlDisplayValues>['nextIdentifier'];
  standardFormAttributes: string[];
  passwordBasedInstance: boolean;
  hasSocialOrWeb3Buttons: boolean;
  showAlternativePhoneCodeProviders: boolean;
  showPasskeyButton: boolean;
  isWebSupported: boolean;
  isCombinedFlow: boolean;
  signUpMode: string;
  signUpUrl: string;
  waitlistUrl: string;
  isWebAuthnAutofillSupported: boolean;
  isIdentifierLastAuthenticationStrategy: boolean;
};

function hasOnlyEnterpriseSSOFirstFactors(signIn: SignInResource): boolean {
  if (!signIn.supportedFirstFactors?.length) {
    return false;
  }
  return signIn.supportedFirstFactors.every(ff => ff.strategy === 'enterprise_sso');
}

function extractResult(res: SignInResource) {
  return {
    status: res.status ?? '',
    createdSessionId: res.createdSessionId,
    supportedFirstFactors: res.supportedFirstFactors,
    hasOnlyEnterpriseSSO: hasOnlyEnterpriseSSOFirstFactors(res),
    hasMultipleEnterpriseConnections: hasMultipleEnterpriseConnections(res.supportedFirstFactors),
  };
}

export function useSignInStartFlow() {
  const card = useCardState();
  const clerk = useClerk();
  const loadingStatus = useLoadingStatus();
  const { userSettings, authConfig } = useEnvironment();
  const signIn = useCoreSignIn();
  const { navigate } = useRouter();
  const ctx = useSignInContext();
  const totalEnabledAuthMethods = useTotalEnabledAuthMethods();

  const identifierAttributes = useMemo<SignInStartIdentifier[]>(
    () => groupIdentifiers(userSettings.enabledFirstFactorIdentifiers),
    [userSettings.enabledFirstFactorIdentifiers],
  );

  const alternativePhoneCodeChannels = userSettings.alternativePhoneCodeChannels;
  const hasSocialOrWeb3Buttons =
    !!userSettings.authenticatableSocialStrategies.length ||
    !!userSettings.web3FirstFactors.length ||
    !!alternativePhoneCodeChannels.length;

  const organizationTicket = getClerkQueryParam('__clerk_ticket') || '';
  const clerkStatus = getClerkQueryParam('__clerk_status') || '';

  const onlyPhoneNumberInitialValueExists =
    !!ctx.initialValues?.phoneNumber && !(ctx.initialValues.emailAddress || ctx.initialValues.username);
  const shouldStartWithPhoneNumberIdentifier =
    onlyPhoneNumberInitialValueExists && identifierAttributes.includes('phone_number');
  const initialIdentifier: SignInStartIdentifier = shouldStartWithPhoneNumberIdentifier
    ? 'phone_number'
    : identifierAttributes[0] || ('' as SignInStartIdentifier);

  const ctxInitialValues = ctx.initialValues || {};
  const initialValuesMap: Record<SignInStartIdentifier, string | undefined> = useMemo(
    () => ({
      email_address: ctxInitialValues.emailAddress,
      email_address_username: ctxInitialValues.emailAddress || ctxInitialValues.username,
      username: ctxInitialValues.username,
      phone_number: ctxInitialValues.phoneNumber,
    }),
    [ctx.initialValues],
  );

  const config = useMemo(
    () => ({
      identifierAttributes,
      initialIdentifier,
      initialIdentifierValue: initialValuesMap[initialIdentifier] || '',
      isCombinedFlow: ctx.isCombinedFlow,
      organizationTicket,
      clerkStatus,
      hasSocialOrWeb3Buttons,
      isMobile: isMobileDevice(),
      enterpriseSSOEnabled: userSettings.enterpriseSSO.enabled,
    }),
    [],
  );

  const [state, rawDispatch] = useReducer(
    (s: SignInStartState, e: SignInStartEvent) => signInStartReducer(s, e).state,
    config,
    initSignInStartState,
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const lastCaughtErrorRef = useRef<any>(null);

  // --- Form controls (kept in view layer for Form element integration) ---

  const { currentIdentifier: currentIdentifierConfig, nextIdentifier: nextIdentifierConfig } =
    getIdentifierControlDisplayValues(identifierAttributes, state.identifierAttribute);

  const textIdentifierField = useFormControl('identifier', initialValuesMap[state.identifierAttribute] || '', {
    ...currentIdentifierConfig,
    isRequired: true,
    transformer: value => value.trim(),
  });

  const phoneIdentifierField = useFormControl('identifier', initialValuesMap['phone_number'] || '', {
    ...currentIdentifierConfig,
    isRequired: true,
  });

  const identifierField = state.identifierAttribute === 'phone_number' ? phoneIdentifierField : textIdentifierField;

  const instantPasswordField = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__password'),
    placeholder: localizationKeys('formFieldInputPlaceholder__password') as any,
  });

  // --- Passkey support ---

  const onSecondFactor = useCallback(() => navigate('factor-two'), [navigate]);
  const authenticateWithPasskey = useHandleAuthenticateWithPasskey(onSecondFactor);
  const [webAuthnAutofillSupported, setWebAuthnAutofillSupported] = useState(false);
  const isWebSupported = isWebAuthnSupported();

  // --- Effect executor ---

  const executeEffect = useCallback(
    async (effect: SignInStartEffect) => {
      switch (effect.type) {
        case 'SIGN_IN_CREATE': {
          const fields: Array<FormControlState<string>> = [identifierField, instantPasswordField];
          const preferredChannel =
            stateRef.current.alternativePhoneCodeProvider?.channel ||
            getPreferredAlternativePhoneChannel(fields, authConfig.preferredChannels, 'identifier');

          if (preferredChannel) {
            const noop = () => {};
            fields.push({
              id: 'strategy',
              value: 'phone_code',
              clearFeedback: noop,
              setValue: noop,
              onChange: noop,
              setError: noop,
            } as any);
            fields.push({
              id: 'channel',
              value: preferredChannel,
              clearFeedback: noop,
              setValue: noop,
              onChange: noop,
              setError: noop,
            } as any);
          }

          const hasPassword = fields.some(f => f.name === 'password' && !!f.value);
          let filteredFields = [...fields];
          if (!hasPassword || userSettings.enterpriseSSO.enabled) {
            filteredFields = filteredFields.filter(f => f.name !== 'password');
          }
          const params = {
            ...buildRequest(filteredFields),
            ...(hasPassword && !userSettings.enterpriseSSO.enabled && { strategy: 'password' as const }),
          };

          try {
            let res = await signIn.create(params as any);

            if (userSettings.enterpriseSSO.enabled) {
              const passwordField = fields.find(f => f.name === 'password')?.value;
              if (passwordField && !res.supportedFirstFactors?.some(ff => ff.strategy === 'enterprise_sso')) {
                res = await res.attemptFirstFactor({ strategy: 'password', password: passwordField });
              }
            }

            dispatch({ type: 'SUBMIT_SUCCESS', result: extractResult(res) });
          } catch (e: any) {
            lastCaughtErrorRef.current = e;
            dispatch({
              type: 'SUBMIT_ERROR',
              result: {
                errors: e.errors || [],
                identifierType: identifierField.type as 'tel' | 'text' | 'email',
                identifierValue: identifierField.value,
              },
            });
          }
          break;
        }

        case 'SIGN_IN_CREATE_WITHOUT_PASSWORD': {
          const fields: Array<FormControlState<string>> = [identifierField];
          const preferredChannel =
            stateRef.current.alternativePhoneCodeProvider?.channel ||
            getPreferredAlternativePhoneChannel(fields, authConfig.preferredChannels, 'identifier');

          if (preferredChannel) {
            const noop = () => {};
            fields.push({
              id: 'strategy',
              value: 'phone_code',
              clearFeedback: noop,
              setValue: noop,
              onChange: noop,
              setError: noop,
            } as any);
            fields.push({
              id: 'channel',
              value: preferredChannel,
              clearFeedback: noop,
              setValue: noop,
              onChange: noop,
              setError: noop,
            } as any);
          }

          try {
            const res = await signIn.create(buildRequest(fields) as any);
            dispatch({ type: 'SUBMIT_SUCCESS', result: extractResult(res) });
          } catch (e: any) {
            lastCaughtErrorRef.current = e;
            dispatch({
              type: 'SUBMIT_ERROR',
              result: {
                errors: e.errors || [],
                identifierType: identifierField.type as 'tel' | 'text' | 'email',
                identifierValue: identifierField.value,
              },
            });
          }
          break;
        }

        case 'SIGN_IN_CREATE_TICKET': {
          try {
            const res = await signIn.create({ strategy: 'ticket', ticket: effect.ticket });
            dispatch({ type: 'TICKET_SUCCESS', result: extractResult(res) });
          } catch (e: any) {
            lastCaughtErrorRef.current = e;
            dispatch({
              type: 'TICKET_ERROR',
              result: {
                errors: e.errors || [],
                identifierType: identifierField.type as 'tel' | 'text' | 'email',
                identifierValue: identifierField.value,
              },
            });
          } finally {
            const isRedirectingToSSO = hasOnlyEnterpriseSSOFirstFactors(signIn);
            dispatch({ type: 'TICKET_DONE', isRedirectingToSSO: !!isRedirectingToSSO });
          }
          break;
        }

        case 'NAVIGATE':
          if (effect.searchParams) {
            const params = new URLSearchParams(effect.searchParams);
            void navigate(effect.to, { searchParams: params });
          } else {
            void navigate(effect.to);
          }
          break;

        case 'SET_ACTIVE':
          removeClerkQueryParam('__clerk_ticket');
          void clerk.setActive({
            session: effect.sessionId,
            navigate: async ({ session, decorateUrl }) => {
              await ctx.navigateOnSetActive({ session, redirectUrl: ctx.afterSignInUrl, decorateUrl });
            },
          });
          break;

        case 'SET_ACTIVE_LAST_SESSION':
          void clerk.setActive({
            session: clerk.client.lastActiveSessionId,
            navigate: async ({ session, decorateUrl }) => {
              await ctx.navigateOnSetActive({ session, redirectUrl: ctx.afterSignInUrl, decorateUrl });
            },
          });
          break;

        case 'SET_ACTIVE_SESSION':
          void clerk.setActive({
            session: effect.sessionId,
            navigate: async ({ session, decorateUrl }) => {
              await ctx.navigateOnSetActive({ session, redirectUrl: ctx.afterSignInUrl, decorateUrl });
            },
          });
          break;

        case 'ENTERPRISE_SSO_REDIRECT':
          void signIn.authenticateWithRedirect({
            strategy: 'enterprise_sso',
            redirectUrl: ctx.ssoCallbackUrl,
            redirectUrlComplete: ctx.afterSignInUrl || '/',
            oidcPrompt: ctx.oidcPrompt,
            continueSignIn: true,
          });
          break;

        case 'COMBINED_FLOW_TRANSFER': {
          const attribute = getSignUpAttributeFromIdentifier(identifierField);
          const identifierValue = identifierField.value;

          if (userSettings.signUp.mode === SIGN_UP_MODES.WAITLIST) {
            const waitlistUrl = clerk.buildWaitlistUrl(
              attribute === 'emailAddress' ? { initialValues: { [attribute]: identifierValue } } : {},
            );
            void navigate(waitlistUrl);
            return;
          }

          clerk.client.signUp[attribute] = identifierValue;

          void handleCombinedFlowTransfer({
            afterSignUpUrl: ctx.afterSignUpUrl || '/',
            clerk,
            handleError: e => handleError(e, [identifierField, instantPasswordField], card.setError),
            identifierAttribute: attribute,
            identifierValue,
            navigate,
            organizationTicket,
            signUpMode: userSettings.signUp.mode,
            redirectUrl: ctx.ssoCallbackUrl,
            redirectUrlComplete: ctx.afterSignUpUrl || '/',
            navigateOnSetActive: ctx.navigateOnSetActive,
            passwordEnabled: userSettings.attributes.password?.required ?? false,
            alternativePhoneCodeChannel:
              stateRef.current.alternativePhoneCodeProvider?.channel ||
              getPreferredAlternativePhoneChannelForCombinedFlow(
                authConfig.preferredChannels,
                attribute,
                identifierValue,
              ),
            unsafeMetadata: ctx.unsafeMetadata,
          });
          break;
        }

        case 'RESET_SIGN_IN':
          void signIn.create({});
          break;

        case 'NAVIGATE_SIGN_UP': {
          const params = effect.searchParams ? new URLSearchParams(effect.searchParams) : undefined;
          void navigate(ctx.isCombinedFlow ? 'create' : ctx.signUpUrl, { searchParams: params });
          break;
        }

        case 'HANDLE_FIELD_ERRORS':
          if (lastCaughtErrorRef.current) {
            handleError(lastCaughtErrorRef.current, [identifierField, instantPasswordField], card.setError);
            lastCaughtErrorRef.current = null;
          }
          break;

        case 'PASSKEY_AUTOFILL':
          break;
      }
    },
    [signIn, clerk, navigate, ctx, userSettings, authConfig, identifierField, instantPasswordField, card],
  );

  const dispatch = useCallback(
    (event: SignInStartEvent) => {
      const { effects } = signInStartReducer(stateRef.current, event);
      rawDispatch(event);

      for (const effect of effects) {
        void executeEffect(effect);
      }
    },
    [executeEffect],
  );

  // --- On mount: ticket flow ---

  useEffect(() => {
    if (!organizationTicket) {
      return;
    }

    if (clerkStatus === 'sign_up') {
      const searchParams: Record<string, string> = {};
      if (organizationTicket) {
        searchParams['__clerk_ticket'] = organizationTicket;
      }
      void navigate(ctx.isCombinedFlow ? 'create' : ctx.signUpUrl, {
        searchParams: new URLSearchParams(searchParams),
      });
      return;
    }

    loadingStatus.setLoading();
    card.setLoading();
    dispatch({ type: 'TICKET_PROCESSING' });
  }, []);

  // --- On mount: OAuth error recovery ---

  useEffect(() => {
    const error = signIn?.firstFactorVerification?.error;
    if (error) {
      dispatch({ type: 'OAUTH_ERROR', error });
    }
  }, []);

  // --- On mount: passkey autofill ---

  useEffect(() => {
    const { passkeySettings, attributes } = userSettings;
    if (passkeySettings.allow_autofill && attributes.passkey?.enabled) {
      (async () => {
        const supported = await isWebAuthnAutofillSupported();
        setWebAuthnAutofillSupported(supported);
        if (supported) {
          await authenticateWithPasskey({ flow: 'autofill' });
        }
      })();
    }
  }, []);

  // --- Sync identifier field value changes to reducer for autofill phone switching ---

  useLayoutEffect(() => {
    if (identifierField.value.startsWith('+')) {
      dispatch({ type: 'AUTOFILL_PHONE_SWITCH', value: identifierField.value });
    }
  }, [identifierField.value]);

  // --- Sync card state from reducer ---

  useEffect(() => {
    if (state.cardError !== undefined) {
      card.setError(state.cardError);
    }
  }, [state.cardError]);

  useEffect(() => {
    if (state.isSubmitting) {
      card.setLoading();
      loadingStatus.setLoading();
    } else {
      card.setIdle();
      loadingStatus.setIdle();
    }
  }, [state.isSubmitting]);

  // --- View config (derived from environment, stable) ---

  const lastAuthenticationStrategy = clerk.client?.lastAuthenticationStrategy;
  // @ts-expect-error `validLastAuthenticationStrategies` is not typed on props
  const validLastAuthenticationStrategies = identifierField.props.validLastAuthenticationStrategies;
  const isIdentifierLastAuthenticationStrategy =
    lastAuthenticationStrategy && totalEnabledAuthMethods > 1
      ? validLastAuthenticationStrategies?.has(lastAuthenticationStrategy)
      : false;

  const viewConfig: SignInStartViewConfig = useMemo(
    () => ({
      identifierAttributes,
      currentIdentifier: currentIdentifierConfig,
      nextIdentifier: nextIdentifierConfig,
      standardFormAttributes: userSettings.enabledFirstFactorIdentifiers as unknown as string[],
      passwordBasedInstance: userSettings.instanceIsPasswordBased,
      hasSocialOrWeb3Buttons,
      showAlternativePhoneCodeProviders: alternativePhoneCodeChannels.length > 0,
      showPasskeyButton:
        !!userSettings.attributes.passkey?.enabled && !!userSettings.passkeySettings.show_sign_in_button,
      isWebSupported,
      isCombinedFlow: ctx.isCombinedFlow,
      signUpMode: userSettings.signUp.mode,
      signUpUrl: ctx.signUpUrl,
      waitlistUrl: ctx.waitlistUrl,
      isWebAuthnAutofillSupported: webAuthnAutofillSupported,
      isIdentifierLastAuthenticationStrategy: !!isIdentifierLastAuthenticationStrategy,
    }),
    [
      identifierAttributes,
      currentIdentifierConfig,
      nextIdentifierConfig,
      userSettings,
      hasSocialOrWeb3Buttons,
      ctx.isCombinedFlow,
      ctx.signUpUrl,
      ctx.waitlistUrl,
      isWebSupported,
      webAuthnAutofillSupported,
      isIdentifierLastAuthenticationStrategy,
    ],
  );

  return {
    state,
    dispatch,
    viewConfig,
    identifierField,
    phoneIdentifierField,
    instantPasswordField,
    authenticateWithPasskey,
    card,
    clerk,
    loadingStatus,
  };
}
