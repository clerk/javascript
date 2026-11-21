import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';
import { iconImageUrl } from '@clerk/shared/constants';
import type { ClerkError } from '@clerk/shared/error';
import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import { actionBlockedDetailsFrom } from '@clerk/shared/internal/clerk-js/actionBlocked';
import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { getSignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { validate as validateComplexity } from '@clerk/shared/internal/clerk-js/passwords/complexity';
import { createLoadZxcvbn } from '@clerk/shared/internal/clerk-js/passwords/loadZxcvbn';
import { createValidatePasswordStrength } from '@clerk/shared/internal/clerk-js/passwords/strength';
import { executeProtectCheck } from '@clerk/shared/internal/clerk-js/protectCheck';
import { getClerkQueryParam, removeClerkQueryParam } from '@clerk/shared/internal/clerk-js/queryParams';
import { buildTaskUrl } from '@clerk/shared/internal/clerk-js/sessionTasks';
import type { ActiveIdentifier } from '@clerk/shared/internal/clerk-js/signUpFormFields';
import {
  determineActiveFields,
  emailOrPhone,
  getInitialActiveIdentifier,
} from '@clerk/shared/internal/clerk-js/signUpFormFields';
import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import { getPreferredPhoneCodeChannelByCountry } from '@clerk/shared/phone';
import { __internal_useClerkSignal, useClerk, useSession } from '@clerk/shared/react';
import type {
  OAuthStrategy,
  PhoneCodeChannel,
  SessionTask,
  SignUpField,
  SignUpFutureResource,
  SignUpInitialValues,
  UserSettingsResource,
} from '@clerk/shared/types';
import { useMemo } from 'react';

import type { AuthActionBlockedDetails, AuthProvider } from '../../blocks/auth';
import type { FieldFeedback } from '../../components/form';
import { FormSubmitError } from '../../components/form';
import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { useMosaicRouter } from '../../hooks/use-mosaic-router';
import { useMosaicSupportEmail } from '../../hooks/use-mosaic-support-email';
import { useLocale, useMessages } from '../../localization';
import { save, SaveError } from '../../utils/errors';
import { useTaskChooseOrganizationReady } from '../task-choose-organization/task-choose-organization';
import { passwordFieldFeedback } from '../user-profile/user-profile-password-section/user-profile-password-feedback';
import type { SignUpFlowStep, SignUpTaskKey } from './sign-up.routes';
import type { SignUpFieldName, SignUpFields, SignUpLegalConsent } from './sign-up.types';

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
  step: SignUpFlowStep;
  mode: 'public' | 'restricted' | 'waitlist';
  actionBlocked?: AuthActionBlockedDetails;
  afterSignUpUrl: string;
  ticket: string | undefined;
  inTicketSignUp: boolean;
  redeemTicket: () => Promise<{ step: SignUpNextStep; emailAddress: string }>;
  isReturning: boolean;
  completeReturn: () => Promise<SignUpNextStep | undefined>;
  finalize: () => Promise<void>;
  reset: () => Promise<void>;
}

export interface SignUpAppModel {
  applicationName: string;
  applicationLogoUrl?: string;
  supportEmail?: string;
}

export interface SignUpNavigationModel {
  goToSignIn: () => void;
  joinWaitlist?: () => void;
}

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
  startUpdatesSignUp: boolean;
  create: (values: SignUpDetailsValues, options?: { channel?: PhoneCodeChannel }) => Promise<SignUpNextStep>;
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
  }) => Promise<SignUpNextStep>;
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

const FIELD_NAMES: readonly SignUpFieldName[] = [
  'firstName',
  'lastName',
  'username',
  'emailAddress',
  'phoneNumber',
  'password',
];

const DETAILS_FIELDS = [...FIELD_NAMES, 'legalAccepted'] as const;

const PREFILL_NAMES = ['emailAddress', 'phoneNumber', 'username', 'firstName', 'lastName'] as const;

const ABSOLUTE_URL = /^https?:\/\//;
const RETURN_PARAM = '__clerk_mosaic_sign_up';
const SSO_RETURN = 'sso-callback';
const OAUTH_PREFIX = /^oauth_(custom_)?/;

function returnUrl(): string {
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
  for (const name of FIELD_NAMES) {
    const field = fields[name];
    if (field && isShown(name, field.required)) {
      result[name] = field;
    }
  }
  return result;
}

