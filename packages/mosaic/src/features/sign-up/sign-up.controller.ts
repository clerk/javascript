import { DEBOUNCE_MS } from '@clerk/shared/internal/clerk-js/constants';
import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { useCallback, useEffect, useState } from 'react';

import type { FieldFeedback } from '../../components/form';
import { useForm } from '../../components/form';
import { useDebouncedAsync } from '../../hooks/use-debounced-async';
import { usePendingAction } from '../../hooks/use-pending-action';
import type { ErrorDescription } from '../../localization';
import { useErrorText, useMessages } from '../../localization';
import { setup } from '../../machine/setup';
import type { DoneInvokeEvent, ErrorInvokeEvent } from '../../machine/types';
import { useMachine } from '../../machine/use-machine';
import type { MosaicLocationOptions } from '../../routing/use-mosaic-location';
import { useRouterScope } from '../../routing/use-router';
import { toLocalizableError } from '../../utils/errors';
import type {
  SignUpData,
  SignUpDetailsValues,
  SignUpFinish,
  SignUpIdentifier,
  SignUpReadyModel,
} from './sign-up.model';
import type { SignUpRoute } from './sign-up.routes';
import { detailsRouteFor, routeFor, shownRoute, signUpRoutes } from './sign-up.routes';
import type {
  SignUpDetails,
  SignUpFieldName,
  SignUpFields,
  SignUpScreen,
  SignUpValues,
  SignUpViewProps,
} from './sign-up.types';

interface FinishContext {
  frozenModel: SignUpReadyModel | null;
  error: ErrorDescription | undefined;
}

type FinishEvent = { type: 'FINISH'; frozenModel: SignUpReadyModel } | { type: 'TASK_READY' };

const finish = setup<FinishContext, FinishEvent>();

const finishMachine = finish.createMachine({
  id: 'signUpFinish',
  initial: 'idle',
  context: {
    frozenModel: null,
    error: undefined,
  },
  states: {
    idle: {
      on: {
        FINISH: {
          target: 'finishing',
          actions: finish.assign<Extract<FinishEvent, { type: 'FINISH' }>>((_, event) => ({
            frozenModel: event.frozenModel,
            error: undefined,
          })),
        },
      },
    },
    finishing: {
      invoke: finish.fromPromise(
        context => context.frozenModel?.finalize() ?? Promise.resolve<SignUpFinish>('leaving'),
        {
          onDone: [
            {
              guard: (_: FinishContext, event: DoneInvokeEvent<SignUpFinish>) => event.output === 'task',
              target: 'preparingTask' as const,
            },
            { target: 'finished' as const },
          ],
          onError: {
            target: 'idle',
            actions: finish.assign<ErrorInvokeEvent>((_, event) => ({
              frozenModel: null,
              error: toLocalizableError(event.error),
            })),
          },
        },
      ),
    },
    preparingTask: {
      on: { TASK_READY: { target: 'idle', actions: finish.assign(() => ({ frozenModel: null })) } },
    },
    finished: {},
  },
});

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

function screenFor(route: SignUpRoute | undefined, data: SignUpData): SignUpScreen {
  if (route === undefined || route === 'enterpriseConnections' || route === 'protectCheck') {
    return 'startOver';
  }
  if (route !== 'start') {
    return route;
  }
  if (data.actionBlocked) {
    return 'actionBlocked';
  }
  return data.mode === 'public' ? 'start' : data.mode;
}

function otherIdentifier(identifier: SignUpIdentifier): 'emailAddress' | 'phoneNumber' {
  return identifier === 'phoneNumber' ? 'emailAddress' : 'phoneNumber';
}

