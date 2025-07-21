import { useSignUpContext } from '@/ui/contexts';
import { CurrentTaskContext } from '@/ui/contexts/components/CurrentTask';
import { CurrentTask } from '@/ui/lazyModules/components';

export const SignUpCurrentTask = () => {
  const signUpCtx = useSignUpContext();

  return (
    <CurrentTaskContext.Provider
      value={{ componentName: 'CurrentTask', redirectUrlComplete: signUpCtx.afterSignUpUrl }}
    >
      <CurrentTask />
    </CurrentTaskContext.Provider>
  );
};
