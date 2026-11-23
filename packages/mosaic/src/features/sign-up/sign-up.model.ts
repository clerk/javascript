import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';
import { iconImageUrl } from '@clerk/shared/constants';
import type { ClerkError } from '@clerk/shared/error';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { actionBlockedDetailsFrom } from '@clerk/shared/internal/clerk-js/actionBlocked';
import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { getSignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { validate as validateComplexity } from '@clerk/shared/internal/clerk-js/passwords/complexity';
import { createLoadZxcvbn } from '@clerk/shared/internal/clerk-js/passwords/loadZxcvbn';
import { createValidatePasswordStrength } from '@clerk/shared/internal/clerk-js/passwords/strength';
import { runProtectCheck } from '@clerk/shared/internal/clerk-js/protectCheckRunner';
import { getClerkQueryParam, removeClerkQueryParam } from '@clerk/shared/internal/clerk-js/queryParams';
import { buildTaskUrl } from '@clerk/shared/internal/clerk-js/sessionTasks';
import type { ActiveIdentifier } from '@clerk/shared/internal/clerk-js/signUpFormFields';
import {
  determineActiveFields,
  emailOrPhone,
  getInitialActiveIdentifier,
  showFormFields,
} from '@clerk/shared/internal/clerk-js/signUpFormFields';
import { buildURL } from '@clerk/shared/internal/clerk-js/url';
import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import { getPreferredPhoneCodeChannelByCountry } from '@clerk/shared/phone';
import { __internal_useClerkSignal, useClerk, useSession } from '@clerk/shared/react';
import type {
  ClerkAPIError,
  OAuthStrategy,
  PhoneCodeChannel,
  SessionTask,
  SetActiveNavigate,
  SignInFutureResource,
  SignInStatus,
  SignUpFutureResource,
  SignUpInitialValues,
  UserSettingsResource,
} from '@clerk/shared/types';
import { useMemo } from 'react';

import type { AuthActionBlockedDetails, AuthProvider } from '../../blocks/auth';
import type { FieldFeedback, FormFieldErrors } from '../../components/form';
import { FormSubmitError } from '../../components/form';
import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { useMosaicRouter } from '../../hooks/use-mosaic-router';
import { useMosaicSupportEmail } from '../../hooks/use-mosaic-support-email';
import { useErrorText, useLocale, useMessages } from '../../localization';
import { save, SaveError, UNEXPECTED_ERROR } from '../../utils/errors';
import type { AuthSessionPhase } from '../auth-flow/auth-flow.types';
import { passwordError } from '../user-profile/user-profile-password-section/user-profile-password-errors';
import { passwordFieldFeedback } from '../user-profile/user-profile-password-section/user-profile-password-feedback';
import type { SignUpTaskKey } from './sign-up.routes';
import type { SignUpFieldName, SignUpFields, SignUpLegalConsent } from './sign-up.types';
import { continueCanSatisfy, continueFields, missesEitherIdentifier, signUpFieldOrder } from './sign-up.utils';

export interface SignUpDetailsValues {
  emailAddress?: string;
  phoneNumber?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  legalAccepted?: boolean;
}

export type SignUpIdentifier = Exclude<ActiveIdentifier, undefined>;

export type SignUpPrefill = Required<
  Pick<SignUpDetailsValues, 'emailAddress' | 'phoneNumber' | 'username' | 'firstName' | 'lastName'>
>;

export interface SignUpModelOptions {
  initialValues?: SignUpInitialValues;
  unsafeMetadata?: SignUpUnsafeMetadata;
  showOptionalFields?: boolean;
}

export interface SignUpFlowModel {
  signUpId: string | undefined;
  step: SignUpNextStep;
  session: AuthSessionPhase<SignUpTaskKey>;
  singleSession: boolean;
  mode: 'public' | 'restricted' | 'waitlist';
  afterSignUpUrl: string;
  leave: () => void;
  ticket: string | undefined;
  redeemTicket: () => Promise<{ result: SignUpCreateResult; emailAddress: string }>;
  isReturning: boolean;
  completeReturn: () => Promise<SignUpNextStep | undefined>;
  finalize: () => Promise<void>;
  reset: () => Promise<void>;
}

export interface SignUpAppModel {
  applicationName: string;
  applicationLogoUrl?: string;
  renderBranding: boolean;
}

export interface SignUpNavigationModel {
  goToSignIn: () => void;
  joinWaitlist?: () => void;
  emailSupport?: () => void;
}

export type SignUpCreateResult = SignUpNextStep | { type: 'blocked'; details: AuthActionBlockedDetails };

export interface SignUpDetailsModel {
  initialIdentifier: SignUpIdentifier;
  canSwitchIdentifier: boolean;
  prefill: SignUpPrefill;
  startFieldsFor: (identifier: SignUpIdentifier) => SignUpFields;
  continueFieldsFor: (identifier: SignUpIdentifier) => SignUpFields;
  continueCanSwitchIdentifier: boolean;
  startHiddenValuesFor: (identifier: SignUpIdentifier) => Partial<SignUpPrefill>;
  legalConsent?: SignUpLegalConsent;
  continueLegalConsent?: SignUpLegalConsent;
  validatePassword: (password: string) => Promise<FieldFeedback | undefined>;
  alternativeChannels: Array<AuthProvider & { id: PhoneCodeChannel }>;
  oauthProviders: Array<AuthProvider & { id: OAuthStrategy }>;
  continueOAuthProviders: Array<AuthProvider & { id: OAuthStrategy }>;
  sso: (strategy: OAuthStrategy, options: { legalAccepted?: boolean; continueSignUp: boolean }) => Promise<void>;
  inTicketSignUp: boolean;
  create: (values: SignUpDetailsValues, options?: { channel?: PhoneCodeChannel }) => Promise<SignUpCreateResult>;
  update: (values: SignUpDetailsValues) => Promise<SignUpNextStep>;
}

export interface SignUpVerificationModel {
  target: string;
  needsCode: boolean;
  provider?: string;
  send: (options?: { channel?: PhoneCodeChannel }) => Promise<void>;
  verify: (code: string) => Promise<SignUpNextStep>;
}

export interface SignUpProtectModel {
  challengeId: string | undefined;
  resolve: (options: {
    container: HTMLDivElement;
    setWidgetVisible: (visible: boolean) => Promise<void>;
    expiredReloads: { current: number };
  }) => Promise<SignUpCreateResult>;
}

export interface SignUpReadyModel {
  status: 'ready';
  flow: SignUpFlowModel;
  app: SignUpAppModel;
  navigation: SignUpNavigationModel;
  details: SignUpDetailsModel;
  verification: { email: SignUpVerificationModel; phone: SignUpVerificationModel };
  protect: SignUpProtectModel;
}

export type SignUpModel = { status: 'loading' } | SignUpReadyModel;

const DETAILS_FIELDS = [...signUpFieldOrder, 'legalAccepted'] as const;

const PREFILL_NAMES = ['emailAddress', 'phoneNumber', 'username', 'firstName', 'lastName'] as const;

const ABSOLUTE_URL = /^https?:\/\//;
const RETURN_PARAM = '__clerk_mosaic_sign_up';
const SSO_RETURN = 'sso-callback';
const OAUTH_PREFIX = /^oauth_(custom_)?/;
const SHOWN_RETURN_ERRORS: readonly string[] = [
  ERROR_CODES.NOT_ALLOWED_TO_SIGN_UP,
  ERROR_CODES.OAUTH_ACCESS_DENIED,
  ERROR_CODES.NOT_ALLOWED_ACCESS,
  ERROR_CODES.SAML_USER_ATTRIBUTE_MISSING,
  ERROR_CODES.OAUTH_EMAIL_DOMAIN_RESERVED_BY_SAML,
  ERROR_CODES.USER_LOCKED,
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
];

// The sign-in routes `clerk.ts` `_handleRedirectCallback` sends a transfer to when it does not complete.
const TRANSFER_ROUTES: Partial<Record<SignInStatus, string>> = {
  needs_first_factor: '/factor-one',
  needs_second_factor: '/factor-two',
  needs_new_password: '/reset-password',
  needs_protect_check: '/protect-check',
};

function transferRoute(signIn: Pick<SignInFutureResource, 'status' | 'protectCheck'>): string {
  return signIn.protectCheck ? '/protect-check' : (TRANSFER_ROUTES[signIn.status] ?? '');
}

function ssoCallbackUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.set(RETURN_PARAM, SSO_RETURN);
  return url.toString();
}

