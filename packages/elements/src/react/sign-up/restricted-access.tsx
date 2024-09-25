import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignUpRouterCtx } from '~/react/sign-up/context';

export type SignUpRestrictedAccessProps = FormProps;

export function SignUpRestrictedAccess(props: SignUpRestrictedAccessProps) {
  const routerRef = SignUpRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'step:restricted-access');

  return activeState ? (
    <Form
      // TODO: Update when sign-up flow is consolidated
      // @ts-expect-error - `flowActor` is not a valid prop for `Form`
      flowActor={routerRef}
      {...props}
    />
  ) : null;
}
