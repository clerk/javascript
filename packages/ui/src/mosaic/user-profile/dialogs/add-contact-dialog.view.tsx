import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Input } from '../../components/input';
import type { AddContactFlowActions, AddContactFlowState, ContactKind } from './flow.types';
import {
  CodeInput,
  DialogBody,
  DialogFooter,
  DialogForm,
  DialogHeader,
  FormAlert,
  Identifier,
  MutedText,
  PhoneInput,
  ResendButton,
  StatusPanel,
} from './flow-dialog-chrome';
import { styles } from './flow-dialogs.styles';

export interface AddContactDialogViewProps extends AddContactFlowActions {
  kind: ContactKind;
  state: AddContactFlowState;
  /**
   * True while a reverification challenge is stacked over this dialog. The step underneath stays
   * rendered but goes inert, so the flow visibly resumes where it left off once the challenge
   * clears.
   */
  isInterrupted?: boolean;
}

const copy = {
  email: {
    title: 'Add email address',
    hint: 'An email address must be verified before it can be added to your account.',
    label: 'Email address',
    placeholder: 'you@example.com',
    submit: 'Add',
    verifyTitle: 'Verify email address',
  },
  phone: {
    title: 'Add phone number',
    hint: 'A text message containing a verification code will be sent to this phone number. Message and data rates may apply.',
    label: 'Phone number',
    placeholder: '201 555 0123',
    submit: 'Add',
    verifyTitle: 'Verify phone number',
  },
} as const satisfies Record<ContactKind, Record<string, string>>;

/**
 * Every rendered state of adding an email address or a phone number, from identifier entry through
 * whichever verification strategy the flow selected. The strategy choice itself is not rendered —
 * it is decided from the environment and the resource — but each of its three destinations is.
 *
 * The view holds no flow state of its own; it branches on `state.step` and sends events back.
 */
export function AddContactDialogView(props: AddContactDialogViewProps) {
  const { kind, state, isInterrupted = false, onCancel } = props;
  const text = copy[kind];

  switch (state.step) {
    case 'identifier':
      return (
        <IdentifierStep
          {...props}
          state={state}
        />
      );
    case 'preparing':
      return (
        <>
          <Dialog.CloseButton />
          <DialogHeader title={text.verifyTitle} />
          <DialogBody>
            <StatusPanel>
              <MutedText>
                Sending a verification {state.strategy === 'email_link' ? 'link' : 'code'} to{' '}
                <Identifier>{state.identifier}</Identifier>…
              </MutedText>
            </StatusPanel>
          </DialogBody>
        </>
      );
    case 'code':
      return (
        <CodeStep
          {...props}
          state={state}
        />
      );
    case 'link':
      return (
        <LinkStep
          {...props}
          state={state}
        />
      );
    case 'sso':
      return (
        <SsoStep
          {...props}
          state={state}
        />
      );
    case 'success':
      return (
        <>
          <Dialog.CloseButton />
          <DialogHeader title={text.verifyTitle} />
          <DialogBody>
            <StatusPanel
              icon='check'
              tone='positive'
            >
              <MutedText>
                <Identifier>{state.identifier}</Identifier> was added to your account.
              </MutedText>
            </StatusPanel>
          </DialogBody>
          <DialogFooter>
            <Button
              disabled={isInterrupted}
              onClick={onCancel}
            >
              Done
            </Button>
          </DialogFooter>
        </>
      );
  }
}

type StepProps<Step extends AddContactFlowState['step']> = Omit<AddContactDialogViewProps, 'state'> & {
  state: Extract<AddContactFlowState, { step: Step }>;
};

function IdentifierStep({
  kind,
  state,
  isInterrupted = false,
  onValueChange,
  onSubmitIdentifier,
  onCancel,
}: StepProps<'identifier'>) {
  const text = copy[kind];
  const fieldId = React.useId();
  // Matches the legacy guard: anything past a single character, and never the current username.
  const canSubmit = state.value.trim().length > 1 && !state.isSubmitting && !isInterrupted;

  return (
    <>
      <Dialog.CloseButton disabled={state.isSubmitting} />
      <DialogHeader
        description={text.hint}
        title={text.title}
      />
      <DialogForm onSubmit={onSubmitIdentifier}>
        <DialogBody>
          <FormAlert>{state.errors.form}</FormAlert>
          <div {...stylex.props(styles.fields)}>
            <Field.Root
              invalid={Boolean(state.errors.field)}
              required
            >
              <Field.Label htmlFor={fieldId}>{text.label}</Field.Label>
              {kind === 'phone' ? (
                <PhoneInput
                  autoFocus
                  disabled={state.isSubmitting || isInterrupted}
                  id={fieldId}
                  value={state.value}
                  onChange={onValueChange}
                />
              ) : (
                <Input
                  autoComplete='email'
                  autoFocus
                  disabled={state.isSubmitting || isInterrupted}
                  id={fieldId}
                  placeholder={text.placeholder}
                  type='email'
                  value={state.value}
                  onChange={event => onValueChange(event.target.value)}
                />
              )}
              {state.errors.field ? <Field.Error>{state.errors.field}</Field.Error> : null}
            </Field.Root>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            color='neutral'
            disabled={state.isSubmitting}
            type='button'
            variant='outline'
            onClick={onCancel}
            {...stylex.props(styles.footerButton)}
          >
            Cancel
          </Button>
          <SubmitButton
            disabled={!canSubmit}
            isPending={state.isSubmitting}
            pendingLabel='Adding'
            {...stylex.props(styles.footerButton)}
          >
            {text.submit}
          </SubmitButton>
        </DialogFooter>
      </DialogForm>
    </>
  );
}