function forgetReturn(): void {
  const url = new URL(window.location.href);
  if (url.searchParams.has(RETURN_PARAM)) {
    url.searchParams.delete(RETURN_PARAM);
    window.history.replaceState(window.history.state, '', url);
  }
}

function continueProviders<T extends AuthProvider & { id: OAuthStrategy }>(
  signUp: SignUpFutureResource,
  providers: T[],
): T[] {
  const missing = providers.filter(provider => signUp.missingFields.includes(provider.id));
  if (missing.length > 0) {
    return missing;
  }
  return signUp.verifications.externalAccount.status === 'verified' ? [] : providers;
}

function oauthProvidersFrom(userSettings: UserSettingsResource): Array<AuthProvider & { id: OAuthStrategy }> {
  return userSettings.authenticatableSocialStrategies
    .flatMap(strategy => {
      const known = OAUTH_PROVIDERS.find(provider => provider.strategy === strategy);
      if (known) {
        return [{ id: strategy, name: known.name, iconUrl: iconImageUrl(known.provider) }];
      }
      const custom = strategy.startsWith('oauth_custom_') ? userSettings.social[strategy] : undefined;
      return custom ? [{ id: strategy, name: custom.name, iconUrl: custom.logo_url || '' }] : [];
    })
    .sort((a, b) => a.id.replace(OAUTH_PREFIX, '').localeCompare(b.id.replace(OAUTH_PREFIX, '')));
}