const MISSING_FORM_FIELDS: Partial<Record<SignUpField, SignUpFieldName>> = {
  first_name: 'firstName',
  last_name: 'lastName',
  username: 'username',
  password: 'password',
  email_address: 'emailAddress',
  phone_number: 'phoneNumber',
};

type SignUpFieldLists = Pick<SignUpFutureResource, 'missingFields' | 'optionalFields'>;

// TODO: Drop `email_address_or_phone_number` once every instance uses Progressive Sign Up; only FAPI's non-progressive `checkStatus` sends it.
function missingIdentifiers({ missingFields, optionalFields }: SignUpFieldLists): SignUpField[] {
  return missingFields.filter(
    field =>
      field === 'email_address_or_phone_number' ||
      (optionalFields.includes(field) &&
        (field === 'email_address' || field === 'phone_number' || field === 'username')),
  );
}

const CONTINUE_REQUIREMENTS: readonly SignUpField[] = ['legal_accepted', 'email_address_or_phone_number'];

function continueCanSatisfy(signUp: SignUpFieldLists): boolean {
  const asksForIdentifier = missingIdentifiers(signUp).length > 0;
  return signUp.missingFields.every(
    field =>
      field in MISSING_FORM_FIELDS ||
      CONTINUE_REQUIREMENTS.includes(field) ||
      (asksForIdentifier && signUp.optionalFields.includes(field)),
  );
}

function missesEitherIdentifier(signUp: SignUpFieldLists): boolean {
  const identifiers = missingIdentifiers(signUp);
  return (
    identifiers.includes('email_address_or_phone_number') ||
    (identifiers.includes('email_address') && identifiers.includes('phone_number'))
  );
}

function continueFields(signUp: SignUpFieldLists, identifier: SignUpIdentifier): SignUpFields {
  const identifiers = missingIdentifiers(signUp);
  const fields: SignUpFields = {};
  for (const name of signUp.missingFields) {
    const field = MISSING_FORM_FIELDS[name];
    if (field && !identifiers.includes(name)) {
      fields[field] = { required: true };
    }
  }
  if (missesEitherIdentifier(signUp)) {
    fields[identifier === 'phoneNumber' ? 'phoneNumber' : 'emailAddress'] = { required: true };
  } else {
    const only = identifiers.find(name => name !== 'username') ?? identifiers[0];
    const field = only ? MISSING_FORM_FIELDS[only] : undefined;
    if (field) {
      fields[field] = { required: true };
    }
  }
  return fields;
}

