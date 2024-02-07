/* eslint-disable react-hooks/rules-of-hooks */
import { useActiveTags } from '~/react/hooks/use-active-tags.hook';
import { SignInCtx } from '~/react/sign-in/contexts/sign-in.context';

/**
 * Caution: This hook is unstable and may disappear in the future.
 * This is a temporary hook until the actual loading API is explored and implemented.
 */
export const unstable_useIsLoading = () => {
  const ref = SignInCtx.useActorRef();

  return useActiveTags(ref, 'loading');
};
