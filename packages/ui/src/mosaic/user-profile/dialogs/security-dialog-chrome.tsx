import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import React from 'react';

import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Input } from '../../components/input';
import { securityDialogStyles as styles } from './security-dialog-chrome.styles';

export function DialogHeader({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <div {...stylex.props(styles.header)}>
      <Dialog.Title>{title}</Dialog.Title>
      {description ? <Dialog.Description>{description}</Dialog.Description> : null}
    </div>
  );
}

export function DialogBody({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.body)}>{children}</div>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.footer)}>{children}</div>;
}

export function FormAlert({ children }: { children?: ReactNode }) {
  return children ? (
    <p
      role='alert'
      {...stylex.props(styles.alert)}
    >
      {children}
    </p>
  ) : null;
}

export function DialogForm({ onSubmit, children }: { onSubmit: () => void; children: ReactNode }) {
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

export function ResendButton({
  resend,
  onResend,
  disabled = false,
}: {
  resend: { isResending: boolean; secondsRemaining: number };
  onResend: () => void;
  disabled?: boolean;
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
      {waiting ? `Resend (${resend.secondsRemaining}s)` : 'Resend'}
    </Button>
  );
}

export function MutedText({ children }: { children: ReactNode }) {
  return <p {...stylex.props(styles.muted)}>{children}</p>;
}

export function Identifier({ children }: { children: ReactNode }) {
  return <span {...stylex.props(styles.identifier)}>{children}</span>;
}

export function CodeInput({
  id,
  value,
  status,
  onComplete,
  onChange,
}: {
  id?: string;
  value: string;
  status: 'idle' | 'verifying' | 'error';
  onComplete: () => void;
  onChange: (value: string) => void;
}) {
  const completedRef = React.useRef(false);
  const handleChange = (next: string) => {
    const digits = next.replace(/\D/g, '').slice(0, 6);
    onChange(digits);
    if (digits.length === 6 && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    } else if (digits.length < 6) {
      completedRef.current = false;
    }
  };

  return (
    <Input
      autoComplete='one-time-code'
      autoFocus
      disabled={status === 'verifying'}
      id={id}
      inputMode='numeric'
      placeholder='······'
      value={value}
      {...stylex.props(styles.codeInput, status === 'error' && styles.codeInputInvalid)}
      onChange={event => handleChange(event.target.value)}
    />
  );
}