function hasExpired(expiresAt: number | undefined): boolean {
  return expiresAt !== undefined && expiresAt < Date.now();
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
  const { signUp, errors } = __internal_useClerkSignal('signUp');
  const { signIn } = __internal_useClerkSignal('signIn');
  const { session } = useSession();
  const passwordMessages = useMessages('userProfile').password;
  const genericError = useMessages('errors').generic;
  const locale = useLocale();
  const taskInFlow = (task: SessionTask | undefined): SignUpTaskKey | undefined =>
    task?.key === 'choose-organization' && !clerk.__internal_getOption('taskUrls')?.[task.key] ? task.key : undefined;
  const isTaskReady = useTaskChooseOrganizationReady({
    redirectUrlComplete: clerk.buildAfterSignUpUrl(),
    enabled: taskInFlow(session?.currentTask) !== undefined,
  });
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
  const verifiesEmailByLink = Boolean(attributes.email_address?.verifications?.includes('email_link'));

  const next = (resource: SignUpFutureResource): SignUpNextStep => {
    const step = getSignUpNextStep(resource);
    if (step.type === 'verify_email' && verifiesEmailByLink) {
      return { type: 'unknown' };
    }
    return step.type === 'fields' && !continueCanSatisfy(resource) ? { type: 'unknown' } : step;
  };

  const flowStep = (): SignUpFlowStep => {
    if (signUp.id) {
      return next(signUp);
    }
    const task = taskInFlow(session?.currentTask);
    if (task) {
      return isTaskReady ? { type: 'task', key: task } : { type: 'leaving' };
    }
    return session === null ? next(signUp) : { type: 'leaving' };
  };

  const [lastError] = errors.raw ?? [];
  const blocked = actionBlockedDetailsFrom(
    lastError && isClerkAPIResponseError(lastError) ? lastError.errors[0] : lastError,
  );

  const isShown = (name: SignUpFieldName, required: boolean) =>
    showOptionalFields || required || (canSwitchIdentifier && (name === 'emailAddress' || name === 'phoneNumber'));

  const ticket = getClerkQueryParam('__clerk_ticket') || getClerkQueryParam('__clerk_invitation_token') || undefined;
  const inTicketSignUp = signUp.verifications.emailAddress.strategy === 'ticket';
  const oauthProviders = oauthProvidersFrom(userSettings);
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

  const legalConsent = legalConsentRequired
    ? { termsUrl: displayConfig.termsUrl || undefined, privacyPolicyUrl: displayConfig.privacyPolicyUrl || undefined }
    : undefined;

  const step = flowStep();
  const phoneChannel = signUp.verifications.phoneNumber.channel;
  const preferredPhoneChannel = (): PhoneCodeChannel | undefined => {
    const { preferredChannels } = environment.authConfig;
    const preferred =
      signUp.phoneNumber && preferredChannels
        ? getPreferredPhoneCodeChannelByCountry(signUp.phoneNumber, preferredChannels)
        : null;
    return preferred && preferred !== 'sms' ? preferred : undefined;
  };

  return {
    status: 'ready',
    flow: {
      signUpId: signUp.id,
      step,
      mode,
      actionBlocked: blocked
        ? {
            title: blocked.title,
            description: blocked.description,
            linkUrl: blocked.linkUrl,
            linkText: blocked.linkText,
            traceId: blocked.traceId,
          }
        : undefined,
      afterSignUpUrl: clerk.buildAfterSignUpUrl(),
      ticket,
      inTicketSignUp,
      redeemTicket: async () => {
        const { error } = await signUp.ticket({ ticket: ticket ?? '', unsafeMetadata });
        if (error) {
          forgetTicket();
          throw error;
        }
        return { step: next(signUp), emailAddress: signUp.emailAddress ?? '' };
      },
      isReturning: new URL(window.location.href).searchParams.get(RETURN_PARAM) === SSO_RETURN,
      completeReturn: async () => {
        forgetReturn();
        if (signUp.isTransferable) {
          await run(() => signIn.create({ transfer: true }));
          if (signIn.status !== 'complete') {
            await router.navigate(clerk.buildSignInUrl());
            return undefined;
          }
          await run(() =>
            signIn.finalize({
              navigate: async ({ decorateUrl }) => {
                const afterSignInUrl = clerk.buildAfterSignInUrl();
                const decorated = decorateUrl(afterSignInUrl);
                if (decorated !== afterSignInUrl && ABSOLUTE_URL.test(decorated)) {
                  router.windowNavigate(decorated);
                  return;
                }
                await router.navigate(afterSignInUrl);
              },
            }),
          );
          return undefined;
        }
        const existingSession = signUp.existingSession?.sessionId;
        if (existingSession) {
          await clerk.setActive({ session: existingSession, redirectUrl: clerk.buildAfterSignInUrl() });
          return undefined;
        }
        const failure = signUp.verifications.externalAccount.error;
        if (failure) {
          await run(() => signUp.reset());
          throw new SaveError({ global: { code: failure.code, message: failure.longMessage || failure.message } });
        }
        return next(signUp);
      },
      finalize: async () => {
        forgetTicket();
        await run(() =>
          signUp.finalize({
            navigate: async ({ session: created, decorateUrl }) => {
              const task = created.currentTask;
              if (taskInFlow(task)) {
                return;
              }
              if (task) {
                await router.navigate(
                  clerk.__internal_getOption('taskUrls')?.[task.key] ??
                    buildTaskUrl(task, { base: clerk.buildSignInUrl() }),
                );
                return;
              }
              const afterSignUpUrl = clerk.buildAfterSignUpUrl();
              const decorated = decorateUrl(afterSignUpUrl);
              if (decorated !== afterSignUpUrl && ABSOLUTE_URL.test(decorated)) {
                router.windowNavigate(decorated);
                return;
              }
              await router.navigate(afterSignUpUrl);
            },
          }),
        );
      },
      reset: () => {
        forgetTicket();
        return run(() => signUp.reset());
      },
    },
    app: {
      applicationName: displayConfig.applicationName,
      applicationLogoUrl: displayConfig.logoImageUrl || undefined,
      supportEmail: mode === 'restricted' ? supportEmail : undefined,
    },
    navigation: {
      goToSignIn: () => void router.navigate(clerk.buildSignInUrl()),
      joinWaitlist: mode === 'waitlist' ? () => void router.navigate(clerk.buildWaitlistUrl()) : undefined,
    },
    details: {
      initialIdentifier:
        getInitialActiveIdentifier(attributes, isProgressiveSignUp, {
          emailAddress: initialValues.emailAddress ?? undefined,
          phoneNumber: initialValues.phoneNumber ?? undefined,
        }) ?? null,
      canSwitchIdentifier,
      prefill,
      startFieldsFor: identifier => toViewFields(activeFields(identifier), isShown),
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
      legalConsent,
      continueLegalConsent: signUp.missingFields.includes('legal_accepted') ? legalConsent : undefined,
      validatePassword,
      startUpdatesSignUp: inTicketSignUp,
      oauthProviders,
      continueOAuthProviders: signUp.verifications.externalAccount.status === 'verified' ? [] : oauthProviders,
      sso: async (strategy, { legalAccepted, continueSignUp }) => {
        if (signUp.id && !continueSignUp && !inTicketSignUp) {
          await run(() => signUp.reset());
        }
        await run(() =>
          signUp.sso({
            strategy,
            redirectCallbackUrl: returnUrl(),
            redirectUrl: clerk.buildAfterSignUpUrl(),
            unsafeMetadata,
            legalAccepted: legalAccepted || undefined,
          }),
        );
      },
      alternativeChannels: inTicketSignUp
        ? []
        : userSettings.alternativePhoneCodeChannels.flatMap(channel => {
            const provider = getAlternativePhoneCodeProviderData(channel);
            return provider ? [{ id: channel, name: provider.name, iconUrl: iconImageUrl(channel) }] : [];
          }),
      create: async (values, { channel } = {}) => {
        await save(
          () => run(() => signUp.create({ ...details(values), password: values.password })),
          DETAILS_FIELDS,
          usernameBounds,
        );
        const sendOver = signUp.unverifiedFields.includes('phone_number')
          ? (channel ?? preferredPhoneChannel())
          : undefined;
        if (sendOver) {
          await save(() => run(() => signUp.verifications.sendPhoneCode({ channel: sendOver })), ['phoneNumber']);
        }
        return next(signUp);
      },
      update: async values => {
        await save(
          () => run(() => signUp.update({ ...details(values), password: values.password })),
          DETAILS_FIELDS,
          usernameBounds,
        );
        return next(signUp);
      },
    },
    protect: {
      challengeId: signUp.protectCheck?.token,
      resolve: async ({ container, setWidgetVisible }) => {
        const challenge = signUp.protectCheck;
        if (!challenge) {
          return next(signUp);
        }
        if (hasExpired(challenge.expiresAt)) {
          throw new ClerkRuntimeError('Protect verification expired', { code: ERROR_CODES.PROTECT_CHECK_TIMED_OUT });
        }
        const proofToken = await executeProtectCheck(challenge, container, {
          setWidgetVisible,
          loadTimeoutMs:
            clerk.__internal_protectChallengeLoadTimeoutMs ?? environment.protectConfig?.challenge_load_timeout_ms,
        });
        await run(() => signUp.submitProtectCheck({ proofToken }));
        return next(signUp);
      },
    },
    verification: {
      email: {
        target: signUp.emailAddress ?? '',
        needsCode: step.type === 'verify_email' && !step.sent,
        send: () => run(() => signUp.verifications.sendEmailCode()),
        verify: async code => {
          await save(() => run(() => signUp.verifications.verifyEmailCode({ code })), ['code']);
          return next(signUp);
        },
      },
      phone: {
        target: signUp.phoneNumber ?? '',
        needsCode: step.type === 'verify_phone' && !step.sent,
        provider: getAlternativePhoneCodeProviderData(phoneChannel)?.name,
        send: ({ channel } = {}) => run(() => signUp.verifications.sendPhoneCode({ channel: channel ?? phoneChannel })),
        verify: async code => {
          await save(() => run(() => signUp.verifications.verifyPhoneCode({ code })), ['code']);
          return next(signUp);
        },
      },
    },
  };
}
