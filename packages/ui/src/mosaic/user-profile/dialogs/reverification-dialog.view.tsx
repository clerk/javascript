import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Input } from '../../components/input';
import { userProfileSecurityBase as m } from '../user-profile-security.messages';
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
  onSelectFactor,
  onBack,
  onPrepare,
  onShowHelp,
}: ReverificationDialogViewProps) {
  const fieldId = React.useId();
  const step = state.step ?? 'verify';

  if (step === 'select-first-factor' || step === 'select-second-factor') {
    return (
      <>
        <Dialog.CloseButton />
        <DialogHeader
          description={step === 'select-second-factor' ? m.reverification.chooseSecond : m.reverification.chooseFirst}
          title={m.reverification.title}
        />
        <DialogBody>
          <FormAlert>{state.errors.form}</FormAlert>
          {state.availableFactors?.map(factor => (
            <Button
              key={factor.id}
              variant='outline'
              onClick={() => onSelectFactor?.(factor.id)}
            >
              {factor.label}
            </Button>
          ))}
        </DialogBody>
        <DialogFooter spread>
          <Button
            color='neutral'
            variant='ghost'
            onClick={step === 'select-second-factor' ? onBack : onCancel}
          >
            {step === 'select-second-factor' ? m.common.back : m.common.cancel}
          </Button>
          {onShowHelp ? (
            <Button
              color='neutral'
              variant='link'
              onClick={onShowHelp}
            >
              {m.reverification.havingTrouble}
            </Button>
          ) : null}
        </DialogFooter>
      </>
    );
  }

  if (step === 'prepare') {
    const failed = state.preparationStatus === 'error';
    return (
      <>
        <Dialog.CloseButton />
        <DialogHeader
          description={m.reverification.preparingDescription}
          title={m.reverification.title}
        />
        <DialogBody>
          {failed ? <FormAlert>{state.errors.form ?? m.reverification.prepareError}</FormAlert> : null}
          {!failed ? <MutedText>{m.reverification.preparing}</MutedText> : null}
        </DialogBody>
        <DialogFooter>
          <Button
            color='neutral'
            variant='ghost'
            onClick={onBack ?? onCancel}
          >
            {m.common.back}
          </Button>
          {failed ? <Button onClick={onPrepare}>{m.common.tryAgain}</Button> : null}
        </DialogFooter>
      </>
    );
  }

  if (step === 'unavailable' || step === 'help') {
    return (
      <>
        <Dialog.CloseButton />
        <DialogHeader
          description={
            step === 'unavailable' ? m.reverification.unavailableDescription : m.reverification.helpDescription
          }
          title={step === 'unavailable' ? m.reverification.unavailableTitle : m.reverification.havingTrouble}
        />
        <DialogBody>
          <FormAlert>{state.errors.form}</FormAlert>
        </DialogBody>
        <DialogFooter>
          <Button onClick={onBack ?? onCancel}>{onBack ? m.common.back : m.common.close}</Button>
        </DialogFooter>
      </>
    );
  }
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
          {m.reverification.deliveredCode} <Identifier>{state.identifier}</Identifier>
        </>
      );
    }
    if (state.strategy === 'totp') {
      return m.reverification.totp;
    }
    if (state.strategy === 'backup_code') {
      return m.reverification.backupCode;
    }
    if (isPasskey) {
      return m.reverification.passkey;
    }
    return m.reverification.password;
  })();

  const fieldLabel = isPassword
    ? m.reverification.passwordLabel
    : state.strategy === 'backup_code'
      ? m.reverification.backupCodeLabel
      : m.common.verificationCode;

  return (
    <>
      <Dialog.CloseButton />
      <DialogHeader
        description={description}
        title={m.reverification.title}
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
              <MutedText>{m.common.didNotReceiveCode}</MutedText>
              <ResendButton
                disabled={inert}
                label={m.common.resend}
                resend={state.resend}
                onResend={onResend}
              />
            </div>
          ) : null}
        </DialogBody>
        <DialogFooter>
          {onBack ? (
            <Button
              color='neutral'
              disabled={inert}
              variant='ghost'
              onClick={onBack}
            >
              {m.reverification.anotherMethod}
            </Button>
          ) : null}
          <Button
            color='neutral'
            disabled={inert}
            type='button'
            variant='outline'
            onClick={onCancel}
            {...stylex.props(styles.footerButton)}
          >
            {m.common.cancel}
          </Button>
          <SubmitButton
            disabled={!canSubmit}
            isPending={inert}
            pendingLabel={m.reverification.pending}
            {...stylex.props(styles.footerButton)}
          >
            {isPasskey ? m.reverification.withPasskey : m.common.continue}
          </SubmitButton>
        </DialogFooter>
      </DialogForm>
    </>
  );
}
