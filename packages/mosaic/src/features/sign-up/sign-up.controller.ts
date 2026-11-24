import { useEffect, useRef, useState } from 'react';

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
import { flowOutcome } from '../auth-flow/auth-flow.utils';
import type { SignUpCreateResult, SignUpFlowModel, SignUpReadyModel } from './sign-up.model';
import type { SignUpRoute } from './sign-up.routes';
import { detailsRouteFor, routeFor, shownRoute, signUpRoutes } from './sign-up.routes';
import type { SignUpProtectScreen, SignUpScreen, SignUpVerifyScreen, SignUpViewProps } from './sign-up.types';
import { useSignUpDetailsController } from './sign-up-details/sign-up-details.controller';

interface FinishContext {
  frozenModel: SignUpReadyModel | null;
  error: ErrorDescription | undefined;
}

type FinishStart = { type: 'FINISH'; frozenModel: SignUpReadyModel };

type FinishEvent = FinishStart | { type: 'DISMISS' };

const finish = setup<FinishContext, FinishEvent>();

const startFinishing = {
  FINISH: {
    target: 'finishing' as const,
    actions: finish.assign<FinishStart>((_, event) => ({ frozenModel: event.frozenModel, error: undefined })),
  },
};

const finishMachine = finish.createMachine({
  id: 'signUpFinish',
  initial: 'idle',
  context: {
    frozenModel: null,
    error: undefined,
  },
  states: {
    idle: {
      on: startFinishing,
    },
    finishing: {
      invoke: finish.fromPromise(context => context.frozenModel?.flow.finalize() ?? Promise.resolve(), {
        onDone: { target: 'finalized' },
        onError: {
          target: 'failed',
          actions: finish.assign<ErrorInvokeEvent>((_, event) => ({
            frozenModel: null,
            error: toLocalizableError(event.error),
          })),
        },
      }),
    },
    failed: {
      on: {
        ...startFinishing,
        DISMISS: { target: 'idle', actions: finish.assign(() => ({ error: undefined })) },
      },
    },
    finalized: {
      on: startFinishing,
    },
  },
});

function screenFor(route: SignUpRoute | undefined, mode: SignUpFlowModel['mode'], isBlocked: boolean): SignUpScreen {
  if (route === undefined || route === 'enterpriseConnections') {
    return 'startOver';
  }
  if (isBlocked && (route === 'start' || route === 'protectCheck' || route === 'continueProtectCheck')) {
    return 'actionBlocked';
  }
  if (route !== 'start') {
    return route;
  }
  return mode === 'public' ? 'start' : mode;
}

type SignUpControllerResult =
  | { status: 'hidden' }
  | (Omit<
      SignUpViewProps,
      'applicationName' | 'logo' | 'taskChooseOrganization' | 'verifyEmail' | 'verifyPhone' | 'protectCheck'
    > & {
      status: 'ready';
      attempt?: string;
      verifyEmail: SignUpVerifyScreen;
      verifyPhone: SignUpVerifyScreen;
      protectCheck: SignUpProtectScreen;
    });

export function useSignUpController(
  liveModel: SignUpReadyModel,
  { isTaskReady, ...options }: MosaicLocationOptions & { isTaskReady: boolean },
): SignUpControllerResult {
  const { route, go } = useRouterScope(signUpRoutes, { ...options, root: 'start' });
  const actions = usePendingAction<'startOver'>();
  const errorText = useErrorText();
  const [finishSnapshot, sendFinish] = useMachine(finishMachine);
  const [arrival] = useState(() => ({ session: liveModel.flow.session.type, leave: liveModel.flow.leave }));
  const [blocked, setBlocked] = useState<AuthActionBlockedDetails>();
  const expiredProtectReloads = useRef(0);
  const outcome = flowOutcome({
    session: liveModel.flow.session,
    entry: arrival.session,
    finish: finishSnapshot.value,
    singleSession: liveModel.flow.singleSession,
    isTaskReady,
  });
  const isHolding = outcome.type === 'hold';
  const isLeaving = outcome.type === 'leave';

  useEffect(() => {
    if (isLeaving) {
      arrival.leave();
    }
  }, [isLeaving, arrival]);

  const model = isHolding ? (finishSnapshot.context.frozenModel ?? liveModel) : liveModel;
  const { flow, navigation, verification } = model;
  const shown = shownRoute(route, outcome, flow.step);
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
    isBusy: actions.isPending || isHolding,
    globalErrorMessage: flowError,
    onNext: next,
    onSignIn: navigation.goToSignIn,
  });
  const verify = {
    onNext: next,
    isPending: isHolding,
    globalErrorMessage: finishError,
    onEditIdentifier: () => {
      sendFinish({ type: 'DISMISS' });
      go(detailsRouteFor(route));
    },
  };

  if (isLeaving || outcome.type === 'done') {
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
    protectCheck: { protect: model.protect, expiredReloads: expiredProtectReloads, onNext: next },
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
