import type { FormEvent } from 'react';
import { useEffect, useRef } from 'react';

import { stringToFormattedPhoneString } from '../../utils/phoneUtils';
import { Button, SubmitButton } from '../components/button';
import { Card } from '../components/card';
import type { DialogTriggerProps } from '../components/dialog';
import { Dialog } from '../components/dialog';
import { Field } from '../components/field';
import { Flow } from '../components/flow';
import { Otp } from '../components/otp';
import { PhoneInput } from '../components/phone-input';
import { userProfileAddPhoneMessages as m } from './user-profile-add-phone.messages';

export interface UserProfileAddPhoneViewProps {
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

export function UserProfileAddPhoneView(props: UserProfileAddPhoneViewProps) {
  const phoneRef = useRef<HTMLInputElement>(null);
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
          phoneRef.current ?? verifyRef.current?.querySelector<HTMLInputElement>('input:not([type="hidden"])') ?? true
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
                <Flow.Step ids={['phone']}>
                  <Card.Header>
                    <Card.Title>{m.phone.title}</Card.Title>
                    <Card.Description>{m.phone.description}</Card.Description>
                  </Card.Header>
                  <form onSubmit={handleSubmit}>
                    <Card.Content>
                      <Field.Root
                        required
                        disabled={current.isPending}
                        invalid={Boolean(current.errorMessage)}
                      >
                        <Field.Label>{m.phone.label}</Field.Label>
                        <PhoneInput
                          ref={phoneRef}
                          name='phoneNumber'
                          value={current.phoneNumber}
                          onValueChange={current.onPhoneNumberChange}
                        />
                        {current.errorMessage ? <Field.Error>{current.errorMessage}</Field.Error> : null}
                      </Field.Root>
                    </Card.Content>
                    <Card.Footer>
                      <SubmitButton
                        fullWidth
                        isPending={current.isPending}
                        pendingLabel={m.phone.pending}
                      >
                        {m.phone.submit}
                      </SubmitButton>
                    </Card.Footer>
                  </form>
                </Flow.Step>
                <Flow.Step
                  ids={['verify']}
                  ref={verifyRef}
                >
                  <Card.Header>
                    <Card.Title>{m.verify.title}</Card.Title>
                    <Card.Description>
                      {m.verify.description(stringToFormattedPhoneString(current.phoneNumber))}
                    </Card.Description>
                  </Card.Header>
                  <form onSubmit={handleSubmit}>
                    <Card.Content>
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
                              ? m.verify.resendCountdown(current.resendSeconds ?? 0)
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
                        fullWidth
                        isPending={current.isPending}
                        disabled={current.isResending}
                        pendingLabel={m.verify.pending}
                      >
                        {m.verify.submit}
                      </SubmitButton>
                    </Card.Footer>
                  </form>
                </Flow.Step>
              </>
            )}
          </Flow.Root>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
