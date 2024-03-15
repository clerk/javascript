import type { SignInStrategy } from '@clerk/types';

import type {
  SignInStartContext,
  SignInStartEvents,
  SignInVerificationContext,
  SignInVerificationEvents,
} from './sign-in/types';
import type {
  SignUpContinueContext,
  SignUpContinueEvents,
  SignUpStartContext,
  SignUpStartRedirectEvent,
  SignUpVerificationContext,
  SignUpVerificationEvents,
} from './sign-up/types';
import type { ThirdPartyMachineContext, ThirdPartyMachineEvent } from './third-party/types';
import type { BaseRouterLoadingStep } from './types';

type SendToLoadingProps = {
  context:
    | SignInStartContext
    | SignInVerificationContext
    | ThirdPartyMachineContext
    | SignUpStartContext
    | SignUpContinueContext
    | SignUpVerificationContext;
  event:
    | SignInStartEvents
    | SignInVerificationEvents
    | ThirdPartyMachineEvent
    | SignUpStartRedirectEvent
    | SignUpContinueEvents
    | SignUpVerificationEvents;
};

export function sendToLoading({ context, event }: SendToLoadingProps): void {
  // Unrelated to the `context` of each machine, the step passed to the loading event must use BaseRouterLoadingStep
  let step: BaseRouterLoadingStep | undefined;
  let strategy: SignInStrategy | undefined;

  console.log('sendToLoadingEvent', event);

  // By default the loading state is set to `true` when this function is called
  // Only if these events are received, the loading state is set to `false`
  // Early return here to avoid unnecessary checks
  if (event.type.startsWith('xstate.done.') || event.type.startsWith('xstate.error.')) {
    return context.parent.send({
      type: 'LOADING',
      isLoading: false,
      step: undefined,
      strategy: undefined,
    });
  }

  // `context.loadingStep: "strategy"` is not a valid BaseRouterLoadingStep (on purpose) so needs to be handled here. This context should be used when `step` should be undefined and `strategy` be defined instead
  if (context.loadingStep === 'strategy') {
    step = undefined;

    // Third-party machine handling
    if (event.type === 'REDIRECT') {
      strategy = event.params.strategy;
    }

    return context.parent.send({
      type: 'LOADING',
      isLoading: true,
      step,
      strategy,
    });
  } else if (context.loadingStep === 'continue') {
    step = 'continue';
    strategy = undefined;

    return context.parent.send({
      type: 'LOADING',
      isLoading: true,
      step,
      strategy,
    });
  } else {
    step = context.loadingStep;
    strategy = undefined;

    return context.parent.send({
      type: 'LOADING',
      isLoading: true,
      step,
      strategy,
    });
  }
}
