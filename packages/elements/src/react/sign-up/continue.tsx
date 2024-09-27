import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignUpRouterCtx } from '~/react/sign-up/context';

export type SignUpContinueProps = FormProps;

export function SignUpContinue(props: SignUpContinueProps) {
  const routerRef = SignUpRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'step:continue');

  return activeState ? (
    <Form
      flowActor={routerRef}
      {...props}
    />
  ) : null;
}
