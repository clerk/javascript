import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { useState } from 'react';

import { useForm } from '../../components/form';
import { usePendingAction } from '../../hooks/use-pending-action';
import type { MosaicLocationOptions } from '../../routing/use-mosaic-location';
import { useRouterScope } from '../../routing/use-router';
import type { SignUpRoute } from './sign-up.layout';
import { allowedRoute, routeFor, signUpRoutes } from './sign-up.layout';
import type { SignUpData, SignUpDetailsValues, SignUpIdentifier, SignUpModel } from './sign-up.model';
import type { SignUpFieldName, SignUpFields, SignUpStep, SignUpValues, SignUpViewProps } from './sign-up.types';

export type SignUpScreen = SignUpRoute | 'startOver';

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

  const identifier = chosenIdentifier ?? (ready ? model.initialIdentifier : null);
  // TODO: When the URL routing modes land (#10780), replace the stored route with `screen` when they differ,
  // so the address bar never keeps a route the step doesn't allow. In virtual mode the stale route is never seen.
  const screen = ready && route ? signUpScreen(route, model.step) : undefined;
  const fields =
    !ready || !screen
      ? {}
      : screen === 'continue'
        ? model.continueFieldsFor(identifier)
        : model.startFieldsFor(identifier);

  const next = (step: SignUpNextStep) => {
    if (!ready) {
      return;
    }
    if (step.type === 'complete') {
      void actions.run('finalize', model.finalize);
      return;
    }
    const nextRoute = routeFor(step);
    if (nextRoute) {
      go(nextRoute);
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
        next(step);
      }
    },
  });

  if (!ready || !screen) {
    return { status: 'loading' };
  }

  const verify = screen === 'verifyPhone' ? model.verifyPhoneCode : model.verifyEmailCode;

  return {
    status: 'ready',
    screen,
    step: signUpViewStep(screen, model, identifier),
    socialProviders: [],
    onSelectProvider: () => undefined,
    form,
    onSubmit: event => form.handleSubmit(event ?? { preventDefault: () => undefined }),
    onCodeComplete: code => void actions.run('code', async () => next(await verify(code))),
    isPending: form.isSubmitting || actions.isPending,
    isDisabled: form.isSubmitting || actions.isPending,
    errorMessage: actions.errorKey === 'code' ? actions.error : undefined,
    globalErrorMessage: form.error ?? (actions.errorKey === 'code' ? undefined : actions.error),
    onSwitchField: model.canSwitchIdentifier ? () => setChosenIdentifier(otherIdentifier(identifier)) : undefined,
    onEditIdentifier: () => go('start'),
    onBack: () => go('start'),
    onStartOver: () =>
      void actions.run('startOver', async () => {
        await model.reset();
        go('start');
      }),
    canResend: false,
  };
}
