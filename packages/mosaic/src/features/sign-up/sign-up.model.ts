import type { ClerkError } from '@clerk/shared/error';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { actionBlockedDetailsFrom } from '@clerk/shared/internal/clerk-js/actionBlocked';
import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { getSignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { validate as validateComplexity } from '@clerk/shared/internal/clerk-js/passwords/complexity';
import { createLoadZxcvbn } from '@clerk/shared/internal/clerk-js/passwords/loadZxcvbn';
import { createValidatePasswordStrength } from '@clerk/shared/internal/clerk-js/passwords/strength';
import { buildTaskUrl } from '@clerk/shared/internal/clerk-js/sessionTasks';
import type { ActiveIdentifier } from '@clerk/shared/internal/clerk-js/signUpFormFields';
import {
  determineActiveFields,
  emailOrPhone,
  getInitialActiveIdentifier,
} from '@clerk/shared/internal/clerk-js/signUpFormFields';
import { __internal_useClerkSignal, useClerk, useSession } from '@clerk/shared/react';
import type { SessionTask, SignUpField, SignUpFutureResource, SignUpInitialValues } from '@clerk/shared/types';
import { useMemo } from 'react';

import type { AuthActionBlockedDetails } from '../../blocks/auth';
import type { FieldFeedback } from '../../components/form';
import { FormSubmitError } from '../../components/form';
import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { useMosaicRouter } from '../../hooks/use-mosaic-router';
import { useMosaicSupportEmail } from '../../hooks/use-mosaic-support-email';
import { useLocale, useMessages } from '../../localization';
import { save } from '../../utils/errors';
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
  create: (values: SignUpDetailsValues) => Promise<SignUpNextStep>;
  update: (values: SignUpDetailsValues) => Promise<SignUpNextStep>;
}

export interface SignUpVerificationModel {
  target: string;
  needsCode: boolean;
  send: () => Promise<void>;
  verify: (code: string) => Promise<SignUpNextStep>;
}

export interface SignUpReadyModel {
  status: 'ready';
  flow: SignUpFlowModel;
  app: SignUpAppModel;
  navigation: SignUpNavigationModel;
  details: SignUpDetailsModel;
  verification: { email: SignUpVerificationModel; phone: SignUpVerificationModel };
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
      finalize: async () => {
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
      reset: () => run(() => signUp.reset()),
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
      create: async values => {
        await save(
          () => run(() => signUp.create({ ...details(values), password: values.password })),
          DETAILS_FIELDS,
          usernameBounds,
        );
        return next(signUp);
      },
      update: async values => {
        await save(() => run(() => signUp.update(details(values))), DETAILS_FIELDS, usernameBounds);
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
        send: () => run(() => signUp.verifications.sendPhoneCode()),
        verify: async code => {
          await save(() => run(() => signUp.verifications.verifyPhoneCode({ code })), ['code']);
          return next(signUp);
        },
      },
    },
  };
}