function detailsStep(
  purpose: 'start' | 'continue',
  fields: SignUpFields,
  data: SignUpData,
  identifier: SignUpIdentifier,
): SignUpDetails {
  const nextField = data.canSwitchIdentifier && identifier ? otherIdentifier(identifier) : undefined;
  return {
    purpose,
    fields,
    nextField,
    legalConsent: purpose === 'continue' ? data.continueLegalConsent : data.legalConsent,
  };
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

type SignUpControllerResult = Omit<
  SignUpViewProps,
  'applicationName' | 'applicationLogoUrl' | 'taskChooseOrganization'
> & {
  isPreparingTask: boolean;
  onTaskReady: () => void;
};

export function useSignUpController(
  liveModel: SignUpReadyModel,
  options: MosaicLocationOptions,
): SignUpControllerResult {
  const { route, go } = useRouterScope(signUpRoutes, { ...options, root: 'start' });
  const [chosenIdentifier, setChosenIdentifier] = useState<SignUpIdentifier | undefined>(undefined);
  const actions = usePendingAction<'startOver'>();
  const errorText = useErrorText();
  const genericError = useMessages('errors').generic;
  const [finishSnapshot, sendFinish] = useMachine(finishMachine);

  const model = finishSnapshot.context.frozenModel ?? liveModel;
  const isFinishing = finishSnapshot.value !== 'idle';
  const onTaskReady = useCallback(() => sendFinish({ type: 'TASK_READY' }), [sendFinish]);

  const { step } = model;
  const identifier = chosenIdentifier ?? model.initialIdentifier;
  const shown = shownRoute(route, step);
  const screen = screenFor(shown, model);

  // A route the step does not allow is replaced with the screen that is shown, so the stored route, and the
  // address bar once the URL routing modes land (#10780), never keeps it. Replacing leaves no history entry.
  // TODO: Once #10780 lands, move this replace into `useRouterScope` as a guard option, so sign-in and sign-up
  // share one owner redirect instead of each keeping an effect.
  useEffect(() => {
    if (shown !== undefined && shown !== route) {
      go(shown, {}, { replace: true });
    }
  }, [shown, route, go]);

  // TODO: With a URL routing mode (#10780) a reload can mount on a sign-up that is already complete. Finalize it
  // here, once per mount.
  const next = (nextStep: SignUpNextStep) => {
    if (nextStep.type === 'complete') {
      sendFinish({ type: 'FINISH', frozenModel: model });
      return;
    }
    const nextRoute = routeFor(nextStep, route);
    if (nextRoute) {
      go(nextRoute);
    }
  };

  const startFields = model.startFieldsFor(identifier);
  const continueFields = model.continueFieldsFor(identifier);
  const fields = screen === 'continue' ? continueFields : startFields;

  const form = useForm<SignUpValues, SignUpNextStep | undefined>({
    initialValues: { ...emptyValues, ...model.prefill },
    onSubmit: values => {
      const details = detailsValues(values, fields);
      return screen === 'continue'
        ? model.update(details)
        : model.create({ ...details, ...model.startHiddenValuesFor(identifier) });
    },
    onSuccess: nextStep => {
      if (nextStep) {
        next(nextStep);
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
  const isPending = form.isSubmitting || actions.isPending || isFinishing;
  const finishError = finishSnapshot.context.error ? errorText(finishSnapshot.context.error) : undefined;
  const globalErrorMessage = form.error ?? finishError ?? actions.error;

  const details = {
    socialProviders: [],
    onSelectProvider: () => undefined,
    form,
    onSubmit: form.handleSubmit,
    isPending,
    isDisabled: isPending,
    globalErrorMessage,
    passwordFeedback,
    onSwitchField: model.canSwitchIdentifier ? () => setChosenIdentifier(otherIdentifier(identifier)) : undefined,
    onSignIn: model.goToSignIn,
  };
  const verify = {
    isPending: isFinishing,
    globalErrorMessage: finishError,
    onEditIdentifier: () => go(detailsRouteFor(route)),
  };

  return {
    isPreparingTask: finishSnapshot.value === 'preparingTask',
    onTaskReady,
    screen,
    attempt: model.signUpId,
    start: { ...details, step: detailsStep('start', startFields, model, identifier) },
    continue: { ...details, step: detailsStep('continue', continueFields, model, identifier) },
    verifyEmail: {
      ...verify,
      identifier: model.emailAddress ?? '',
      needsCode: step.type === 'verify_email' && !step.sent,
      sendCode: model.sendEmailCode,
      verifyCode: async (code: string) => next(await model.verifyEmailCode(code)),
    },
    verifyPhone: {
      ...verify,
      identifier: model.phoneNumber ?? '',
      needsCode: step.type === 'verify_phone' && !step.sent,
      sendCode: model.sendPhoneCode,
      verifyCode: async (code: string) => next(await model.verifyPhoneCode(code)),
    },
    restricted: {
      globalErrorMessage,
      onEmailSupport: supportEmail ? () => window.location.assign(`mailto:${supportEmail}`) : undefined,
      onJoinWaitlist: model.joinWaitlist,
      onSignIn: model.goToSignIn,
    },
    actionBlocked: model.actionBlocked,
    onStartOver: () =>
      void actions.run('startOver', async () => {
        await model.reset();
        form.reset();
        go('start');
      }),
  };
}
