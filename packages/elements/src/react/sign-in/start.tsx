import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignInRouterCtx } from '~/react/sign-in/context';

export type SignInStartProps = FormProps;

export function SignInStart(props: SignInStartProps) {
  const ref = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(ref, 'step:start');

  return activeState ? (
    <Form
      flowActor={ref}
      {...props}
    />
  ) : null;
}
