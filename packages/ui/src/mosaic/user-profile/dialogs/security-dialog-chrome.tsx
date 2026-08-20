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
  label = 'Resend',
  resend,
  onResend,
  disabled = false,
}: {
  label?: string;
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
      {waiting ? `${label} (${resend.secondsRemaining}s)` : label}
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
  disabled = false,
  autoFocus = false,
  onComplete,
  onChange,
}: {
  id?: string;
  value: string;
  status: 'idle' | 'verifying' | 'error' | 'success';
  disabled?: boolean;
  autoFocus?: boolean;
  onComplete: (value: string) => void;
  onChange: (value: string) => void;
}) {
  const completedRef = React.useRef(false);
  const handleChange = (next: string) => {
    const digits = next.replace(/\D/g, '').slice(0, 6);
    onChange(digits);
    if (digits.length === 6 && !completedRef.current) {
      completedRef.current = true;
      onComplete(digits);
    } else if (digits.length < 6) {
      completedRef.current = false;
    }
  };

  return (
    <Input
      autoComplete='one-time-code'
      autoFocus={autoFocus}
      disabled={disabled || status === 'verifying' || status === 'success'}
      id={id}
      inputMode='numeric'
      placeholder='······'
      value={value}
      {...stylex.props(styles.codeInput, status === 'error' && styles.codeInputInvalid)}
      onChange={event => handleChange(event.target.value)}
    />
  );
}

const COUNTRIES = [
  { code: 'US', dialCode: '+1', label: '🇺🇸 US' },
  { code: 'GB', dialCode: '+44', label: '🇬🇧 UK' },
  { code: 'GR', dialCode: '+30', label: '🇬🇷 GR' },
  { code: 'DE', dialCode: '+49', label: '🇩🇪 DE' },
] as const;

export function PhoneInput({
  id,
  value,
  disabled = false,
  autoFocus = false,
  onChange,
}: {
  id?: string;
  value: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange: (value: string) => void;
}) {
  const matched = COUNTRIES.find(country => value.startsWith(country.dialCode)) ?? COUNTRIES[0];
  const national = value.slice(matched.dialCode.length);

  return (
    <div {...stylex.props(styles.phoneRow)}>
      <select
        aria-label='Country'
        disabled={disabled}
        value={matched.code}
        {...stylex.props(styles.countrySelect)}
        onChange={event => {
          const next = COUNTRIES.find(country => country.code === event.target.value) ?? COUNTRIES[0];
          onChange(`${next.dialCode}${national}`);
        }}
      >
        {COUNTRIES.map(country => (
          <option
            key={country.code}
            value={country.code}
          >
            {country.label} {country.dialCode}
          </option>
        ))}
      </select>
      <Input
        autoComplete='tel'
        autoFocus={autoFocus}
        disabled={disabled}
        id={id}
        inputMode='tel'
        placeholder='201 555 0123'
        type='tel'
        value={national}
        {...stylex.props(styles.phoneInput)}
        onChange={event => onChange(`${matched.dialCode}${event.target.value}`)}
      />
    </div>
  );
}
