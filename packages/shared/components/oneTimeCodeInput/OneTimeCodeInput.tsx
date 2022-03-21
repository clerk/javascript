import cn from 'classnames';
import React from 'react';

import { noop } from '../../utils';
import { Button } from '../button';
import { Input } from '../input';
import { Spinner } from '../spinner';
// @ts-ignore
import styles from './OneTimeCodeInput.module.scss';

const BLANK_CHAR = ' ';
const PRINTABLE_CHARS_REGEX = /^[a-z0-9!"#$%&'()*+,./:;<=>?@[\] ^_`{|}~-]*$/i;
const VERIFY_SUCCESS_ACTION_DELAY = 500;
const VERIFY_FAILURE_ACTION_DELAY = 2000;
const DEFAULT_CODE_LENGTH = 6;

type VerifyCallback = (afterVerifyCallback?: () => any) => void;
type RejectCallback = (errorMessage?: string) => void;

export type VerifyCodeHandler = (verify: VerifyCallback, reject: RejectCallback) => void;

export interface OneTimeCodeInputProps {
  value: string;
  setValue: (code: string) => any;
  verifyCodeHandler: VerifyCodeHandler;
  length?: number;
  onResendCode?: () => any;
  numeric?: boolean;
  autoFocus?: boolean;
  className?: string;
  style?: Record<string, unknown>;
  resendCodeButtonClassName?: string;
}

type Status =
  | { status: 'idle' }
  | { status: 'failed'; message: string }
  | { status: 'loading' }
  | { status: 'verified' };

function isModifierKeyActive(e: React.KeyboardEvent<any>) {
  const modifiersWithoutShift = ['Alt', 'AltGraph', 'Control', 'Meta'];
  return modifiersWithoutShift.some(mod => e.getModifierState(mod));
}

function isCharacterKeyPress(key: string) {
  return key.length === 1 && key.match(PRINTABLE_CHARS_REGEX) !== null;
}

export function OneTimeCodeInput({
  value,
  setValue,
  length = DEFAULT_CODE_LENGTH,
  onResendCode,
  verifyCodeHandler,
  numeric = true,
  autoFocus = true,
  resendCodeButtonClassName,
  ...rest
}: OneTimeCodeInputProps): JSX.Element {
  const inputValues = Array.from({ length }, (_, i) => value[i] || BLANK_CHAR);
  const [activeInputIndex, setActiveInputIndex] = React.useState(0);
  const [canResendCode, setCanResendCode] = React.useState(true);
  const [verificationState, setVerificationState] = React.useState<Status>({
    status: 'idle',
  });

  let autofillableOtp: string[] = [];
  const inputRefs = Array.from({ length }, () => React.createRef<HTMLInputElement>());

  React.useEffect(() => {
    if (value.replace(BLANK_CHAR, '').length !== length) {
      return noop;
    }

    let timerId: any;
    setVerificationState({ status: 'loading' });
    verifyCodeHandler(
      afterVerifyCallback => {
        setVerificationState({ status: 'verified' });
        timerId = setTimeout(() => afterVerifyCallback?.(), VERIFY_SUCCESS_ACTION_DELAY);
      },
      err => {
        setVerificationState({ status: 'failed', message: err || 'Failed' });
        timerId = setTimeout(() => reset(), VERIFY_FAILURE_ACTION_DELAY);
      },
    );
    return () => clearTimeout(timerId);
  }, [length, value]);

  React.useEffect(() => {
    if (verificationState.status === 'failed') {
      return;
    }
    inputRefs[activeInputIndex].current?.focus();
  }, [activeInputIndex, verificationState.status, inputRefs]);

  function isValidInput(char: string) {
    return numeric ? char === ' ' || Number.isInteger(+char) : true;
  }

  function updateCode(newCode: string) {
    if (value === newCode) {
      return;
    }
    setValue(newCode);
  }

  function reset() {
    setVerificationState({ status: 'idle' });
    setCanResendCode(true);
    updateCode(BLANK_CHAR.repeat(length));
    focusInput({ index: 0 });
  }

  function handleResendCode() {
    onResendCode?.();
    reset();
    setCanResendCode(false);
  }

  function updateCodeValueAt(index: number, char: string) {
    const newValues = [...inputValues];
    newValues[index] = char;
    updateCode(newValues.join(''));
  }

  function focusInput(opts: { index: number } | { dir: 'next' | 'prev' }) {
    let index = 'index' in opts ? opts.index : activeInputIndex + (opts.dir === 'next' ? 1 : -1);
    index = Math.max(Math.min(length - 1, index), 0);
    setActiveInputIndex(index);
    inputRefs[index]?.current?.focus();
  }

  function selectInputAt(index: number) {
    inputRefs[Math.max(Math.min(length - 1, index), 0)].current?.select();
  }

  function handleOnFocus(index: number) {
    if (verificationState.status === 'failed') {
      reset();
      return;
    }
    focusInput({ index });
  }

  function handleOnPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const clipboardText = e.clipboardData.getData('text/plain') || '';
    if (clipboardText.length === 0 || !clipboardText.split('').every(char => isValidInput(char))) {
      return;
    }

    if (clipboardText.length === length) {
      updateCode(clipboardText);
      focusInput({ index: length - 1 });
      return;
    }

    const newInputValues = inputValues.map((val, i) =>
      i < activeInputIndex ? val : clipboardText[i - activeInputIndex] || val,
    );
    updateCode(newInputValues.join(''));
    focusInput({ index: activeInputIndex + clipboardText.length - 1 });
  }

  function handleOnKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'Backspace':
        e.preventDefault();
        updateCodeValueAt(activeInputIndex, BLANK_CHAR);
        focusInput({ dir: 'prev' });
        selectInputAt(activeInputIndex - 1);
        return;
      case 'ArrowLeft':
        e.preventDefault();
        focusInput({ dir: 'prev' });
        return;
      case 'ArrowRight':
        e.preventDefault();
        focusInput({ dir: 'next' });
        return;
      case ' ':
        e.preventDefault();
        return;
    }

    if (isCharacterKeyPress(e.key) && isValidInput(e.key) && !isModifierKeyActive(e)) {
      updateCodeValueAt(activeInputIndex, e.key);
      focusInput({ dir: 'next' });
    }
  }

  const handleIosOtpInput = (e: React.FormEvent<HTMLInputElement>) => {
    let val = (e.target as any).value as string;
    if (!val) {
      return;
    }
    val = val.replace(BLANK_CHAR, '');
    autofillableOtp = [...autofillableOtp, val].filter(c => !!c);
    if (autofillableOtp.length === length) {
      const code = autofillableOtp.join('');
      updateCode(code);
    }
  };

  const inputFields = inputValues.map((value, i) => (
    <Input
      key={i}
      ref={inputRefs[i]}
      value={value}
      onInput={handleIosOtpInput}
      onKeyDown={handleOnKeyDown}
      onFocus={() => handleOnFocus(i)}
      onPaste={handleOnPaste}
      autoFocus={autoFocus && verificationState.status === 'idle' && i === activeInputIndex}
      maxLength={1}
      autoComplete='one-time-code'
      type='text'
      inputMode={numeric ? 'numeric' : 'text'}
      name={`codeInput-${i}`}
      disabled={verificationState.status === 'loading' || verificationState.status === 'verified'}
      className={cn(styles.codeInput, {
        [styles.error]: verificationState.status === 'failed',
        [styles.verified]: verificationState.status === 'verified',
      })}
      aria-label={`${i === 0 ? 'Enter verification code. ' : ''}${numeric ? 'Digit' : 'Character'} ${i + 1}`}
    />
  ));

  return (
    <div {...rest}>
      <div
        data-test-id='otp-container'
        className={styles.inputContainer}
      >
        {inputFields}
      </div>
      <div className={styles.statusContainer}>
        {verificationState.status === 'loading' && <Spinner />}
        {verificationState.status === 'idle' && onResendCode && (
          <Button
            onClick={handleResendCode}
            className={cn(styles.resendCode, resendCodeButtonClassName)}
            disabled={!canResendCode}
            flavor='link'
          >
            Resend Code
          </Button>
        )}
        {verificationState.status === 'failed' && (
          <span className={styles.errorMessage}>{verificationState.message}</span>
        )}
      </div>
    </div>
  );
}
