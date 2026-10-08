import { useSignInContext } from '../../contexts';
import { useFetch } from '../../hooks';
import { usePreloadTasks } from '../../hooks/usePreloadTasks';
import { preloadSignUp } from './lazy-sign-up';

const usePreloadSignUp = (enabled = false) =>
  useFetch(enabled ? preloadSignUp : undefined, 'preloadComponent', { staleTime: Infinity });

export const useSignInRootModel = () => {
  const signInContext = useSignInContext();

  /**
   * Preload Sign Up when in Combined Flow.
   */
  usePreloadSignUp(signInContext.isCombinedFlow);
  usePreloadTasks();

  return { signInContext };
};
