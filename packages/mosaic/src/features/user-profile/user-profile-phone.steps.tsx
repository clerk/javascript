import { stringToFormattedPhoneString } from '@clerk/shared/phone';
import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { FormEvent, ReactNode, Ref } from 'react';
import { useId } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { useFlowAutoFocus } from '../../components/flow';
import { Otp } from '../../components/otp';
import { PhoneInput } from '../../components/phone-input';
import { fill, rich, useMessages } from '../../localization';
import { styles } from './user-profile-profile-panel.styles';

interface EnterPhoneStepProps {
  inputRef?: Ref<HTMLInputElement>;
  secondaryAction?: ReactNode;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onSubmit: () => void;
  isPending?: boolean;
  errorMessage?: string;
}

export function EnterPhoneStep(props: EnterPhoneStepProps) {
  const m = useMessages('userProfileAddPhone');
  const phoneFormId = useId();
  const inputRef = useMergeRefs([props.inputRef, useFlowAutoFocus<HTMLInputElement>()]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!props.isPending) {
      props.onSubmit();
    }
  };

  return (
    <>
      <Card.Header>
        <Card.Title>{m.phone.title}</Card.Title>
        <Card.Description>{m.phone.description}</Card.Description>
      </Card.Header>
      <Card.Content
        render={
          <form
            id={phoneFormId}
            onSubmit={handleSubmit}
          />
        }
      >
        <Field.Root
          required
          disabled={props.isPending}
          invalid={Boolean(props.errorMessage)}
        >
          <Field.Label>{m.phone.label}</Field.Label>
          <PhoneInput
            ref={inputRef}
            name='phoneNumber'
            value={props.phoneNumber}
            onValueChange={props.onPhoneNumberChange}
          />
          <Field.Message>
            <Field.Error>{props.errorMessage}</Field.Error>
          </Field.Message>
        </Field.Root>
      </Card.Content>
      <Card.Footer>
        {props.secondaryAction}
        <SubmitButton
          form={phoneFormId}
          fullWidth
          isPending={props.isPending}
          pendingLabel={m.phone.pending}
        >
          {m.phone.submit}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}

interface VerifyPhoneStepProps {
  secondaryAction?: ReactNode;
  phoneNumber: string;
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (code?: string) => void;
  onResend: () => void;
  isPending?: boolean;
  errorMessage?: string;
  isResending?: boolean;
  resendSeconds?: number;
}

export function VerifyPhoneStep(props: VerifyPhoneStepProps) {
  const m = useMessages('userProfileAddPhone');
  const verifyFormId = useId();

  const submitCode = (code?: string) => {
    if (!props.isPending && !props.isResending) {
      props.onSubmit(code);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitCode();
  };

  return (
    <>
      <Card.Header>
        <Card.Title>{m.verify.title}</Card.Title>
        <Card.Description>
          {fill(m.verify.description, { phoneNumber: stringToFormattedPhoneString(props.phoneNumber) })}
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
          disabled={props.isPending || props.isResending}
          invalid={Boolean(props.errorMessage)}
        >
          <Field.Label visuallyHidden>{m.verify.label}</Field.Label>
          <Otp
            ref={useFlowAutoFocus<HTMLInputElement>()}
            name='code'
            value={props.code}
            onValueChange={props.onCodeChange}
            onComplete={submitCode}
          />
          <Field.Message>
            <Field.Error>{props.errorMessage}</Field.Error>
          </Field.Message>
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
        {props.secondaryAction ?? (
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
        )}
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