function CodeStep({
  kind,
  state,
  isInterrupted = false,
  onCodeChange,
  onSubmitCode,
  onResend,
  onCancel,
}: StepProps<'code'>) {
  const text = copy[kind];
  const fieldId = React.useId();
  const inert = isInterrupted || state.status === 'verifying' || state.status === 'success';

  return (
    <>
      <Dialog.CloseButton />
      <DialogHeader
        description={
          <>
            Enter the verification code sent to <Identifier>{state.identifier}</Identifier>
          </>
        }
        title={text.verifyTitle}
      />
      <DialogForm onSubmit={onSubmitCode}>
        <DialogBody>
          <FormAlert>{state.errors.form}</FormAlert>
          <Field.Root invalid={state.status === 'error'}>
            <Field.Label htmlFor={fieldId}>Verification code</Field.Label>
            <CodeInput
              autoFocus
              disabled={isInterrupted}
              id={fieldId}
              status={state.status}
              value={state.code}
              onChange={onCodeChange}
              onComplete={onSubmitCode}
            />
            {state.status === 'error' && state.errors.field ? <Field.Error>{state.errors.field}</Field.Error> : null}
          </Field.Root>
          <div {...stylex.props(styles.resendRow)}>
            <MutedText>Didn&apos;t receive a code?</MutedText>
            <ResendButton
              disabled={inert}
              label='Resend'
              resend={state.resend}
              onResend={onResend}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            color='neutral'
            disabled={state.status === 'verifying'}
            type='button'
            variant='outline'
            onClick={onCancel}
            {...stylex.props(styles.footerButton)}
          >
            Cancel
          </Button>
          <SubmitButton
            disabled={inert || state.code.length === 0}
            isPending={state.status === 'verifying'}
            pendingLabel='Verifying'
            {...stylex.props(styles.footerButton)}
          >
            Verify
          </SubmitButton>
        </DialogFooter>
      </DialogForm>
    </>
  );
}

const LINK_OUTCOME_COPY = {
  verified_other_tab: {
    tone: 'positive',
    icon: 'check',
    title: 'Successfully verified email address',
    body: 'You may close this tab; verification completed in another window.',
  },
  expired: {
    tone: 'negative',
    icon: 'alert-circle',
    title: 'This verification link has expired',
    body: 'Send yourself another link to finish adding this address.',
  },
  failed: {
    tone: 'negative',
    icon: 'alert-circle',
    title: 'This verification link is invalid',
    body: 'Send yourself another link to finish adding this address.',
  },
} as const;

function LinkStep({ kind, state, isInterrupted = false, onResend, onCancel }: StepProps<'link'>) {
  const text = copy[kind];
  const outcome = state.outcome ? LINK_OUTCOME_COPY[state.outcome] : undefined;

  return (
    <>
      <Dialog.CloseButton />
      <DialogHeader title={text.verifyTitle} />
      <DialogBody>
        <FormAlert>{state.errors.form}</FormAlert>
        {outcome ? (
          <StatusPanel
            icon={outcome.icon}
            tone={outcome.tone}
          >
            <p>{outcome.title}</p>
            <MutedText>{outcome.body}</MutedText>
          </StatusPanel>
        ) : (
          <StatusPanel>
            <p>Check your email</p>
            <MutedText>
              A verification link was sent to <Identifier>{state.identifier}</Identifier>. Open it on this device to
              finish.
            </MutedText>
          </StatusPanel>
        )}
      </DialogBody>
      <DialogFooter spread>
        {/* Throttled to 60s and starting disabled, matching the legacy link card's TimerButton. */}
        <ResendButton
          disabled={isInterrupted}
          label='Resend link'
          resend={state.resend}
          onResend={onResend}
        />
        <Button
          color='neutral'
          variant='outline'
          onClick={onCancel}
        >
          {state.outcome ? 'Close' : 'Cancel'}
        </Button>
      </DialogFooter>
    </>
  );
}

function SsoStep({ kind, state, isInterrupted = false, onOpenSsoPopup, onCancel }: StepProps<'sso'>) {
  const text = copy[kind];

  return (
    <>
      <Dialog.CloseButton />
      <DialogHeader
        description={
          <>
            <Identifier>{state.identifier}</Identifier> belongs to a domain managed by {state.providerName}. Verify with
            them to add it.
          </>
        }
        title={text.verifyTitle}
      />
      <DialogBody>
        <FormAlert>{state.errors.form}</FormAlert>
        {state.status === 'awaiting_popup' ? (
          <StatusPanel>
            <MutedText>Waiting for {state.providerName}…</MutedText>
          </StatusPanel>
        ) : null}
      </DialogBody>
      <DialogFooter>
        <Button
          color='neutral'
          variant='outline'
          onClick={onCancel}
          {...stylex.props(styles.footerButton)}
        >
          Cancel
        </Button>
        <Button
          disabled={isInterrupted || state.status === 'awaiting_popup'}
          focusableWhenDisabled
          onClick={onOpenSsoPopup}
          {...stylex.props(styles.footerButton)}
        >
          {state.status === 'error' ? 'Try again' : `Continue with ${state.providerName}`}
        </Button>
      </DialogFooter>
    </>
  );
}
