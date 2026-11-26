import { DEBOUNCE_MS } from '@clerk/shared/internal/clerk-js/constants';
import type { PhoneCodeChannel } from '@clerk/shared/types';
import { useState } from 'react';

import type { FieldFeedback, FieldsConfig } from '../../../components/form';
import { useForm } from '../../../components/form';
import { useDebouncedAsync } from '../../../hooks/use-debounced-async';
import { usePendingAction } from '../../../hooks/use-pending-action';
import type { MosaicMessages } from '../../../localization';
import { useMessages } from '../../../localization';
import { REDIRECT_HOLD_MS } from '../../../utils/redirect';
import type { SignUpCreateResult, SignUpDetailsModel, SignUpDetailsValues, SignUpIdentifier } from '../sign-up.model';
import type {
  SignUpAlternativePhoneScreen,
  SignUpDetails,
  SignUpDetailsScreen,
  SignUpFieldName,
  SignUpFields,
  SignUpValues,
} from '../sign-up.types';
import { signUpFieldNames } from '../sign-up.utils';

const ALTERNATIVE_PHONE_FIELDS: SignUpFields = { phoneNumber: { required: true } };

const emptyValues: SignUpValues = {
  firstName: '',
  lastName: '',
  username: '',
  identifier: '',
  emailAddress: '',
  phoneNumber: '',
  password: '',
  code: '',
  backupCode: '',
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: false,
  legalAccepted: false,
};

function otherIdentifier(identifier: SignUpIdentifier): 'emailAddress' | 'phoneNumber' {
  return identifier === 'phoneNumber' ? 'emailAddress' : 'phoneNumber';
}

function canSwitch(purpose: 'start' | 'continue', details: SignUpDetailsModel): boolean {
  return purpose === 'continue' ? details.continueCanSwitchIdentifier : details.canSwitchIdentifier;
}

function detailsStep(
  purpose: 'start' | 'continue',
  fields: SignUpFields,
  details: SignUpDetailsModel,
  identifier: SignUpIdentifier,
): SignUpDetails {
  return {
    purpose,
    fields,
    nextField: canSwitch(purpose, details) && identifier ? otherIdentifier(identifier) : undefined,
    legalConsent: purpose === 'continue' ? details.continueLegalConsent : details.legalConsent,
  };
}

function requiredFields(
  fields: SignUpFields,
  consentRequired: boolean,
  m: MosaicMessages['signUp'],
): FieldsConfig<SignUpValues> {
  const config: FieldsConfig<SignUpValues> = {};
  for (const name of signUpFieldNames(fields)) {
    if (fields[name]?.required) {
      config[name] = {
        validate: value => (value.trim() === '' ? { type: 'error', message: m.form.required[name] } : undefined),
      };
    }
  }
  if (consentRequired) {
    config.legalAccepted = {
      validate: accepted => (accepted ? undefined : { type: 'error', message: m.legalConsent.required }),
    };
  }
  return config;
}

function detailsValues(values: SignUpValues, fields: SignUpFields): SignUpDetailsValues {
  const pick = (name: SignUpFieldName) => (fields[name] && !fields[name].disabled ? values[name] : undefined);
  return {
    emailAddress: pick('emailAddress'),
    phoneNumber: pick('phoneNumber'),
    username: pick('username')?.trim(),
    password: pick('password'),
    firstName: pick('firstName'),
    lastName: pick('lastName'),
    legalAccepted: values.legalAccepted || undefined,
  };
}

interface SignUpDetailsOptions {
  purpose: 'start' | 'continue';
  isBusy: boolean;
  globalErrorMessage?: string;
  onSubmit?: () => void;
  onNext: (result: SignUpCreateResult) => void;
  onSignIn: () => void;
  startEnterpriseSso: () => Promise<SignUpCreateResult | undefined>;
}