function toViewFields(
  fields: Partial<Record<string, { required: boolean; disabled?: boolean } | undefined>>,
  isShown: (name: SignUpFieldName, required: boolean) => boolean,
) {
  const result: SignUpFields = {};
  for (const name of signUpFieldOrder) {
    const field = fields[name];
    if (field && isShown(name, field.required)) {
      result[name] = field;
    }
  }
  return result;
}

function emailSupportFor(mode: SignUpFlowModel['mode'], address: string | undefined): (() => void) | undefined {
  if (mode !== 'restricted' || !address) {
    return undefined;
  }
  return () => window.location.assign(`mailto:${address}`);
}

function blockedBy(error: ClerkError | null): AuthActionBlockedDetails | undefined {
  const blocked = actionBlockedDetailsFrom(error && isClerkAPIResponseError(error) ? error.errors[0] : error);
  if (!blocked) {
    return undefined;
  }
  const { title, description, linkUrl, linkText, traceId } = blocked;
  return { title, description, linkUrl, linkText, traceId };
}

async function run(call: () => Promise<{ error: ClerkError | null }>): Promise<void> {
  const { error } = await call();
  if (error) {
    throw error;
  }
}

export function useSignUpModel({
  initialValues = {},
  unsafeMetadata,
  showOptionalFields = false,
}: SignUpModelOptions = {}): SignUpModel {
  const clerk = useClerk();
  const environment = useMosaicEnvironment();
  const router = useMosaicRouter();
  const supportEmail = useMosaicSupportEmail();
  const { signUp } = __internal_useClerkSignal('signUp');
  const { signIn } = __internal_useClerkSignal('signIn');
  const { session } = useSession();
  const passwordMessages = useMessages('userProfile').password;
  const genericError = useMessages('errors').generic;
  const locale = useLocale();
  const errorText = useErrorText();
  const query = router.getSearchParams();
  const returnUrl = query.get('redirect_url') ?? undefined;
  const afterSignUpUrl = clerk.buildAfterSignUpUrl({ params: query });
  const signInUrl = () => clerk.buildSignInUrl(returnUrl ? { redirectUrl: returnUrl } : undefined);
  const taskInFlow = (task: SessionTask | undefined): SignUpTaskKey | undefined =>
    task?.key === 'choose-organization' && !clerk.__internal_getOption('taskUrls')?.[task.key] ? task.key : undefined;
  const taskUrl = (task: SessionTask) =>
    clerk.__internal_getOption('taskUrls')?.[task.key] ?? buildTaskUrl(task, { base: signInUrl() });
  const passwordSettings = environment?.userSettings.passwordSettings;
  const moduleManager = clerk.__internal_moduleManager;
  const validatePassword = useMemo(
    () =>
      async (password: string): Promise<FieldFeedback | undefined> => {
        if (!passwordSettings || !moduleManager) {
          throw new FormSubmitError({ message: genericError });
        }
        const complexity = validateComplexity(password, passwordSettings);
        if (Object.keys(complexity).length > 0 || !passwordSettings.show_zxcvbn) {
          return passwordFieldFeedback({ complexity }, passwordSettings, passwordMessages, locale);
        }
        const { loadZxcvbn } = createLoadZxcvbn(moduleManager);
        const strength = createValidatePasswordStrength(passwordSettings)(await loadZxcvbn())(password);
        return passwordFieldFeedback({ complexity, strength }, passwordSettings, passwordMessages, locale);
      },
    [passwordSettings, moduleManager, passwordMessages, genericError, locale],
  );

  if (!clerk.loaded || !environment) {
    return { status: 'loading' };
  }

  const { userSettings, displayConfig } = environment;
  const { attributes } = userSettings;
  const { mode } = userSettings.signUp;
  const isProgressiveSignUp = userSettings.signUp.progressive;
  const legalConsentRequired = userSettings.signUp.legal_consent_enabled;
  const canSwitchIdentifier = emailOrPhone(attributes, isProgressiveSignUp);
  const oauthProviders = oauthProvidersFrom(userSettings);
  const providerIds = oauthProviders.map(provider => provider.id);
  const showForm = showFormFields(userSettings);

  const next = (resource: SignUpFutureResource): SignUpNextStep => {
    const step = getSignUpNextStep(resource);
    if (
      step.type === 'verify_email' &&
      resource.verifications.emailAddress.supportedStrategies.includes('email_link')
    ) {
      return { type: 'unknown' };
    }
    return step.type === 'fields' && !continueCanSatisfy(resource, providerIds) ? { type: 'unknown' } : step;
  };

  const sessionPhase = (): AuthSessionPhase<SignUpTaskKey> => {
    if (session === null) {
      return { type: 'none' };
    }
    if (session === undefined) {
      return { type: 'activating' };
    }
    const task = taskInFlow(session.currentTask);
    return task ? { type: 'task', key: task } : { type: 'active' };
  };

  const isShown = (name: SignUpFieldName, required: boolean) =>
    showOptionalFields || required || (canSwitchIdentifier && (name === 'emailAddress' || name === 'phoneNumber'));

  const ticket = getClerkQueryParam('__clerk_ticket') || getClerkQueryParam('__clerk_invitation_token') || undefined;
  const inTicketSignUp = Boolean(ticket) && signUp.verifications.emailAddress.strategy === 'ticket';
  const phoneCodeChannels = inTicketSignUp ? [] : userSettings.alternativePhoneCodeChannels;
  const forgetTicket = () => {
    removeClerkQueryParam('__clerk_ticket');
    removeClerkQueryParam('__clerk_invitation_token');
  };

  const activeFields = (identifier: SignUpIdentifier) =>
    determineActiveFields({
      attributes,
      activeCommIdentifierType: identifier,
      hasTicket: inTicketSignUp,
      hasEmail: Boolean(prefill.emailAddress),
      isProgressiveSignUp,
      legalConsentRequired,
    });

  const details = (values: SignUpDetailsValues) => ({
    emailAddress: values.emailAddress,
    phoneNumber: values.phoneNumber,
    username: values.username,
    password: values.password,
    firstName: values.firstName,
    lastName: values.lastName,
    legalAccepted: values.legalAccepted,
    unsafeMetadata,
  });

  const usernameBounds = {
    min_length: userSettings.usernameSettings.min_length,
    max_length: userSettings.usernameSettings.max_length,
  };

  const prefill: SignUpPrefill = {
    emailAddress: signUp.emailAddress || initialValues.emailAddress || '',
    phoneNumber: signUp.phoneNumber || initialValues.phoneNumber || '',
    username: signUp.username || initialValues.username || '',
    firstName: signUp.firstName || initialValues.firstName || '',
    lastName: signUp.lastName || initialValues.lastName || '',
  };

  const saveDetails = async (result: { error: ClerkError | null }) => {
    try {
      await save(() => run(() => Promise.resolve(result)), DETAILS_FIELDS, usernameBounds);
    } catch (cause) {
      if (!(cause instanceof SaveError) || !isClerkAPIResponseError(result.error)) {
        throw cause;
      }
      const errors: ClerkAPIError[] = result.error.errors;
      const passwordErrors = errors.filter(error => error.meta?.paramName === 'password');
      if (passwordErrors.length === 0) {
        throw cause;
      }
      const { global, fields } = cause.formError;
      const messages: FormFieldErrors<SignUpDetailsValues> = {};
      for (const name of DETAILS_FIELDS) {
        const error = fields?.[name];
        if (error) {
          messages[name] = errorText(error);
        }
      }
      messages.password = passwordError(
        passwordErrors,
        userSettings.passwordSettings,
        passwordMessages,
        locale,
        errorText,
      );
      throw new FormSubmitError({ message: global && errorText(global), fields: messages });
    }
  };

  const verify = async (attempt: () => Promise<{ error: ClerkError | null }>) => {
    if (signUp.status !== 'complete') {
      await save(() => run(attempt), ['code']);
    }
    return next(signUp);
  };

  const legalConsent = legalConsentRequired
    ? { termsUrl: displayConfig.termsUrl || undefined, privacyPolicyUrl: displayConfig.privacyPolicyUrl || undefined }
    : undefined;
  const startLegalConsent = showForm ? legalConsent : undefined;
  const continueLegalConsent = signUp.missingFields.includes('legal_accepted') ? legalConsent : undefined;

  const navigateAfter =
    (destination: string, { keepsTaskInFlow }: { keepsTaskInFlow: boolean }): SetActiveNavigate =>
    async ({ session: created, decorateUrl }) => {
      const task = created.currentTask;
      if (keepsTaskInFlow && taskInFlow(task)) {
        return;
      }
      if (task) {
        await router.navigate(taskUrl(task));
        return;
      }
      const decorated = decorateUrl(destination);
      if (decorated !== destination && ABSOLUTE_URL.test(decorated)) {
        router.windowNavigate(decorated);
        return;
      }
      await router.navigate(destination);
    };

  const step = next(signUp);
  const phoneChannel = signUp.verifications.phoneNumber.channel;
  const preferredPhoneChannel = (phoneNumber: string | undefined): PhoneCodeChannel | undefined => {
    const { preferredChannels } = environment.authConfig;
    const preferred =
      phoneNumber && preferredChannels ? getPreferredPhoneCodeChannelByCountry(phoneNumber, preferredChannels) : null;
    return preferred && preferred !== 'sms' ? preferred : undefined;
  };

  return {
    status: 'ready',
    flow: {
      signUpId: signUp.id,
      step,
      session: sessionPhase(),
      singleSession: environment.authConfig.singleSessionMode,
      mode,
      afterSignUpUrl,
      leave: () => {
        const task = session?.currentTask;
        void router.navigate(task ? taskUrl(task) : afterSignUpUrl);
      },
      ticket,
      redeemTicket: async () => {
        const { error } = await signUp.ticket({ ticket: ticket ?? '', unsafeMetadata });
        if (error) {
          forgetTicket();
          const blocked = blockedBy(error);
          if (!blocked) {
            throw error;
          }
          return { result: { type: 'blocked', details: blocked }, emailAddress: '' };
        }
        return { result: next(signUp), emailAddress: signUp.emailAddress ?? '' };
      },
      isReturning: new URL(window.location.href).searchParams.get(RETURN_PARAM) === SSO_RETURN,
      completeReturn: async () => {
        forgetReturn();
        const step = next(signUp);
        if (step.type === 'protect') {
          return step;
        }
        if (signUp.isTransferable) {
          await run(() => signIn.create({ transfer: true }));
          if (signIn.status !== 'complete') {
            await router.navigate(
              buildURL({ base: signInUrl(), hashPath: transferRoute(signIn) }, { stringify: true }),
            );
            return undefined;
          }
          await run(() =>
            signIn.finalize({ navigate: navigateAfter(clerk.buildAfterSignInUrl(), { keepsTaskInFlow: false }) }),
          );
          return undefined;
        }
        const existingSession = signUp.existingSession?.sessionId;
        if (existingSession) {
          await clerk.setActive({
            session: existingSession,
            navigate: navigateAfter(clerk.buildAfterSignInUrl(), { keepsTaskInFlow: false }),
          });
          return undefined;
        }
        const failure = signUp.verifications.externalAccount.error;
        if (failure) {
          forgetTicket();
          await run(() => signUp.reset());
          throw new SaveError({
            global: SHOWN_RETURN_ERRORS.includes(failure.code)
              ? { code: failure.code, message: failure.longMessage || failure.message }
              : UNEXPECTED_ERROR,
          });
        }
        return step;
      },
      finalize: async () => {
        forgetTicket();
        await run(() => signUp.finalize({ navigate: navigateAfter(afterSignUpUrl, { keepsTaskInFlow: true }) }));
      },
      reset: () => {
        forgetTicket();
        return run(() => signUp.reset());
      },
    },
    app: {
      applicationName: displayConfig.applicationName,
      applicationLogoUrl: displayConfig.logoImageUrl || undefined,
      renderBranding: displayConfig.branded,
    },
    navigation: {
      goToSignIn: () => void router.navigate(signInUrl()),
      joinWaitlist:
        mode === 'waitlist'
          ? () =>
              void router.navigate(
                clerk.buildWaitlistUrl(returnUrl ? { initialValues: { redirect_url: returnUrl } } : undefined),
              )
          : undefined,
      emailSupport: emailSupportFor(mode, supportEmail),
    },
    details: {
      initialIdentifier:
        getInitialActiveIdentifier(attributes, isProgressiveSignUp, {
          emailAddress: initialValues.emailAddress ?? undefined,
          phoneNumber: initialValues.phoneNumber ?? undefined,
        }) ?? null,
      canSwitchIdentifier,
      prefill,
      startFieldsFor: identifier => (showForm ? toViewFields(activeFields(identifier), isShown) : {}),
      continueFieldsFor: identifier => continueFields(signUp, identifier),
      continueCanSwitchIdentifier: missesEitherIdentifier(signUp),
      startHiddenValuesFor: identifier => {
        const fields = activeFields(identifier);
        const hidden: Partial<SignUpPrefill> = {};
        for (const name of PREFILL_NAMES) {
          const field = fields[name];
          if (field && !isShown(name, field.required) && prefill[name]) {
            hidden[name] = prefill[name];
          }
        }
        return hidden;
      },
      legalConsent: startLegalConsent,
      continueLegalConsent,
      validatePassword,
      inTicketSignUp,
      oauthProviders,
      continueOAuthProviders: continueProviders(signUp, oauthProviders),
      sso: async (strategy, { legalAccepted, continueSignUp }) => {
        let target = signUp;
        if (signUp.id && !continueSignUp && !inTicketSignUp) {
          await run(() => signUp.reset());
          target = clerk.client?.signUp.__internal_future ?? signUp;
        }
        await run(() =>
          target.sso({
            strategy,
            redirectCallbackUrl: ssoCallbackUrl(),
            redirectUrl: afterSignUpUrl,
            unsafeMetadata,
            legalAccepted: legalAccepted || undefined,
          }),
        );
      },
      alternativeChannels: phoneCodeChannels.flatMap(channel => {
        const provider = getAlternativePhoneCodeProviderData(channel);
        return provider ? [{ id: channel, name: provider.name, iconUrl: iconImageUrl(channel) }] : [];
      }),
      create: async (values, { channel } = {}) => {
        const sendOver = channel ?? preferredPhoneChannel(values.phoneNumber);
        const result = await signUp.create({
          ...details(values),
          ...(sendOver ? { strategy: 'phone_code' as const, channel: sendOver } : {}),
        });
        const blocked = blockedBy(result.error);
        if (blocked) {
          return { type: 'blocked', details: blocked };
        }
        await saveDetails(result);
        return next(signUp);
      },
      update: async values => {
        await saveDetails(await signUp.update(details(values)));
        return next(signUp);
      },
    },
    protect: {
      challengeId: signUp.protectCheck?.token,
      resolve: async ({ container, setWidgetVisible, expiredReloads }) => {
        const challenge = signUp.protectCheck;
        if (challenge) {
          const outcome = await runProtectCheck<SignUpCreateResult>(
            {
              getProtectCheck: () => signUp.protectCheck,
              getResource: () => next(signUp),
              reload: () => clerk.client?.signUp.reload() ?? Promise.resolve(),
              submitProtectCheck: async params => {
                const result = await signUp.submitProtectCheck(params);
                const blocked = blockedBy(result.error);
                if (blocked) {
                  return { type: 'blocked', details: blocked };
                }
                await run(() => Promise.resolve(result));
                return next(signUp);
              },
            },
            challenge,
            {
              container,
              expiredReloads,
              setWidgetVisible,
              loadTimeoutMs:
                clerk.__internal_protectChallengeLoadTimeoutMs ?? environment.protectConfig?.challenge_load_timeout_ms,
            },
          );
          if (outcome.status === 'resolved') {
            return outcome.resource;
          }
        }
        return next(signUp);
      },
    },
    verification: {
      email: {
        target: signUp.emailAddress ?? '',
        needsCode: step.type === 'verify_email' && !step.sent,
        send: () => run(() => signUp.verifications.sendEmailCode()),
        verify: code => verify(() => signUp.verifications.verifyEmailCode({ code })),
      },
      phone: {
        target: signUp.phoneNumber ?? '',
        needsCode: step.type === 'verify_phone' && !step.sent,
        provider: getAlternativePhoneCodeProviderData(phoneChannel)?.name,
        send: ({ channel } = {}) => run(() => signUp.verifications.sendPhoneCode({ channel: channel ?? phoneChannel })),
        verify: code => verify(() => signUp.verifications.verifyPhoneCode({ code })),
      },
    },
  };
}
