/* eslint-disable react-hooks/rules-of-hooks */
import { useActiveTags } from '~/react/hooks/use-active-tags.hook';
import { SignInStartCtx } from '~/react/sign-in/start';
import { SignInFirstFactorCtx, SignInSecondFactorCtx } from '~/react/sign-in/verifications';

/**
 * Caution: This hook is unstable and may disappear in the future.
 * This is a temporary hook until the actual loading API is explored and implemented.
 */
export const useIsLoading_unstable = () => {
  let startLoading = false;
  let firstFactorLoading = false;
  let secondFactorLoading = false;

  const startRef = SignInStartCtx.useActorRef(true);
  if (startRef) {
    startLoading = useActiveTags(startRef, 'state:loading');
  }

  const firstFactorRef = SignInFirstFactorCtx.useActorRef(true);
  if (firstFactorRef) {
    firstFactorLoading = useActiveTags(firstFactorRef, 'state:loading');
  }

  const secondFactorRef = SignInSecondFactorCtx.useActorRef(true);
  if (secondFactorRef) {
    secondFactorLoading = useActiveTags(secondFactorRef, 'state:loading');
  }

  const isGlobalLoading = startLoading || firstFactorLoading || secondFactorLoading;

  return [isGlobalLoading, { start: startLoading, firstFactor: firstFactorLoading, secondFactor: secondFactorLoading }];
};
