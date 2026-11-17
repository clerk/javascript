import { DEBOUNCE_MS } from '@clerk/shared/internal/clerk-js/constants';
import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { useEffect, useState } from 'react';

import type { FieldFeedback } from '../../components/form';
import { useForm } from '../../components/form';
import { useDebouncedAsync } from '../../hooks/use-debounced-async';
import { usePendingAction } from '../../hooks/use-pending-action';
import { useResendSeconds } from '../../hooks/use-resend-seconds';
import type { ErrorDescription } from '../../localization';
import { useErrorText, useMessages } from '../../localization';
import { setup } from '../../machine/setup';
import type { ErrorInvokeEvent } from '../../machine/types';
import { useMachine } from '../../machine/use-machine';
import type { MosaicLocationOptions } from '../../routing/use-mosaic-location';
import { useRouterScope } from '../../routing/use-router';
import { toLocalizableError } from '../../utils/errors';
import { CODE_RESEND_SECONDS, isResendUnlocked, resendUnlockTime } from '../../utils/verification';
import type { SignUpData, SignUpDetailsValues, SignUpIdentifier, SignUpReadyModel } from './sign-up.model';
import type { SignUpRoute } from './sign-up.routes';
import { allowedRoute, routeFor, signUpRoutes } from './sign-up.routes';
import type { SignUpFieldName, SignUpFields, SignUpStep, SignUpValues, SignUpViewProps } from './sign-up.types';

export type SignUpScreen = SignUpRoute | 'startOver';

type CodeChannel = 'email' | 'phone';

interface CodeContext {
  sendCode: (channel: CodeChannel) => Promise<void>;
  channel: CodeChannel | undefined;
  resendAvailableAt: number | undefined;
  error: ErrorDescription | undefined;
}

type CodeEvent = { type: 'SEND'; channel: CodeChannel } | { type: 'RESEND'; channel: CodeChannel } | { type: 'LEAVE' };

const code = setup<CodeContext, CodeEvent>();

const codeMachine = code.createMachine({
  id: 'signUpCode',
  initial: 'idle',
  context: {
    sendCode: () => Promise.resolve(),
    channel: undefined,
    resendAvailableAt: undefined,
    error: undefined,
  },
  states: {
    idle: {
      on: {
        RESEND: {
          target: 'sending',
          actions: code.assign<Extract<CodeEvent, { type: 'RESEND' }>>((_, event) => ({
            channel: event.channel,
            error: undefined,
          })),
        },
        SEND: {
          target: 'sending',
          actions: code.assign<Extract<CodeEvent, { type: 'SEND' }>>((_, event) => ({
            channel: event.channel,
            error: undefined,
          })),
        },
      },
    },
    sending: {
      on: { LEAVE: { target: 'idle', actions: code.assign(() => ({ channel: undefined })) } },
      invoke: code.fromPromise(context => (context.channel ? context.sendCode(context.channel) : Promise.resolve()), {
        onDone: {
          target: 'sent',
          actions: code.assign(() => ({ resendAvailableAt: resendUnlockTime(CODE_RESEND_SECONDS) })),
        },
        onError: {
          target: 'sent',
          actions: code.assign<ErrorInvokeEvent>((_, event) => ({ error: toLocalizableError(event.error) })),
        },
      }),
    },
    sent: {
      on: {
        RESEND: {
          target: 'sending',
          guard: context => isResendUnlocked(context.resendAvailableAt),
          actions: code.assign(() => ({ error: undefined })),
        },
        LEAVE: { target: 'idle', actions: code.assign(() => ({ channel: undefined, resendAvailableAt: undefined })) },
      },
    },
  },
});

function unsentCodeChannel(step: SignUpNextStep): CodeChannel | undefined {
  if (step.type === 'verify_email' && !step.sent) {
    return 'email';
  }
  return step.type === 'verify_phone' && !step.sent ? 'phone' : undefined;
}

function screenCodeChannel(screen: SignUpScreen): CodeChannel | undefined {
  if (screen === 'verifyEmail') {
    return 'email';
  }
  return screen === 'verifyPhone' ? 'phone' : undefined;
}

