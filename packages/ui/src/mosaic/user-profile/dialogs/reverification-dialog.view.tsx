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
  const isDeliveredCode = state.strategy === 'email_code' || state.strategy === 'phone_code';
  const isCode = isDeliveredCode || state.strategy === 'totp';
  const isPasskey = state.strategy === 'passkey';
  const isPassword = state.strategy === 'password';
  const inert = state.status === 'verifying';
  const canSubmit = isPasskey || state.value.length > 0;

  const description = (() => {
    if (isDeliveredCode) {
      return (
        <>
          Enter the verification code sent to <Identifier>{state.identifier}</Identifier>
        </>
      );
    }
    if (state.strategy === 'totp') {
      return 'Enter the code from your authenticator app.';
    }
    if (state.strategy === 'backup_code') {
      return 'Enter one of your backup codes.';
    }
    if (isPasskey) {
      return 'Use your passkey to verify your identity.';
    }
    return 'Enter your password to continue.';
  })();

  const fieldLabel = isPassword ? 'Password' : state.strategy === 'backup_code' ? 'Backup code' : 'Verification code';

  return (
    <>
      <Dialog.CloseButton />
      <DialogHeader
        description={description}
        title='Verify it’s you'
      />
      <DialogForm onSubmit={onSubmit}>
        <DialogBody>
          <FormAlert>{state.errors.form}</FormAlert>
          {!isPasskey ? (
            <Field.Root invalid={state.status === 'error'}>
              <Field.Label htmlFor={fieldId}>{fieldLabel}</Field.Label>
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
                <Input
                  autoComplete={isPassword ? 'current-password' : 'one-time-code'}
                  autoFocus
                  disabled={inert}
                  id={fieldId}
                  type={isPassword ? 'password' : 'text'}
                  value={state.value}
                  onChange={event => onValueChange(event.target.value)}
                />
              )}
              {state.status === 'error' && state.errors.field ? <Field.Error>{state.errors.field}</Field.Error> : null}
            </Field.Root>
          ) : null}
          {isDeliveredCode ? (
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
            pendingLabel='Verifying identity'
            {...stylex.props(styles.footerButton)}
          >
            {isPasskey ? 'Verify with passkey' : 'Continue'}
          </SubmitButton>
        </DialogFooter>
      </DialogForm>
    </>
  );
}
