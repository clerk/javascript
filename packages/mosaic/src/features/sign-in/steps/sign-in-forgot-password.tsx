import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import type { UseFormResult } from '../../../components/form';
import { fill, useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import type { SignInSubmitEvent, SignInValues } from '../sign-in.types';

interface SignInForgotPasswordProps {
  identifier: string;
  form: UseFormResult<SignInValues>;
  isPending: boolean;
  onSubmit: (event: SignInSubmitEvent) => void;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInForgotPassword({
  identifier,
  form,
  isPending,
  onSubmit,
  onBack,
  focusRef,
}: SignInForgotPasswordProps) {
  const m = useMessages('signIn');
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{m.forgotPassword.title}</Card.Title>
        <Card.Description>{fill(m.forgotPassword.description, { identifier })}</Card.Description>
      </Card.Header>
      <Card.Content
        render={
          <Form
            id={form.id}
            onSubmit={onSubmit}
          />
        }
      >
        <div {...stylex.props(styles.actions)}>
          <SubmitButton
            ref={ref}
            form={form.id}
            fullWidth
            isPending={isPending}
            pendingLabel={m.forgotPassword.pending}
          >
            {m.continue}
          </SubmitButton>
          <Button
            type='button'
            variant='ghost'
            color='neutral'
            fullWidth
            disabled={isPending}
            onClick={onBack}
          >
            {m.forgotPassword.back}
          </Button>
        </div>
      </Card.Content>
    </>
  );
}
