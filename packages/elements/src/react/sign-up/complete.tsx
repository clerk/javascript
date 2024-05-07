import { useActiveTags } from '~/react/hooks';
import { SignUpRouterCtx } from '~/react/sign-up/context';

export type SignUpCompleteProps = {
  children: React.ReactNode;
};

export function SignUpComplete({ children }: SignUpCompleteProps) {
  const routerRef = SignUpRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'route:complete');

  return activeState ? <>{children}</> : null;
}
