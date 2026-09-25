import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { FormEvent, Ref } from 'react';
import { useId, useRef } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogFocusTarget, DialogHandle } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import { Flow, useFlowAutoFocus } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { Input } from '../../../components/input';
import { Item } from '../../../components/item';
import { Otp } from '../../../components/otp';
import { Text } from '../../../components/text';
import { fill, rich, useMessages } from '../../../localization';
import { styles as panelStyles } from '../user-profile-profile-panel.styles';

const styles = stylex.create({
  ssoConnection: {
    paddingInline: 0,
  },
});

export interface UserProfileAddEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handle?: DialogHandle<unknown>;
  finalFocus?: DialogFocusTarget;
  step: 'email' | 'verify' | 'link' | 'sso';
  emailAddress: string;
  onEmailAddressChange: (value: string) => void;
  canSubmitEmail?: boolean;
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (code?: string) => void;
  onResend: () => void;
  onConnect: () => void;
  isPending?: boolean;
  errorMessage?: string;
  isResending?: boolean;
  resendSeconds?: number;
}

export function UserProfileAddEmailDialog(props: UserProfileAddEmailDialogProps) {
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog.Root
      handle={props.handle}
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      <Dialog.Popup
        variant='card'
        initialFocus={props.step === 'email' ? emailRef : props.step === 'verify' ? codeRef : undefined}
        finalFocus={props.finalFocus}
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
                    canSubmit={current.canSubmitEmail !== false}
                    isPending={current.isPending}
                    errorMessage={current.errorMessage}
                  />
                </Flow.Step>
                <Flow.Step ids={['link']}>
                  <VerifyLinkStep
                    emailAddress={current.emailAddress}
                    onResend={current.onResend}
                    errorMessage={current.errorMessage}
                    resendSeconds={current.resendSeconds}
                  />
                </Flow.Step>
                <Flow.Step ids={['sso']}>
                  <VerifySsoStep
                    emailAddress={current.emailAddress}
                    onConnect={current.onConnect}
                    errorMessage={current.errorMessage}
                  />
                </Flow.Step>
                <Flow.Step ids={['verify']}>
                  <VerifyEmailStep
                    inputRef={codeRef}
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
  canSubmit: boolean;
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
          disabled={!props.canSubmit}
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
  inputRef: Ref<HTMLInputElement>;
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
  const inputRef = useMergeRefs([props.inputRef, useFlowAutoFocus<HTMLInputElement>()]);

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
            ref={inputRef}
            name='code'
            value={props.code}
            onValueChange={props.onCodeChange}
            onComplete={props.onSubmit}
          />
          {props.errorMessage ? <Field.Error>{props.errorMessage}</Field.Error> : null}
          <ResendButton
            labels={m.verify}
            onResend={props.onResend}
            disabled={props.isPending}
            isResending={props.isResending}
            resendSeconds={props.resendSeconds}
          />
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

interface VerifyLinkStepProps {
  emailAddress: string;
  onResend: () => void;
  errorMessage?: string;
  resendSeconds?: number;
}

function VerifyLinkStep(props: VerifyLinkStepProps) {
  const m = useMessages('userProfileAddEmail');

  return (
    <>
      <Card.Header>
        <Card.Title>{m.link.title}</Card.Title>
        <Card.Description>{fill(m.link.description, { emailAddress: props.emailAddress })}</Card.Description>
      </Card.Header>
      <Card.Content>
        {props.errorMessage ? (
          <Text
            role='alert'
            color='negative'
          >
            {props.errorMessage}
          </Text>
        ) : null}
        <ResendButton
          labels={m.link}
          onResend={props.onResend}
          resendSeconds={props.resendSeconds}
        />
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
          {m.link.cancel}
        </Dialog.Close>
      </Card.Footer>
    </>
  );
}

interface VerifySsoStepProps {
  emailAddress: string;
  onConnect: () => void;
  errorMessage?: string;
}

function VerifySsoStep(props: VerifySsoStepProps) {
  const m = useMessages('userProfileAddEmail');
  const domain = props.emailAddress.split('@')[1] ?? props.emailAddress;

  return (
    <>
      <Card.Header>
        <Card.Title>{m.sso.title}</Card.Title>
        <Card.Description>{fill(m.sso.description, { emailAddress: props.emailAddress })}</Card.Description>
      </Card.Header>
      <Card.Content>
        {props.errorMessage ? (
          <Text
            role='alert'
            color='negative'
          >
            {props.errorMessage}
          </Text>
        ) : null}
        <Item.Root xstyle={styles.ssoConnection}>
          <Item.Content>
            <Item.Label>{domain}</Item.Label>
            <Item.Description>{m.sso.connection}</Item.Description>
          </Item.Content>
          <Item.Actions>
            <Button
              type='button'
              size='sm'
              onClick={props.onConnect}
            >
              {m.sso.connect}
              <Icon
                name='arrow-up-right'
                placement='inline-end'
                size='sm'
              />
            </Button>
          </Item.Actions>
        </Item.Root>
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
          {m.sso.cancel}
        </Dialog.Close>
      </Card.Footer>
    </>
  );
}

interface ResendButtonProps {
  labels: { resend: string; resending?: string; resendCountdown: string };
  onResend: () => void;
  disabled?: boolean;
  isResending?: boolean;
  resendSeconds?: number;
}

function ResendButton(props: ResendButtonProps) {
  const resendSeconds = props.resendSeconds ?? 0;

  return (
    <Button
      type='button'
      size='sm'
      variant='link'
      color='neutral'
      disabled={props.disabled || props.isResending || resendSeconds > 0}
      onClick={props.onResend}
    >
      {props.isResending ? (
        props.labels.resending
      ) : resendSeconds > 0 ? (
        <span>
          {rich(props.labels.resendCountdown, {
            values: { seconds: <span {...stylex.props(panelStyles.countdown)}>{resendSeconds}</span> },
          })}
        </span>
      ) : (
        props.labels.resend
      )}
    </Button>
  );
}