function detailsFieldsFor(screen: SignUpScreen, data: SignUpData, identifier: SignUpIdentifier): SignUpFields {
  return screen === 'continue' ? data.continueFieldsFor(identifier) : data.startFieldsFor(identifier);
}

const emptyValues: SignUpValues = {
  identifier: '',
  emailAddress: '',
  phoneNumber: '',
  password: '',
  code: '',
  backupCode: '',
  firstName: '',
  lastName: '',
  username: '',
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: false,
  legalAccepted: false,
};

export function signUpScreen(route: SignUpRoute, step: SignUpNextStep): SignUpScreen {
  if (step.type === 'unknown') {
    return 'startOver';
  }
  return allowedRoute(route, step) ? route : (routeFor(step) ?? 'startOver');
}

function otherIdentifier(identifier: SignUpIdentifier): SignUpIdentifier {
  return identifier === 'phoneNumber' ? 'emailAddress' : 'phoneNumber';
}

function detailsStep(
  purpose: 'start' | 'continue',
  fields: SignUpFields,
  data: SignUpData,
  identifier: SignUpIdentifier,
): SignUpStep {
  const nextField = data.canSwitchIdentifier && identifier ? otherIdentifier(identifier) : undefined;
  return {
    kind: 'details',
    purpose,
    fields,
    nextField: nextField ?? undefined,
    legalConsent: purpose === 'continue' ? data.continueLegalConsent : data.legalConsent,
  };
}

export function signUpViewStep(screen: SignUpScreen, data: SignUpData, identifier: SignUpIdentifier): SignUpStep {
  switch (screen) {
    case 'start':
      if (data.actionBlocked) {
        return { kind: 'notice', purpose: 'action-blocked', details: data.actionBlocked };
      }
      if (data.mode !== 'public') {
        return { kind: 'notice', purpose: data.mode };
      }
      return detailsStep('start', data.startFieldsFor(identifier), data, identifier);
    case 'continue':
      return detailsStep('continue', data.continueFieldsFor(identifier), data, identifier);
    case 'verifyEmail':
      return { kind: 'code', purpose: 'verify-email', identifier: data.emailAddress ?? '' };
    case 'verifyPhone':
      return { kind: 'code', purpose: 'verify-phone', identifier: data.phoneNumber ?? '' };
    case 'enterpriseConnections':
    case 'protectCheck':
    case 'startOver':
      return { kind: 'notice', purpose: 'start-over' };
  }
}

