import React from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Heading } from '../../components/heading';
import { Input } from '../../components/input';
import { Text } from '../../components/text';
import { reverificationDialogMessages as m } from './reverification-dialog.messages';
import type {
  ReverificationDialogResendState,
  ReverificationDialogSelectViewProps,
  ReverificationDialogVerifyViewProps,
  ReverificationDialogViewProps,
  ReverificationFactor,
} from './reverification-dialog.types';

function DialogHeader({ title, description }: { title: React.ReactNode; description?: React.ReactNode }) {
  return (
    <Card.Header>
      <Dialog.Title render={<Heading size='sm' />}>{title}</Dialog.Title>
      {description ? <Dialog.Description render={<Text />}>{description}</Dialog.Description> : null}
    </Card.Header>
  );
}

function FormError({ children }: { children?: React.ReactNode }) {
  return children ? (
    <Text
      role='alert'
      color='negative'
    >
      {children}
    </Text>
  ) : null;
}

function CancelButton({ label = m.cancel }: { label?: string }) {
  return (
    <Dialog.Close
      render={props => (
        <Button
          {...props}
          color='neutral'
          variant='outline'
        />
      )}
    >
      {label}
    </Dialog.Close>
  );
}

function ResendButton({
  disabled = false,
  resend,
  onResend,
}: {
  disabled?: boolean;
  resend: ReverificationDialogResendState;
  onResend?: () => void;
}) {
  const waiting = resend.secondsRemaining > 0;

  return (
    <Button
      color='neutral'
      disabled={disabled || waiting || resend.isResending || !onResend}
      focusableWhenDisabled
      size='sm'
      variant='link'
      onClick={onResend}
    >
      {waiting ? `${m.resend} (${resend.secondsRemaining}s)` : m.resend}
    </Button>
  );
}

function CodeInput({
  id,
  disabled,
  value,
  onChange,
}: {
  id: string;
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      autoComplete='one-time-code'
      disabled={disabled}
      id={id}
      inputMode='numeric'
      maxLength={6}
      placeholder='••••••'
      size='lg'
      value={value}
      onChange={event => onChange(event.target.value)}
    />
  );
}

function SelectFactorContent({
  stage,
  availableFactors,
  formError,
  onSelectFactor,
  onBack,
  onShowHelp,
}: ReverificationDialogSelectViewProps) {
  return (
    <>
      <Dialog.CloseButton aria-label={m.close} />
      <DialogHeader
        description={stage === 'second' ? m.chooseSecond : m.chooseFirst}
        title={m.title}
      />
      <Card.Content>
        <FormError>{formError}</FormError>
        {availableFactors.map(factor => (
          <Button
            key={factor.id}
            fullWidth
            variant='outline'
            onClick={() => onSelectFactor(factor.id)}
          >
            {factor.label}
          </Button>
        ))}
      </Card.Content>
      <Card.Footer>
        {onBack ? (
          <Button
            color='neutral'
            variant='outline'
            onClick={onBack}
          >
            {m.back}
          </Button>
        ) : (
          <CancelButton />
        )}
        <Button
          color='neutral'
          variant='link'
          onClick={onShowHelp}
        >
          {m.havingTrouble}
        </Button>
      </Card.Footer>
    </>
  );
}

const safeIdentifierFrom = (factor: ReverificationFactor) =>
  'safeIdentifier' in factor ? factor.safeIdentifier : undefined;

