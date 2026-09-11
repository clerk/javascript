import type { FormEvent } from 'react';
import { useEffect, useId, useRef } from 'react';

import { Button, SubmitButton } from '../components/button';
import { Card } from '../components/card';
import type { DialogTriggerProps } from '../components/dialog';
import { Dialog } from '../components/dialog';
import { Field } from '../components/field';
import { Flow } from '../components/flow';
import { Input } from '../components/input';
import { Otp } from '../components/otp';
import { fill } from './user-profile-account-section/user-profile-account-section.messages';
import { userProfileAddEmailMessages as m } from './user-profile-add-email.messages';

export interface UserProfileAddEmailViewProps {
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

export function UserProfileAddEmailView(props: UserProfileAddEmailViewProps) {
  const emailFormId = useId();
  const verifyFormId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const verifyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.open && props.step === 'verify') {
      verifyRef.current?.querySelector<HTMLInputElement>('input:not([type="hidden"])')?.focus();
    }
  }, [props.open, props.step]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!props.isPending && !props.isResending) {
      props.onSubmit();
    }
  };

  return (
    <Dialog.Root
      closedBy='closerequest'
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      {props.trigger ? <Dialog.Trigger render={props.trigger} /> : null}
      <Dialog.Popup
        size='card'
        initialFocus={() =>
          emailRef.current ?? verifyRef.current?.querySelector<HTMLInputElement>('input:not([type="hidden"])') ?? true
        }
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
                      disabled={current.isPending}
                      invalid={Boolean(current.errorMessage)}
                    >
                      <Field.Label>{m.email.label}</Field.Label>
                      <Input
                        ref={emailRef}
                        name='emailAddress'
                        type='email'
                        autoComplete='email'
                        value={current.emailAddress}
                        onChange={event => current.onEmailAddressChange(event.target.value)}
                      />
                      {current.errorMessage ? <Field.Error>{current.errorMessage}</Field.Error> : null}
                    </Field.Root>
                  </Card.Content>
                  <Card.Footer>
                    <SubmitButton
                      form={emailFormId}
                      fullWidth
                      isPending={current.isPending}
                      pendingLabel={m.email.pending}
                    >
                      {m.email.submit}
                    </SubmitButton>
                  </Card.Footer>
                </Flow.Step>
                <Flow.Step
                  ids={['verify']}
                  ref={verifyRef}
                >
                  <Card.Header>
                    <Card.Title>{m.verify.title}</Card.Title>
                    <Card.Description>
                      {fill(m.verify.description, { emailAddress: current.emailAddress })}
                    </Card.Description>
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
                      disabled={current.isPending}
                      invalid={Boolean(current.errorMessage)}
                    >
                      <Field.Label visuallyHidden>{m.verify.label}</Field.Label>
                      <Otp
                        name='code'
                        value={current.code}
                        onValueChange={current.onCodeChange}
                        onComplete={code => {
                          if (!current.isPending && !current.isResending) {
                            current.onSubmit(code);
                          }
                        }}
                      />
                      {current.errorMessage ? <Field.Error>{current.errorMessage}</Field.Error> : null}
                      <Button
                        type='button'
                        size='sm'
                        variant='link'
                        color='neutral'
                        disabled={current.isPending || current.isResending || (current.resendSeconds ?? 0) > 0}
                        onClick={current.onResend}
                      >
                        {current.isResending
                          ? m.verify.resending
                          : (current.resendSeconds ?? 0) > 0
                            ? fill(m.verify.resendCountdown, { seconds: current.resendSeconds ?? 0 })
                            : m.verify.resend}
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
                      isPending={current.isPending}
                      disabled={current.isResending}
                      pendingLabel={m.verify.pending}
                    >
                      {m.verify.submit}
                    </SubmitButton>
                  </Card.Footer>
                </Flow.Step>
              </>
            )}
          </Flow.Root>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