function detailsValues(values: SignUpValues, fields: SignUpFields): SignUpDetailsValues {
  const pick = (name: SignUpFieldName) => (fields[name] ? values[name] : undefined);
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

type SignUpControllerResult = Omit<SignUpViewProps, 'applicationName' | 'applicationLogoUrl'> & {
  screen: SignUpScreen;
};

export function useSignUpController(model: SignUpReadyModel, options: MosaicLocationOptions): SignUpControllerResult {
  const { route, go } = useRouterScope(signUpRoutes, { ...options, root: 'start' });
  const [chosenIdentifier, setChosenIdentifier] = useState<SignUpIdentifier | undefined>(undefined);
  const [detailsRoute, setDetailsRoute] = useState<'start' | 'continue'>('start');
  const actions = usePendingAction<'code' | 'finalize' | 'startOver'>();
  const errorText = useErrorText();
  const genericError = useMessages('errors').generic;
  const [codeSnapshot, sendCodeEvent, codeActor] = useMachine(codeMachine, {
    context: {
      sendCode: channel => (channel === 'phone' ? model.sendPhoneCode() : model.sendEmailCode()),
    },
  });
  const resendSeconds = useResendSeconds(codeSnapshot.context.resendAvailableAt, CODE_RESEND_SECONDS);

  const identifier = chosenIdentifier ?? model.initialIdentifier;
  const screen = signUpScreen(route, model.step);
  const fields = detailsFieldsFor(screen, model, identifier);

  // A route the step does not allow is replaced with the screen that is shown, so the stored route, and the
  // address bar once the URL routing modes land (#10780), never keeps it. Replacing leaves no history entry.
  useEffect(() => {
    if (screen !== 'startOver' && screen !== route) {
      go(screen, {}, { replace: true });
    }
  }, [screen, route, go]);

  // TODO: With a URL routing mode (#10780) a reload can mount on a verify screen. Send the code here when the step
  // says none is out, and finalize a sign-up that is already complete, each once per mount.
  const goTo = (nextRoute: SignUpRoute) => {
    sendCodeEvent({ type: 'LEAVE' });
    go(nextRoute);
  };

  const next = async (step: SignUpNextStep) => {
    if (step.type === 'complete') {
      await model.finalize();
      return;
    }
    const nextRoute = routeFor(step);
    if (!nextRoute) {
      return;
    }
    if (screen === 'start' || screen === 'continue') {
      setDetailsRoute(screen);
    }
    goTo(nextRoute);
    const channel = unsentCodeChannel(step);
    if (channel) {
      sendCodeEvent({ type: 'SEND', channel });
    }
  };

  const form = useForm<SignUpValues, SignUpNextStep | undefined>({
    initialValues: { ...emptyValues, ...model.prefill },
    onSubmit: values => {
      const details = detailsValues(values, fields);
      return screen === 'continue'
        ? model.update(details)
        : model.create({ ...details, ...model.startHiddenValuesFor(identifier) });
    },
    onSuccess: step => {
      if (step) {
        void actions.run('finalize', () => next(step));
      }
    },
  });

  const { supportEmail } = model;
  const password = form.values.password;
  const strength = useDebouncedAsync(password, value => model.validatePassword(value), {
    delayMs: DEBOUNCE_MS,
    enabled: Boolean(fields.password) && (password !== '' || form.fields.password.touched),
  });
  const passwordFeedback: FieldFeedback | undefined = strength.isError
    ? { type: 'error', message: genericError }
    : strength.data;
  const resendChannel = screenCodeChannel(screen);
  const verify = resendChannel === 'phone' ? model.verifyPhoneCode : model.verifyEmailCode;

  return {
    screen,
    step: signUpViewStep(screen, model, identifier),
    socialProviders: [],
    onSelectProvider: () => undefined,
    form,
    onSubmit: event => {
      if (resendChannel) {
        event?.preventDefault();
        void actions.run('code', async () => next(await verify(form.values.code)));
        return;
      }
      form.handleSubmit(event ?? { preventDefault: () => undefined });
    },
    onCodeComplete: code => void actions.run('code', async () => next(await verify(code))),
    isPending: form.isSubmitting || actions.isPending,
    isDisabled: form.isSubmitting || actions.isPending,
    passwordFeedback,
    errorMessage: actions.errorKey === 'code' ? actions.error : undefined,
    globalErrorMessage:
      form.error ??
      (codeSnapshot.context.error ? errorText(codeSnapshot.context.error) : undefined) ??
      (actions.errorKey === 'code' ? undefined : actions.error),
    onSwitchField: model.canSwitchIdentifier ? () => setChosenIdentifier(otherIdentifier(identifier)) : undefined,
    onSignIn: model.goToSignIn,
    onEmailSupport: supportEmail ? () => window.location.assign(`mailto:${supportEmail}`) : undefined,
    onJoinWaitlist: model.joinWaitlist,
    onEditIdentifier: () => goTo(detailsRoute),
    onBack: () => goTo(detailsRoute),
    onStartOver: () =>
      void actions.run('startOver', async () => {
        await model.reset();
        form.reset();
        goTo('start');
      }),
    onResend: resendChannel ? () => sendCodeEvent({ type: 'RESEND', channel: resendChannel }) : undefined,
    canResend:
      resendChannel !== undefined && codeActor.can({ type: 'RESEND', channel: resendChannel }) && !actions.isPending,
    resendRemainingSeconds: resendSeconds || undefined,
  };
}
