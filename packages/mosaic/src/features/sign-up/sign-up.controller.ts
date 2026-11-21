import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

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
import type { SignUpFlowModel, SignUpReadyModel } from './sign-up.model';
import type { SignUpRoute } from './sign-up.routes';
import { detailsRouteFor, routeFor, shownRoute, signUpRoutes } from './sign-up.routes';
import type { SignUpProtectScreen, SignUpScreen, SignUpVerifyScreen, SignUpViewProps } from './sign-up.types';
import { useSignUpDetailsController } from './sign-up-details/sign-up-details.controller';

interface FinishContext {
  frozenModel: SignUpReadyModel | null;
  isLeaving: boolean;
  error: ErrorDescription | undefined;
}

type FinishEvent = { type: 'FINISH'; frozenModel: SignUpReadyModel };

const finish = setup<FinishContext, FinishEvent>();

const finishMachine = finish.createMachine({
  id: 'signUpFinish',
  initial: 'idle',
  context: {
    frozenModel: null,
    isLeaving: false,
    error: undefined,
  },
  states: {
    idle: {
      on: {
        FINISH: {
          target: 'finishing',
          actions: finish.assign<FinishEvent>((_, event) => ({ frozenModel: event.frozenModel, error: undefined })),
        },
      },
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
        guard: context => !context.isLeaving,
        target: 'idle',
        actions: finish.assign(() => ({ frozenModel: null })),
      },
    },
  },
});

function screenFor(route: SignUpRoute | undefined, flow: SignUpFlowModel): SignUpScreen {
  if (route === undefined || route === 'enterpriseConnections') {
    return 'startOver';
  }
  if (route !== 'start') {
    return route;
  }
  if (flow.actionBlocked) {
    return 'actionBlocked';
  }
  return flow.mode === 'public' || flow.ticket ? 'start' : flow.mode;
}

type SignUpControllerResult = Omit<
  SignUpViewProps,
  'applicationName' | 'applicationLogoUrl' | 'taskChooseOrganization' | 'verifyEmail' | 'verifyPhone' | 'protectCheck'
> & {
  attempt?: string;
  verifyEmail: SignUpVerifyScreen;
  verifyPhone: SignUpVerifyScreen;
  protectCheck: SignUpProtectScreen;
};

export function useSignUpController(
  liveModel: SignUpReadyModel,
  options: MosaicLocationOptions,
): SignUpControllerResult {
  const { route, go } = useRouterScope(signUpRoutes, { ...options, root: 'start' });
  const actions = usePendingAction<'startOver' | 'ticket' | 'return'>();
  const redeemedTicket = useRef<string | undefined>(undefined);
  const completedReturn = useRef(false);
  const [isReturning, setIsReturning] = useState(liveModel.flow.isReturning);
  const errorText = useErrorText();
  const isLeaving = liveModel.flow.step.type === 'leaving';
  const [finishSnapshot, sendFinish, finishActor] = useMachine(finishMachine, { context: { isLeaving } });

  // TODO: If a second feature needs `recheck()` after its injected context changes, propose an opt-in recheck in
  // `useMachine`, in its own PR, so both controllers drop this effect.
  useLayoutEffect(() => {
    finishActor.recheck();
  }, [isLeaving, finishActor]);

  const model = finishSnapshot.context.frozenModel ?? liveModel;
  const { flow, app, navigation, verification } = model;
  const isFinishing = finishSnapshot.value !== 'idle';
  const shown = shownRoute(route, flow.step);
  const screen =
    isReturning || actions.pendingKey === 'ticket' || actions.pendingKey === 'return'
      ? 'loading'
      : screenFor(shown, flow);

  useRouteGuard({ route, go }, shown);

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

  const finishError = finishSnapshot.context.error ? errorText(finishSnapshot.context.error) : undefined;
  const flowError = finishError ?? actions.error;
  const details = useSignUpDetailsController(model.details, {
    purpose: screen === 'continue' ? 'continue' : 'start',
    isBusy: actions.isPending || isFinishing,
    globalErrorMessage: flowError,
    onSubmit: actions.reset,
    onNext: next,
    onSignIn: navigation.goToSignIn,
  });
  /* eslint-disable react-you-might-not-need-an-effect/no-event-handler -- Completes an OAuth return, or redeems an invitation, once when sign-up opens on start with its marker or ticket in the URL; arriving from a redirect or a link is not an event a handler could run from. */
  useEffect(() => {
    if (isReturning && route === 'start' && !completedReturn.current) {
      completedReturn.current = true;
      void actions
        .run('return', async () => {
          const step = await flow.completeReturn();
          if (step) {
            next(step);
          }
        })
        .then(() => setIsReturning(false));
      return;
    }
    if (
      isReturning ||
      actions.isPending ||
      !flow.ticket ||
      flow.inTicketSignUp ||
      route !== 'start' ||
      redeemedTicket.current === flow.ticket
    ) {
      return;
    }
    redeemedTicket.current = flow.ticket;
    void actions.run('ticket', async () => {
      const { step, emailAddress } = await flow.redeemTicket();
      details.adoptInvitation(emailAddress);
      next(step);
    });
  });
  /* eslint-enable react-you-might-not-need-an-effect/no-event-handler */

  const verify = {
    onNext: next,
    isPending: isFinishing,
    globalErrorMessage: finishError,
    onEditIdentifier: () => {
      details.leaveChannel();
      go(detailsRouteFor(route));
    },
  };

  return {
    screen: screen === 'start' && details.alternativePhone ? 'alternativePhone' : screen,
    attempt: flow.signUpId,
    alternativePhone: details.alternativePhone,
    start: details.start,
    continue: details.continue,
    verifyEmail: { ...verify, verification: verification.email },
    verifyPhone: { ...verify, verification: verification.phone },
    protectCheck: { protect: model.protect, onNext: next },
    restricted: {
      globalErrorMessage: details.error ?? flowError,
      onEmailSupport: app.supportEmail ? () => window.location.assign(`mailto:${app.supportEmail}`) : undefined,
      onJoinWaitlist: navigation.joinWaitlist,
      onSignIn: navigation.goToSignIn,
    },
    actionBlocked: flow.actionBlocked,
    onStartOver: () =>
      void actions.run('startOver', async () => {
        await flow.reset();
        details.reset();
        go('start');
      }),
  };
}
