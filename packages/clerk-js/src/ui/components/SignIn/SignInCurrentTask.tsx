import { useSignInContext } from '@/ui/contexts';
import { CurrentTaskContext } from '@/ui/contexts/components/CurrentTask';
import { CurrentTask } from '@/ui/lazyModules/components';

export const SignInCurrentTask = () => {
  const signInCtx = useSignInContext();

  return (
    <CurrentTaskContext.Provider
      value={{ componentName: 'CurrentTask', redirectUrlComplete: signInCtx.afterSignInUrl }}
    >
      <CurrentTask />
    </CurrentTaskContext.Provider>
  );
};
