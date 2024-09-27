import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignUpRouterCtx } from '~/react/sign-up/context';

export type SignUpStartProps = FormProps;

export function SignUpStart(props: SignUpStartProps) {
  const routerRef = SignUpRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'step:start');

  return activeState ? (
    <Form
      flowActor={routerRef}
      {...props}
    />
  ) : null;
}
