import * as stylex from '@stylexjs/stylex';
import type { FormEvent, Ref } from 'react';
import { useId, useRef } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import { Flow, useFlowAutoFocus } from '../../../components/flow';
import { Input } from '../../../components/input';
import { Otp } from '../../../components/otp';
import { fill, rich, useMessages } from '../../../localization';
import { styles } from '../user-profile-profile-panel.styles';

export interface UserProfileAddEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  step: 'email' | 'verify';
  emailAddress: string;
  onEmailAddressChange: (value: string) => void;
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (code?: string) => void;
  onResend: () => void;
  isPending?: boolean;
  errorMessage?: string;
  isResending?: boolean;
  resendSeconds?: number;
}

export function UserProfileAddEmailDialog(props: UserProfileAddEmailDialogProps) {
  const emailRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      {props.trigger ? <Dialog.Trigger render={props.trigger} /> : null}
      <Dialog.Popup
        variant='card'
        initialFocus={props.step === 'email' ? emailRef : undefined}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Flow.Root
            value={props.step}
            state={props}
          >
            {current => (
              <>
                <Flow.Step ids={['email']}>
                  <EnterEmailStep
                    inputRef={emailRef}
                    emailAddress={current.emailAddress}
                    onEmailAddressChange={current.onEmailAddressChange}
                    onSubmit={current.onSubmit}
                    isPending={current.isPending}
                    errorMessage={current.errorMessage}
                  />
                </Flow.Step>
                <Flow.Step ids={['verify']}>
                  <VerifyEmailStep
                    emailAddress={current.emailAddress}
                    code={current.code}
                    onCodeChange={current.onCodeChange}
                    onSubmit={current.onSubmit}
                    onResend={current.onResend}
                    isPending={current.isPending}
                    errorMessage={current.errorMessage}
                    isResending={current.isResending}
                    resendSeconds={current.resendSeconds}
                  />
                </Flow.Step>
              </>
            )}
          </Flow.Root>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

interface EnterEmailStepProps {
  inputRef: Ref<HTMLInputElement>;
  emailAddress: string;
  onEmailAddressChange: (value: string) => void;
  onSubmit: () => void;
  isPending?: boolean;
  errorMessage?: string;
}

function EnterEmailStep(props: EnterEmailStepProps) {
  const m = useMessages('userProfileAddEmail');
  const emailFormId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit();
  };

  return (
    <>
      <Card.Header>
        <Card.Title>{m.email.title}</Card.Title>
        <Card.Description>{m.email.description}</Card.Description>
      </Card.Header>
      <Card.Content
        render={
          <form
            id={emailFormId}
            onSubmit={handleSubmit}
          />
        }
      >
        <Field.Root
          required
          disabled={props.isPending}
          invalid={Boolean(props.errorMessage)}
        >
          <Field.Label>{m.email.label}</Field.Label>
          <Input
            ref={props.inputRef}
            name='emailAddress'
            type='email'
            autoComplete='email'
            value={props.emailAddress}
            onChange={event => props.onEmailAddressChange(event.target.value)}
          />
          {props.errorMessage ? <Field.Error>{props.errorMessage}</Field.Error> : null}
        </Field.Root>
      </Card.Content>
      <Card.Footer>
        <SubmitButton
          form={emailFormId}
          fullWidth
          isPending={props.isPending}
          pendingLabel={m.email.pending}
        >
          {m.email.submit}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}

interface VerifyEmailStepProps {
  emailAddress: string;
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (code?: string) => void;
  onResend: () => void;
  isPending?: boolean;
  errorMessage?: string;
  isResending?: boolean;
  resendSeconds?: number;
}

function VerifyEmailStep(props: VerifyEmailStepProps) {
  const m = useMessages('userProfileAddEmail');
  const verifyFormId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit();
  };

  return (
    <>
      <Card.Header>
        <Card.Title>{m.verify.title}</Card.Title>
        <Card.Description>{fill(m.verify.description, { emailAddress: props.emailAddress })}</Card.Description>
      </Card.Header>
      <Card.Content
        render={
          <form
            id={verifyFormId}
            onSubmit={handleSubmit}
          />
        }
      >
        <Field.Root
          required
          disabled={props.isPending}
          invalid={Boolean(props.errorMessage)}
        >
          <Field.Label visuallyHidden>{m.verify.label}</Field.Label>
          <Otp
            ref={useFlowAutoFocus<HTMLInputElement>()}
            name='code'
            value={props.code}
            onValueChange={props.onCodeChange}
            onComplete={props.onSubmit}
          />
          {props.errorMessage ? <Field.Error>{props.errorMessage}</Field.Error> : null}
          <Button
            type='button'
            size='sm'
            variant='link'
            color='neutral'
            disabled={props.isPending || props.isResending || (props.resendSeconds ?? 0) > 0}
            onClick={props.onResend}
          >
            {props.isResending ? (
              m.verify.resending
            ) : (props.resendSeconds ?? 0) > 0 ? (
              <span>
                {rich(m.verify.resendCountdown, {
                  values: { seconds: <span {...stylex.props(styles.countdown)}>{props.resendSeconds}</span> },
                })}
              </span>
            ) : (
              m.verify.resend
            )}
          </Button>
        </Field.Root>
      </Card.Content>
      <Card.Footer>
        <Dialog.Close
          render={
            <Button
              variant='outline'
              color='neutral'
              fullWidth
            />
          }
        >
          {m.verify.cancel}
        </Dialog.Close>
        <SubmitButton
          form={verifyFormId}
          fullWidth
          isPending={props.isPending}
          disabled={props.isResending}
          pendingLabel={m.verify.pending}
        >
          {m.verify.submit}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