function VerifyContent({
  factor,
  value,
  canSubmit,
  isInputDisabled,
  isVerifying,
  fieldError,
  formError,
  resend,
  onValueChange,
  onResend,
  onShowAlternatives,
  onShowHelp,
}: ReverificationDialogVerifyViewProps) {
  const fieldId = React.useId();
  const isDeliveredCode = factor.strategy === 'email_code' || factor.strategy === 'phone_code';
  const isCode = isDeliveredCode || factor.strategy === 'totp';
  const isPasskey = factor.strategy === 'passkey';
  const isPassword = factor.strategy === 'password';
  const description = (() => {
    if (isDeliveredCode) {
      return (
        <>
          {m.deliveredCode} <strong>{safeIdentifierFrom(factor)}</strong>
        </>
      );
    }
    if (factor.strategy === 'totp') {
      return m.totp;
    }
    if (factor.strategy === 'backup_code') {
      return m.backupCode;
    }
    if (isPasskey) {
      return m.passkey;
    }
    return m.password;
  })();
  const fieldLabel = isPassword
    ? m.passwordLabel
    : factor.strategy === 'backup_code'
      ? m.backupCodeLabel
      : m.verificationCode;

  return (
    <>
      <Dialog.CloseButton aria-label={m.close} />
      <DialogHeader
        description={description}
        title={m.title}
      />
      <Card.Content>
        <FormError>{formError}</FormError>
        {!isPasskey ? (
          <Field.Root invalid={Boolean(fieldError)}>
            <Field.Label htmlFor={fieldId}>{fieldLabel}</Field.Label>
            {isCode ? (
              <CodeInput
                id={fieldId}
                disabled={isInputDisabled || isVerifying}
                value={value}
                onChange={onValueChange}
              />
            ) : (
              <Input
                autoComplete={isPassword ? 'current-password' : 'one-time-code'}
                disabled={isInputDisabled || isVerifying}
                id={fieldId}
                spellCheck={false}
                type={isPassword ? 'password' : 'text'}
                value={value}
                onChange={event => onValueChange(event.target.value)}
              />
            )}
            {fieldError ? <Field.Error>{fieldError}</Field.Error> : null}
          </Field.Root>
        ) : null}
        {resend ? (
          <>
            <Text size='xs'>{m.didNotReceiveCode}</Text>
            <ResendButton
              disabled={isVerifying}
              resend={resend}
              onResend={onResend}
            />
          </>
        ) : null}
      </Card.Content>
      <Card.Footer>
        {onShowAlternatives ? (
          <Button
            color='neutral'
            disabled={isVerifying}
            variant='ghost'
            onClick={onShowAlternatives}
          >
            {m.anotherMethod}
          </Button>
        ) : onShowHelp ? (
          <Button
            color='neutral'
            disabled={isVerifying}
            variant='ghost'
            onClick={onShowHelp}
          >
            {m.havingTrouble}
          </Button>
        ) : null}
        <Dialog.Close
          render={props => (
            <Button
              {...props}
              color='neutral'
              disabled={isVerifying}
              fullWidth
              variant='outline'
            />
          )}
        >
          {m.cancel}
        </Dialog.Close>
        <SubmitButton
          disabled={!canSubmit}
          fullWidth
          isPending={isVerifying}
          pendingLabel={m.pending}
        >
          {isPasskey ? m.withPasskey : m.continue}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}

function DialogContent(props: ReverificationDialogViewProps) {
  switch (props.step) {
    case 'select-factor':
      return <SelectFactorContent {...props} />;
    case 'verify':
      return <VerifyContent {...props} />;
    case 'help':
      return (
        <>
          <Dialog.CloseButton aria-label={m.close} />
          <DialogHeader
            description={m.helpDescription}
            title={m.havingTrouble}
          />
          <Card.Footer>
            <Button onClick={props.onBack}>{m.back}</Button>
          </Card.Footer>
        </>
      );
    case 'unavailable':
      return (
        <>
          <Dialog.CloseButton aria-label={m.close} />
          <DialogHeader
            description={m.unavailableDescription}
            title={m.unavailableTitle}
          />
          <Card.Footer>
            <CancelButton label={m.close} />
          </Card.Footer>
        </>
      );
  }
}

export function ReverificationDialogView(props: ReverificationDialogViewProps) {
  const handleSubmit = props.step === 'verify' ? props.onSubmit : undefined;
  return (
    <Dialog.Root
      closedBy='closerequest'
      open={props.open}
      size='card'
      onOpenChange={nextOpen => props.onOpenChange(nextOpen)}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
            render={
              <Card.Root
                elevation='overlay'
                render={
                  handleSubmit ? (
                    <form
                      noValidate
                      onSubmit={event => {
                        event.preventDefault();
                        handleSubmit();
                      }}
                    />
                  ) : undefined
                }
                renderBranding={false}
              />
            }
          >
            <DialogContent {...props} />
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
