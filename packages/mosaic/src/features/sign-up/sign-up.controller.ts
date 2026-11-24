import { useEffect, useLayoutEffect, useState } from 'react';

import type { AuthActionBlockedDetails } from '../../blocks/auth';
import { usePendingAction } from '../../hooks/use-pending-action';
import type { ErrorDescription } from '../../localization';
import { useErrorText } from '../../localization';
import { setup } from '../../machine/setup';
import type { ErrorInvokeEvent } from '../../machine/types';
import { useMachine } from '../../machine/use-machine';
import type { MosaicLocationOptions } from '../../routing/use-mosaic-location';
import { useRouteGuard } from '../../routing/use-route-guard';
import { useRouterScope } from '../../routing/use-router';
import { toLocalizableError } from '../../utils/errors';
import type { SignUpCreateResult, SignUpFlowModel, SignUpReadyModel } from './sign-up.model';
import type { SignUpRoute } from './sign-up.routes';
import { detailsRouteFor, routeFor, shownRoute, signUpRoutes } from './sign-up.routes';
import type { SignUpScreen, SignUpVerifyScreen, SignUpViewProps } from './sign-up.types';
import { useSignUpDetailsController } from './sign-up-details/sign-up-details.controller';

interface FinishContext {
  frozenModel: SignUpReadyModel | null;
  isNextScreenLoading: boolean;
  error: ErrorDescription | undefined;
}

type FinishEvent = { type: 'FINISH'; frozenModel: SignUpReadyModel };

const finish = setup<FinishContext, FinishEvent>();

const startFinishing = {
  FINISH: {
    target: 'finishing' as const,
    actions: finish.assign<FinishEvent>((_, event) => ({ frozenModel: event.frozenModel, error: undefined })),
  },
};

const finishMachine = finish.createMachine({
  id: 'signUpFinish',
  initial: 'idle',
  context: {
    frozenModel: null,
    isNextScreenLoading: false,
    error: undefined,
  },
  states: {
    idle: {
      on: startFinishing,
    },
    finishing: {
      invoke: finish.fromPromise(context => context.frozenModel?.flow.finalize() ?? Promise.resolve(), {
        onDone: { target: 'handingOff' },
        onError: {
          target: 'idle',
          actions: finish.assign<ErrorInvokeEvent>((_, event) => ({
            frozenModel: null,
            error: toLocalizableError(event.error),
          })),
        },
      }),
    },
    handingOff: {
      always: {
        guard: context => !context.isNextScreenLoading,
        target: 'finished',
        actions: finish.assign(() => ({ frozenModel: null })),
      },
    },
    finished: {
      on: startFinishing,
    },
  },
});

function screenFor(route: SignUpRoute | undefined, mode: SignUpFlowModel['mode'], isBlocked: boolean): SignUpScreen {
  if (route === undefined || route === 'enterpriseConnections' || route === 'protectCheck') {
    return 'startOver';
  }
  if (route !== 'start') {
    return route;
  }
  if (isBlocked) {
    return 'actionBlocked';
  }
  return mode === 'public' ? 'start' : mode;
}

type SignUpControllerResult =
  | { status: 'hidden' }
  | (Omit<
      SignUpViewProps,
      'applicationName' | 'applicationLogoUrl' | 'taskChooseOrganization' | 'verifyEmail' | 'verifyPhone'
    > & {
      status: 'ready';
      attempt?: string;
      verifyEmail: SignUpVerifyScreen;
      verifyPhone: SignUpVerifyScreen;
    });

export function useSignUpController(
  liveModel: SignUpReadyModel,
  { isTaskReady, ...options }: MosaicLocationOptions & { isTaskReady: boolean },
): SignUpControllerResult {
  const { route, go } = useRouterScope(signUpRoutes, { ...options, root: 'start' });
  const actions = usePendingAction<'startOver'>();
  const errorText = useErrorText();
  const liveStep = liveModel.flow.step;
  const isNextScreenLoading = liveStep.type === 'leaving' || (liveStep.type === 'task' && !isTaskReady);
  const [finishSnapshot, sendFinish, finishActor] = useMachine(finishMachine, { context: { isNextScreenLoading } });
  const [signedInVisit] = useState(() => (liveStep.type === 'signed_in' ? { leave: liveModel.flow.leave } : undefined));
  const [blocked, setBlocked] = useState<AuthActionBlockedDetails>();
  const arrivedSignedIn = signedInVisit !== undefined;
  const leavesOnArrival = signedInVisit?.leave !== undefined;

  useEffect(() => signedInVisit?.leave?.(), [signedInVisit]);

  useLayoutEffect(() => {
    finishActor.recheck();
  }, [isNextScreenLoading, finishActor]);

  const model = finishSnapshot.context.frozenModel ?? liveModel;
  const { flow, navigation, verification } = model;
  const isFinishing = finishSnapshot.value === 'finishing' || finishSnapshot.value === 'handingOff';
  const shown = shownRoute(route, flow.step.type === 'signed_in' && !arrivedSignedIn ? { type: 'leaving' } : flow.step);
  const isFlowOver = finishSnapshot.value === 'finished' || shown === 'taskChooseOrganization';
  const isHidden = liveStep.type === 'signed_in' && (leavesOnArrival || isFlowOver);
  const screen = screenFor(shown, flow.mode, blocked !== undefined);

  useRouteGuard({ route, go }, shown);

  const next = (result: SignUpCreateResult) => {
    if (result.type === 'blocked') {
      setBlocked(result.details);
      return;
    }
    if (result.type === 'complete') {
      sendFinish({ type: 'FINISH', frozenModel: model });
      return;
    }
    const nextRoute = routeFor(result, route);
    if (nextRoute) {
      go(nextRoute);
    }
  };

  const finishError = finishSnapshot.context.error ? errorText(finishSnapshot.context.error) : undefined;
  const flowError = finishError ?? actions.error;
  const details = useSignUpDetailsController(model.details, {
    purpose: screen === 'continue' ? 'continue' : 'start',
    isBusy: actions.isPending || isFinishing,
    globalErrorMessage: flowError,
    onNext: next,
    onSignIn: navigation.goToSignIn,
  });
  const verify = {
    onNext: next,
    isPending: isFinishing,
    globalErrorMessage: finishError,
    onEditIdentifier: () => go(detailsRouteFor(route)),
  };

  if (isHidden) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    screen,
    attempt: flow.signUpId,
    start: details.start,
    continue: details.continue,
    verifyEmail: { ...verify, verification: verification.email },
    verifyPhone: { ...verify, verification: verification.phone },
    restricted: {
      globalErrorMessage: details.error ?? flowError,
      onEmailSupport: navigation.emailSupport,
      onJoinWaitlist: navigation.joinWaitlist,
      onSignIn: navigation.goToSignIn,
    },
    actionBlocked: blocked,
    startOver: {
      isPending: actions.isPending,
      globalErrorMessage: actions.error,
      onStartOver: () =>
        void actions.run('startOver', async () => {
          await flow.reset();
          details.reset();
          go('start');
        }),
    },
  };
}
