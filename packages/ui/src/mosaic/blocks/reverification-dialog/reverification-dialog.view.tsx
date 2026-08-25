import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Input } from '../../components/input';
import { colorVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';
import { reverificationDialogMessages as m } from './reverification-dialog.messages';
import type { ReverificationDialogResendState, ReverificationDialogViewProps } from './reverification-dialog.types';

const styles = stylex.create({
  header: {
    gap: space['1'],
    display: 'flex',
    flexDirection: 'column',
  },
  body: {
    margin: '-0.25rem',
    padding: '0.25rem',
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  footer: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  footerSpread: {
    justifyContent: 'space-between',
  },
  footerButton: {
    flexGrow: 1,
  },
  form: {
    gap: space['5'],
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  alert: {
    borderColor: colorVars['--cl-color-negative'],
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: space['2'],
    paddingInline: space['3'],
    backgroundColor: colorVars['--cl-color-negative-faded'],
    color: colorVars['--cl-color-negative'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
  },
  codeInput: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: space['3'],
    paddingInline: space['4'],
    backgroundColor: colorVars['--cl-color-input'],
    fontFamily: 'monospace',
    fontSize: typeScaleVars['--cl-text-xl-size'],
    letterSpacing: '0.5em',
    textAlign: 'center',
    width: '100%',
  },
  codeInputInvalid: {
    borderColor: colorVars['--cl-color-negative'],
  },
  muted: {
    color: colorVars['--cl-color-neutral-faded'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
  },
  identifier: {
    color: colorVars['--cl-color-neutral'],
    fontWeight: 600,
    overflowWrap: 'anywhere',
  },
  resendRow: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
});

function DialogHeader({ title, description }: { title: React.ReactNode; description?: React.ReactNode }) {
  return (
    <div {...stylex.props(styles.header)}>
      <Dialog.Title>{title}</Dialog.Title>
      {description ? <Dialog.Description>{description}</Dialog.Description> : null}
    </div>
  );
}

function DialogBody({ children }: { children: React.ReactNode }) {
  return <div {...stylex.props(styles.body)}>{children}</div>;
}

function DialogFooter({ children, spread = false }: { children: React.ReactNode; spread?: boolean }) {
  return <div {...stylex.props(styles.footer, spread && styles.footerSpread)}>{children}</div>;
}

function DialogForm({ children, onSubmit }: { children: React.ReactNode; onSubmit: () => void }) {
  return (
    <form
      noValidate
      {...stylex.props(styles.form)}
      onSubmit={event => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {children}
    </form>
  );
}

function FormAlert({ children }: { children?: React.ReactNode }) {
  return children ? (
    <p
      role='alert'
      {...stylex.props(styles.alert)}
    >
      {children}
    </p>
  ) : null;
}

function MutedText({ children }: { children: React.ReactNode }) {
  return <p {...stylex.props(styles.muted)}>{children}</p>;
}

function Identifier({ children }: { children?: React.ReactNode }) {
  return <span {...stylex.props(styles.identifier)}>{children}</span>;
}

function ResendButton({
  disabled = false,
  label,
  resend,
  onResend,
}: {
  disabled?: boolean;
  label: string;
  resend: ReverificationDialogResendState;
  onResend: () => void;
}) {
  const waiting = resend.secondsRemaining > 0;

  return (
    <Button
      color='neutral'
      disabled={disabled || waiting || resend.isResending}
      focusableWhenDisabled
      size='sm'
      variant='link'
      onClick={onResend}
    >
      {waiting ? `${label} (${resend.secondsRemaining}s)` : label}
    </Button>
  );
}

function CodeInput({
  id,
  status,
  value,
  onChange,
  onComplete,
}: {
  id: string;
  status: 'idle' | 'verifying' | 'error';
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
}) {
  const completedValueRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (value.length === 6 && completedValueRef.current !== value) {
      completedValueRef.current = value;
      onComplete(value);
    }

    if (value.length < 6) {
      completedValueRef.current = undefined;
    }
  }, [onComplete, value]);

  return (
    <Input
      autoComplete='one-time-code'
      disabled={status === 'verifying'}
      id={id}
      inputMode='numeric'
      maxLength={6}
      placeholder='••••••'
      value={value}
      onChange={event => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
      {...stylex.props(styles.codeInput, status === 'error' && styles.codeInputInvalid)}
    />
  );
}

type ReverificationDialogContentProps = Omit<ReverificationDialogViewProps, 'open' | 'onOpenChange'> & {
  onCancel: () => void;
};

function ReverificationDialogContent({
  strategy,
  step = 'verify',
  availableFactors,
  preparationStatus,
  identifier,
  value,
  isVerifying = false,
  fieldError,
  formError,
  isResending = false,
  resendSecondsRemaining = 0,
  onValueChange,
  onSubmit,
  onResend,
  onCancel,
  onSelectFactor,
  onBack,
  onPrepare,
  onShowHelp,
}: ReverificationDialogContentProps) {
  const fieldId = React.useId();

  if (step === 'select-first-factor' || step === 'select-second-factor') {
    return (
      <>
        <Dialog.CloseButton />
        <DialogHeader
          description={step === 'select-second-factor' ? m.chooseSecond : m.chooseFirst}
          title={m.title}
        />
        <DialogBody>
          <FormAlert>{formError}</FormAlert>
          {availableFactors?.map(factor => (
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
            {step === 'select-second-factor' ? m.back : m.cancel}
          </Button>
          {onShowHelp ? (
            <Button
              color='neutral'
              variant='link'
              onClick={onShowHelp}
            >
              {m.havingTrouble}
            </Button>
          ) : null}
        </DialogFooter>
      </>
    );
  }

  if (step === 'prepare') {
    const failed = preparationStatus === 'error';
    return (
      <>
        <Dialog.CloseButton />
        <DialogHeader
          description={m.preparingDescription}
          title={m.title}
        />
        <DialogBody>
          {failed ? <FormAlert>{formError ?? m.prepareError}</FormAlert> : null}
          {!failed ? <MutedText>{m.preparing}</MutedText> : null}
        </DialogBody>
        <DialogFooter>
          <Button
            color='neutral'
            variant='ghost'
            onClick={onBack ?? onCancel}
          >
            {m.back}
          </Button>
          {failed ? <Button onClick={onPrepare}>{m.tryAgain}</Button> : null}
        </DialogFooter>
      </>
    );
  }

  if (step === 'unavailable' || step === 'help') {
    return (
      <>
        <Dialog.CloseButton />
        <DialogHeader
          description={step === 'unavailable' ? m.unavailableDescription : m.helpDescription}
          title={step === 'unavailable' ? m.unavailableTitle : m.havingTrouble}
        />
        <DialogBody>
          <FormAlert>{formError}</FormAlert>
        </DialogBody>
        <DialogFooter>
          <Button onClick={onBack ?? onCancel}>{onBack ? m.back : m.close}</Button>
        </DialogFooter>
      </>
    );
  }

  const isDeliveredCode = strategy === 'email_code' || strategy === 'phone_code';
  const isCode = isDeliveredCode || strategy === 'totp';
  const isPasskey = strategy === 'passkey';
  const isPassword = strategy === 'password';
  const canSubmit = isPasskey || value.length > 0;

  const description = (() => {
    if (isDeliveredCode) {
      return (
        <>
          {m.deliveredCode} <Identifier>{identifier}</Identifier>
        </>
      );
    }
    if (strategy === 'totp') {
      return m.totp;
    }
    if (strategy === 'backup_code') {
      return m.backupCode;
    }
    if (isPasskey) {
      return m.passkey;
    }
    return m.password;
  })();

  const fieldLabel = isPassword ? m.passwordLabel : strategy === 'backup_code' ? m.backupCodeLabel : m.verificationCode;

  return (
    <>
      <Dialog.CloseButton />
      <DialogHeader
        description={description}
        title={m.title}
      />
      <DialogForm onSubmit={onSubmit}>
        <DialogBody>
          <FormAlert>{formError}</FormAlert>
          {!isPasskey ? (
            <Field.Root invalid={Boolean(fieldError)}>
              <Field.Label htmlFor={fieldId}>{fieldLabel}</Field.Label>
              {isCode ? (
                <CodeInput
                  id={fieldId}
                  status={fieldError ? 'error' : isVerifying ? 'verifying' : 'idle'}
                  value={value}
                  onChange={onValueChange}
                  onComplete={onSubmit}
                />
              ) : (
                <Input
                  autoComplete={isPassword ? 'current-password' : 'one-time-code'}
                  disabled={isVerifying}
                  id={fieldId}
                  type={isPassword ? 'password' : 'text'}
                  value={value}
                  onChange={event => onValueChange(event.target.value)}
                />
              )}
              {fieldError ? <Field.Error>{fieldError}</Field.Error> : null}
            </Field.Root>
          ) : null}
          {isDeliveredCode ? (
            <div {...stylex.props(styles.resendRow)}>
              <MutedText>{m.didNotReceiveCode}</MutedText>
              <ResendButton
                disabled={isVerifying}
                label={m.resend}
                resend={{ isResending, secondsRemaining: resendSecondsRemaining }}
                onResend={onResend}
              />
            </div>
          ) : null}
        </DialogBody>
        <DialogFooter>
          {onBack ? (
            <Button
              color='neutral'
              disabled={isVerifying}
              variant='ghost'
              onClick={onBack}
            >
              {m.anotherMethod}
            </Button>
          ) : null}
          <Button
            color='neutral'
            disabled={isVerifying}
            type='button'
            variant='outline'
            onClick={onCancel}
            {...stylex.props(styles.footerButton)}
          >
            {m.cancel}
          </Button>
          <SubmitButton
            disabled={!canSubmit}
            isPending={isVerifying}
            pendingLabel={m.pending}
            {...stylex.props(styles.footerButton)}
          >
            {isPasskey ? m.withPasskey : m.continue}
          </SubmitButton>
        </DialogFooter>
      </DialogForm>
    </>
  );
}

export function ReverificationDialogView({ open, onOpenChange, ...props }: ReverificationDialogViewProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <ReverificationDialogContent
        {...props}
        onCancel={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
