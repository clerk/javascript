import { useActiveTags } from '~/react/hooks';
import { SignInRouterCtx } from '~/react/sign-in/context';

export type SignInCompleteProps = {
  children: React.ReactNode;
};

export function SignInComplete({ children }: SignInCompleteProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'route:complete');

  return activeState ? <>{children}</> : null;
}