export function useSignUpDetailsController(
  details: SignUpDetailsModel,
  { purpose, isBusy, globalErrorMessage, onSubmit, onNext, onSignIn, startEnterpriseSso }: SignUpDetailsOptions,
) {
  const [chosenIdentifier, setChosenIdentifier] = useState<SignUpIdentifier | undefined>(undefined);
  const [chosenChannel, setChosenChannel] = useState<PhoneCodeChannel | undefined>(undefined);
  const genericError = useMessages('errors').generic;
  const m = useMessages('signUp');
  const providerActions = usePendingAction<string>();
  const identifier = chosenIdentifier ?? details.initialIdentifier;
  const startFields = details.startFieldsFor(identifier);
  const continueFields = details.continueFieldsFor(identifier);
  const channel = purpose === 'start' ? chosenChannel : undefined;
  const alternativeChannel = details.alternativeChannels.find(provider => provider.id === channel);
  const fields = alternativeChannel ? ALTERNATIVE_PHONE_FIELDS : purpose === 'continue' ? continueFields : startFields;

  const consentRequired = Boolean(purpose === 'continue' ? details.continueLegalConsent : details.legalConsent);

  const form = useForm<SignUpValues, SignUpCreateResult | undefined>({
    initialValues: { ...emptyValues, ...details.prefill },
    fields: requiredFields(fields, consentRequired, m),
    onSubmit: async values => {
      onSubmit?.();
      providerActions.reset();
      const submitted = detailsValues(values, fields);
      const result =
        purpose === 'continue' || details.inTicketSignUp
          ? await details.update(submitted)
          : await details.create(
              { ...submitted, ...details.startHiddenValuesFor(identifier) },
              { channel: alternativeChannel?.id },
            );
      if (result.type !== 'enterprise_sso') {
        return result;
      }
      const connections = await startEnterpriseSso();
      if (connections) {
        return connections;
      }
      await new Promise(resolve => setTimeout(resolve, REDIRECT_HOLD_MS));
      return undefined;
    },
    onSuccess: result => {
      if (result) {
        onNext(result);
      }
    },
  });

  const password = form.values.password;
  const strength = useDebouncedAsync(password, value => details.validatePassword(value), {
    delayMs: DEBOUNCE_MS,
    enabled: Boolean(fields.password) && (password !== '' || form.fields.password.touched),
  });
  const passwordFeedback: FieldFeedback | undefined = strength.isError
    ? { type: 'error', message: genericError }
    : strength.data;
  const isPending = form.isSubmitting || isBusy || providerActions.isPending;

  const screen: Omit<SignUpDetailsScreen, 'step' | 'onSwitchField' | 'socialProviders' | 'onSelectProvider'> = {
    form,
    onSubmit: form.handleSubmit,
    isPending,
    isDisabled: isPending,
    globalErrorMessage: form.error ?? providerActions.error ?? globalErrorMessage,
    pendingProviderId: providerActions.pendingKey,
    passwordFeedback,
    onSignIn,
  };

  const switchChannel = (next: PhoneCodeChannel | undefined) => {
    setChosenChannel(next);
    form.reset(form.values);
  };

  const alternativePhone: SignUpAlternativePhoneScreen | undefined = alternativeChannel
    ? {
        channel: alternativeChannel,
        legalConsent: details.legalConsent,
        form,
        onSubmit: form.handleSubmit,
        isPending,
        isDisabled: isPending,
        globalErrorMessage: form.error ?? globalErrorMessage,
        onCancel: () => switchChannel(undefined),
      }
    : undefined;

  const selectOAuth = (id: string) => {
    const provider = details.oauthProviders.find(oauth => oauth.id === id);
    if (!provider) {
      return;
    }
    void providerActions.run(id, async () => {
      const result = await details.sso(provider.id, {
        legalAccepted: form.values.legalAccepted,
        continueSignUp: purpose === 'continue',
      });
      if (result) {
        onNext(result);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, REDIRECT_HOLD_MS));
    });
  };

  const switchField = (purpose: 'start' | 'continue') =>
    canSwitch(purpose, details) ? () => setChosenIdentifier(otherIdentifier(identifier)) : undefined;

  return {
    alternativePhone,
    start: {
      ...screen,
      step: detailsStep('start', startFields, details, identifier),
      onSwitchField: switchField('start'),
      socialProviders: [...details.oauthProviders, ...details.alternativeChannels],
      onSelectProvider: (id: string) => {
        const channel = details.alternativeChannels.find(provider => provider.id === id)?.id;
        if (channel) {
          switchChannel(channel);
          return;
        }
        selectOAuth(id);
      },
    },
    continue: {
      ...screen,
      step: detailsStep('continue', continueFields, details, identifier),
      onSwitchField: switchField('continue'),
      socialProviders: details.continueOAuthProviders,
      onSelectProvider: selectOAuth,
    },
    error: form.error,
    leaveChannel: () => switchChannel(undefined),
    adoptInvitation: (emailAddress: string) => form.setValue('emailAddress', emailAddress),
    reset: () => {
      form.reset();
      setChosenChannel(undefined);
    },
  };
}
