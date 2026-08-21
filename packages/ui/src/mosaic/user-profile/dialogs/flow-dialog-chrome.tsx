import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import React from 'react';

import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Icon } from '../../components/icon';
import { Input } from '../../components/input';
import { Spinner } from '../../components/spinner';
import { styles } from './flow-dialogs.styles';

/**
 * Chrome shared by every contact dialog. Mosaic has no `Dialog.Header` / `Body` / `Footer` yet, so
 * these stand in — see the TODOs on `flow-dialogs.styles.ts`. `Body` in particular is load
 * bearing rather than cosmetic: a `prompt` clips its overflow under 48rem, so a form without a
 * scroll region loses its submit button off the bottom of the phone sheet.
 */

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

export function DialogFooter({ children, spread = false }: { children: ReactNode; spread?: boolean }) {
  return <div {...stylex.props(styles.footer, spread && styles.footerSpread)}>{children}</div>;
}

/**
 * Unattributed errors. A Clerk error carrying a `meta.paramName` belongs in the matching field's
 * error slot; one without has nowhere else to go.
 *
 * TODO: Replace with the Mosaic Alert component.
 */
export function FormAlert({ children }: { children?: ReactNode }) {
  if (!children) {
    return null;
  }
  return (
    <p
      role='alert'
      {...stylex.props(styles.alert)}
    >
      {children}
    </p>
  );
}

export interface DialogFormProps {
  onSubmit: () => void;
  children: ReactNode;
}

/** Wraps the steps that submit, so Enter works and the browser treats it as a form. */
export function DialogForm({ onSubmit, children }: DialogFormProps) {
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

/**
 * The resend affordance. Disabled while a resend is in flight and for as long as the cooldown has
 * left to run — the email-link screen throttles to 60 seconds and starts disabled, matching the
 * legacy `TimerButton`, while a code resend has no cooldown of its own.
 */
export function ResendButton({
  label,
  resend,
  onResend,
  disabled = false,
}: {
  label: string;
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

/** A centred waiting or outcome panel — the link and SSO steps, and the brief prepare step. */
export function StatusPanel({
  tone = 'pending',
  icon,
  children,
}: {
  tone?: 'pending' | 'positive' | 'negative';
  icon?: 'check' | 'alert-circle';
  children: ReactNode;
}) {
  return (
    <div {...stylex.props(styles.status)}>
      {tone === 'pending' ? <Spinner /> : null}
      {icon ? (
        <Icon
          aria-hidden
          name={icon}
          {...stylex.props(tone === 'negative' ? styles.statusIconNegative : styles.statusIconPositive)}
        />
      ) : null}
      {children}
    </div>
  );
}

export function MutedText({ children }: { children: ReactNode }) {
  return <p {...stylex.props(styles.muted)}>{children}</p>;
}

export function Identifier({ children }: { children: ReactNode }) {
  return <span {...stylex.props(styles.identifier)}>{children}</span>;
}

export interface CodeInputProps {
  id?: string;
  value: string;
  length?: number;
  status: 'idle' | 'verifying' | 'error' | 'success';
  disabled?: boolean;
  autoFocus?: boolean;
  /** Fired once the final digit lands, matching the legacy `onCodeEntryFinished` auto-submit. */
  onComplete: () => void;
  onChange: (value: string) => void;
}

/**
 * TODO: Replace with the Mosaic OTP component, built on `@clerk/headless/otp`. A single input
 * standing in for the segmented control: it keeps the flow states honest (idle / verifying /
 * error / success, plus the auto-submit on the last digit) without pretending to be the real
 * component.
 */
export function CodeInput({
  id,
  value,
  length = 6,
  status,
  disabled = false,
  autoFocus = false,
  onComplete,
  onChange,
}: CodeInputProps) {
  // No `maxLength`: it would truncate a pasted value before the non-digit strip below runs, so
  // `42-4242` would lose its last digit rather than its separator. The handler owns the length.
  const completedRef = React.useRef(false);

  const handleChange = (next: string) => {
    const digits = next.replace(/\D/g, '').slice(0, length);
    onChange(digits);
    if (digits.length === length && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
    if (digits.length < length) {
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
      placeholder={'·'.repeat(length)}
      value={value}
      {...stylex.props(
        styles.codeInput,
        status === 'error' && styles.codeInputInvalid,
        status === 'success' && styles.codeInputVerified,
      )}
      onChange={event => handleChange(event.target.value)}
    />
  );
}

/** A small, deliberately incomplete dialling-code list — enough to exercise the control. */
const COUNTRIES = [
  { code: 'US', dialCode: '+1', label: '🇺🇸 US' },
  { code: 'GB', dialCode: '+44', label: '🇬🇧 UK' },
  { code: 'GR', dialCode: '+30', label: '🇬🇷 GR' },
  { code: 'DE', dialCode: '+49', label: '🇩🇪 DE' },
] as const;

export interface PhoneInputProps {
  id?: string;
  value: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange: (value: string) => void;
}

/**
 * TODO: Replace with a Mosaic PhoneInput; its country picker should be the Mosaic Select, built on
 * `@clerk/headless/select`. A native `<select>` and a `tel` input stand in — no formatting, no
 * flag lookup, no country inference from a pasted number.
 */
export function PhoneInput({ id, value, disabled = false, autoFocus = false, onChange }: PhoneInputProps) {
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
