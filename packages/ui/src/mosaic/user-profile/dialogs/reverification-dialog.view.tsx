import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Input } from '../../components/input';
import type { ReverificationChallengeActions, ReverificationChallengeState } from './flow.types';
import {
  CodeInput,
  DialogBody,
  DialogFooter,
  DialogForm,
  DialogHeader,
  FormAlert,
  Identifier,
  MutedText,
  ResendButton,
} from './flow-dialog-chrome';
import { styles } from './flow-dialogs.styles';

export interface ReverificationDialogViewProps extends ReverificationChallengeActions {
  state: ReverificationChallengeState;
}

/**
 * The challenge raised when a mutation needs the session reverified.
 *
 * It stacks over the flow it interrupted rather than replacing it — the dialog underneath stays
 * mounted and inert, so the original flow visibly resumes at the step it was on once this clears.
 * Most user mutations in the legacy profile are wrapped in `useReverification`, so almost any
 * action here can raise one.
 */
export function ReverificationDialogView({
  state,
  onValueChange,
  onSubmit,
  onResend,
  onCancel,
}: ReverificationDialogViewProps) {
  const fieldId = React.useId();
  const isCode = state.strategy !== 'password';
  const inert = state.status === 'verifying';
  const canSubmit = state.value.length > 0;

  return (
    <>
      <Dialog.CloseButton />
      <DialogHeader
        description={
          isCode && state.identifier ? (
            <>
              Enter the verification code sent to <Identifier>{state.identifier}</Identifier>
            </>
          ) : isCode ? (
            'Enter the verification code we sent you.'
          ) : (
            'Enter your password to continue.'
          )
        }
        title='Verify it’s you'
      />
      <DialogForm onSubmit={onSubmit}>
        <DialogBody>
          <FormAlert>{state.errors.form}</FormAlert>
          <Field.Root invalid={state.status === 'error'}>
            <Field.Label htmlFor={fieldId}>{isCode ? 'Verification code' : 'Password'}</Field.Label>
            {isCode ? (
              <CodeInput
                autoFocus
                id={fieldId}
                status={state.status === 'error' ? 'error' : state.status === 'verifying' ? 'verifying' : 'idle'}
                value={state.value}
                onChange={onValueChange}
                onComplete={onSubmit}
              />
            ) : (
              // TODO: Replace with a Mosaic PasswordInput once one exists — this has no reveal
              // toggle and no strength meter.
              <Input
                autoComplete='current-password'
                autoFocus
                disabled={inert}
                id={fieldId}
                type='password'
                value={state.value}
                onChange={event => onValueChange(event.target.value)}
              />
            )}
            {state.status === 'error' && state.errors.field ? <Field.Error>{state.errors.field}</Field.Error> : null}
          </Field.Root>
          {isCode ? (
            <div {...stylex.props(styles.resendRow)}>
              <MutedText>Didn&apos;t receive a code?</MutedText>
              <ResendButton
                disabled={inert}
                label='Resend'
                resend={state.resend}
                onResend={onResend}
              />
            </div>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button
            color='neutral'
            disabled={inert}
            type='button'
            variant='outline'
            onClick={onCancel}
            {...stylex.props(styles.footerButton)}
          >
            Cancel
          </Button>
          <SubmitButton
            disabled={!canSubmit}
            isPending={inert}
            pendingLabel='Verifying'
            {...stylex.props(styles.footerButton)}
          >
            Continue
          </SubmitButton>
        </DialogFooter>
      </DialogForm>
    </>
  );
}
