import * as stylex from '@stylexjs/stylex';
import type { FormEvent, Ref } from 'react';
import { useId, useRef } from 'react';

import { stringToFormattedPhoneString } from '../../../../utils/phoneUtils';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import { Flow, useFlowAutoFocus } from '../../../components/flow';
import { Otp } from '../../../components/otp';
import { PhoneInput } from '../../../components/phone-input';
import { fill, rich } from '../../../utils/messages';
import { styles } from '../user-profile-profile-panel.styles';
import { userProfileAddPhoneMessages as m } from './user-profile-add-phone.messages';

export interface UserProfileAddPhoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  step: 'phone' | 'verify';
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (code?: string) => void;
  onResend: () => void;
  isPending?: boolean;
  errorMessage?: string;
  isResending?: boolean;
  resendSeconds?: number;
}

export function UserProfileAddPhoneDialog(props: UserProfileAddPhoneDialogProps) {
  const phoneRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog.Root
      dismissOn='escape'
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      {props.trigger ? <Dialog.Trigger render={props.trigger} /> : null}
      <Dialog.Popup
        variant='card'
        initialFocus={props.step === 'phone' ? phoneRef : undefined}
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
                <Flow.Step ids={['phone']}>
                  <EnterPhoneStep
                    inputRef={phoneRef}
                    phoneNumber={current.phoneNumber}
                    onPhoneNumberChange={current.onPhoneNumberChange}
                    onSubmit={current.onSubmit}
                    isPending={current.isPending}
                    errorMessage={current.errorMessage}
                  />
                </Flow.Step>
                <Flow.Step ids={['verify']}>
                  <VerifyPhoneStep
                    phoneNumber={current.phoneNumber}
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

interface EnterPhoneStepProps {
  inputRef: Ref<HTMLInputElement>;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onSubmit: () => void;
  isPending?: boolean;
  errorMessage?: string;
}

function EnterPhoneStep(props: EnterPhoneStepProps) {
  const phoneFormId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit();
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
            ref={props.inputRef}
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

function VerifyPhoneStep(props: VerifyPhoneStepProps) {
  const verifyFormId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit();
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
