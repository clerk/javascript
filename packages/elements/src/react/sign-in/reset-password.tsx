import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignInRouterCtx } from '~/react/sign-in/context';

export type SignInResetPasswordProps = FormProps;

export function SignInResetPassword(props: SignInResetPasswordProps) {
  const ref = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(ref, 'step:reset-password');

  return activeState ? (
    <Form
      flowActor={ref}
      {...props}
    />
  ) : null;
}
