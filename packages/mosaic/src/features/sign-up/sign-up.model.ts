import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';
import { iconImageUrl } from '@clerk/shared/constants';
import type { ClerkError } from '@clerk/shared/error';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { actionBlockedDetailsFrom } from '@clerk/shared/internal/clerk-js/actionBlocked';
import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { getSignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { validate as validateComplexity } from '@clerk/shared/internal/clerk-js/passwords/complexity';
import { createLoadZxcvbn } from '@clerk/shared/internal/clerk-js/passwords/loadZxcvbn';
import { createValidatePasswordStrength } from '@clerk/shared/internal/clerk-js/passwords/strength';
import { runProtectCheck } from '@clerk/shared/internal/clerk-js/protectCheckRunner';
import { buildTaskUrl } from '@clerk/shared/internal/clerk-js/sessionTasks';
import type { ActiveIdentifier } from '@clerk/shared/internal/clerk-js/signUpFormFields';
import {
  determineActiveFields,
  emailOrPhone,
  getInitialActiveIdentifier,
} from '@clerk/shared/internal/clerk-js/signUpFormFields';
import { getPreferredPhoneCodeChannelByCountry } from '@clerk/shared/phone';
import { __internal_useClerkSignal, useClerk, useSession } from '@clerk/shared/react';
import type {
  ClerkAPIError,
  PhoneCodeChannel,
  SessionTask,
  SignUpFutureResource,
  SignUpInitialValues,
} from '@clerk/shared/types';
import { useMemo } from 'react';

import type { AuthActionBlockedDetails, AuthProvider } from '../../blocks/auth';
import type { FieldFeedback, FormFieldErrors } from '../../components/form';
import { FormSubmitError } from '../../components/form';
import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { useMosaicRouter } from '../../hooks/use-mosaic-router';
import { useMosaicSupportEmail } from '../../hooks/use-mosaic-support-email';
import { useErrorText, useLocale, useMessages } from '../../localization';
import { save, SaveError } from '../../utils/errors';
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

  const next = (resource: SignUpFutureResource): SignUpNextStep => {
    const step = getSignUpNextStep(resource);
    if (
      step.type === 'verify_email' &&
      resource.verifications.emailAddress.supportedStrategies.includes('email_link')
    ) {
      return { type: 'unknown' };
    }
    return step.type === 'fields' && !continueCanSatisfy(resource) ? { type: 'unknown' } : step;
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

  const activeFields = (identifier: SignUpIdentifier) =>
    determineActiveFields({
      attributes,
      activeCommIdentifierType: identifier,
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
      finalize: async () => {
        await run(() =>
          signUp.finalize({
            navigate: async ({ session: created, decorateUrl }) => {
              const task = created.currentTask;
              if (taskInFlow(task)) {
                return;
              }
              if (task) {
                await router.navigate(taskUrl(task));
                return;
              }
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
      reset: () => run(() => signUp.reset()),
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
      alternativeChannels: userSettings.alternativePhoneCodeChannels.flatMap(channel => {
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
