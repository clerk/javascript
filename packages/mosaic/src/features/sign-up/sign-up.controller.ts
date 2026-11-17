import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { useState } from 'react';

import { useForm } from '../../components/form';
import { usePendingAction } from '../../hooks/use-pending-action';
import { useResendSeconds } from '../../hooks/use-resend-seconds';
import type { ErrorDescription } from '../../localization';
import { useErrorText } from '../../localization';
import { setup } from '../../machine/setup';
import type { ErrorInvokeEvent } from '../../machine/types';
import { useMachine } from '../../machine/use-machine';
import type { MosaicLocationOptions } from '../../routing/use-mosaic-location';
import { useRouterScope } from '../../routing/use-router';
import { toLocalizableError } from '../../utils/errors';
import { CODE_RESEND_SECONDS, isResendUnlocked, resendUnlockTime } from '../../utils/verification';
import type { SignUpData, SignUpDetailsValues, SignUpIdentifier, SignUpModel } from './sign-up.model';
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
      on: { LEAVE: { actions: code.assign(() => ({ channel: undefined })) } },
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

const initialValues: SignUpValues = {
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
    legalConsent: data.legalConsent,
  };
}

export function signUpViewStep(screen: SignUpScreen, data: SignUpData, identifier: SignUpIdentifier): SignUpStep {
  switch (screen) {
    case 'start':
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
    username: pick('username'),
    password: pick('password'),
    firstName: pick('firstName'),
    lastName: pick('lastName'),
    legalAccepted: values.legalAccepted || undefined,
  };
}

type SignUpControllerResult =
  | { status: 'loading' }
  | (Omit<SignUpViewProps, 'applicationName' | 'applicationLogoUrl'> & { status: 'ready'; screen: SignUpScreen });

export function useSignUpController(model: SignUpModel, options: MosaicLocationOptions): SignUpControllerResult {
  const ready = model.status === 'ready';
  const { route, go } = useRouterScope(signUpRoutes, { ...options, root: 'start', ready });
  const [chosenIdentifier, setChosenIdentifier] = useState<SignUpIdentifier | undefined>(undefined);
  const actions = usePendingAction<'code' | 'finalize' | 'startOver'>();
  const errorText = useErrorText();
  const [codeSnapshot, sendCodeEvent, codeActor] = useMachine(codeMachine, {
    context: {
      sendCode: channel =>
        !ready ? Promise.resolve() : channel === 'phone' ? model.sendPhoneCode() : model.sendEmailCode(),
    },
  });
  const resendSeconds = useResendSeconds(codeSnapshot.context.resendAvailableAt, CODE_RESEND_SECONDS);

  const identifier = chosenIdentifier ?? (ready ? model.initialIdentifier : null);
  // TODO: When the URL routing modes land (#10780), replace the stored route with `screen` when they differ,
  // so the address bar never keeps a route the step doesn't allow. In virtual mode the stale route is never seen.
  const screen = ready && route ? signUpScreen(route, model.step) : undefined;
  const fields = ready && screen ? detailsFieldsFor(screen, model, identifier) : {};

  const goTo = (nextRoute: SignUpRoute) => {
    sendCodeEvent({ type: 'LEAVE' });
    go(nextRoute);
  };

  const next = async (step: SignUpNextStep) => {
    if (!ready) {
      return;
    }
    if (step.type === 'complete') {
      await model.finalize();
      return;
    }
    const nextRoute = routeFor(step);
    if (!nextRoute) {
      return;
    }
    goTo(nextRoute);
    const channel = unsentCodeChannel(step);
    if (channel) {
      sendCodeEvent({ type: 'SEND', channel });
    }
  };

  const form = useForm<SignUpValues, SignUpNextStep | undefined>({
    initialValues,
    onSubmit: async values => {
      if (!ready) {
        return undefined;
      }
      const details = detailsValues(values, fields);
      return screen === 'continue' ? model.update(details) : model.create(details);
    },
    onSuccess: step => {
      if (step) {
        void actions.run('finalize', () => next(step));
      }
    },
  });

  if (!ready || !screen) {
    return { status: 'loading' };
  }

  const resendChannel = screenCodeChannel(screen);
  const verify = resendChannel === 'phone' ? model.verifyPhoneCode : model.verifyEmailCode;

  return {
    status: 'ready',
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
    errorMessage: actions.errorKey === 'code' ? actions.error : undefined,
    globalErrorMessage:
      form.error ??
      (codeSnapshot.context.error ? errorText(codeSnapshot.context.error) : undefined) ??
      (actions.errorKey === 'code' ? undefined : actions.error),
    onSwitchField: model.canSwitchIdentifier ? () => setChosenIdentifier(otherIdentifier(identifier)) : undefined,
    onEditIdentifier: () => goTo('start'),
    onBack: () => goTo('start'),
    onStartOver: () =>
      void actions.run('startOver', async () => {
        await model.reset();
        goTo('start');
      }),
    onResend: resendChannel ? () => sendCodeEvent({ type: 'RESEND', channel: resendChannel }) : undefined,
    canResend:
      resendChannel !== undefined && codeActor.can({ type: 'RESEND', channel: resendChannel }) && !actions.isPending,
    resendRemainingSeconds: resendSeconds || undefined,
  };
}
