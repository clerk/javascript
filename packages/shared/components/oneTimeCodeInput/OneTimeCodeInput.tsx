import cn from 'classnames';
import React from 'react';

import { noop } from '../../utils';
import { Button } from '../button';
import { Input } from '../input';
import { Spinner } from '../spinner';
// @ts-ignore
import styles from './OneTimeCodeInput.module.scss';

const BLANK_CHAR = '';
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

export function OneTimeCodeInput({
  value,
  setValue,
  length = DEFAULT_CODE_LENGTH,
  onResendCode,
  verifyCodeHandler,
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

  React.useEffect(() => {
    selectInputContentAt(activeInputIndex);
  }, [activeInputIndex]);

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
    if (verificationState.status === 'idle') {
      focusInput({ index: 0 });
    }
  }, [verificationState.status]);

  function isValidInput(char: string) {
    return char != undefined && Number.isInteger(+char);
  }

  function updateCode(newCode: string) {
    if (value === newCode) {
      return;
    }
    setValue(newCode);
  }

  function updateCodeValueAt(index: number, char: string) {
    const newValues = [...inputValues];
    newValues[index] = char;
    const newCode = newValues.join('');
    // Focus the input after the last valid digit
    // focusInput({ index: newCode.length + 1 });
    if (index > newCode.length) {
      setActiveInputIndex(newCode.length);
    }
    updateCode(newCode);
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

  function focusInput(opts: { index: number } | { dir: 'next' | 'prev' }) {
    let clampedIndex = 'index' in opts ? opts.index : activeInputIndex + (opts.dir === 'next' ? 1 : -1);
    clampedIndex = Math.max(Math.min(length - 1, clampedIndex), 0);
    setActiveInputIndex(clampedIndex);
  }

  function selectInputContentAt(index: number) {
    const ref = inputRefs[Math.max(Math.min(length - 1, index), 0)].current;
    if (ref) {
      ref.focus();
      ref.select();
    }
  }

  function handleOnFocus(index: number) {
    if (verificationState.status === 'failed') {
      return reset();
    }
    focusInput({ index });
  }

  function handleWebOtp(code: string | undefined) {
    if (!code || code.length !== length) {
      return;
    }
    updateCode(code);
    focusInput({ index: length - 1 });
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
  }

  const handleOnChange = (el: HTMLInputElement) => {
    const { value } = el;
    if (isValidInput(value)) {
      updateCodeValueAt(activeInputIndex, value);
    }
  };

  const handleOnInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (verificationState.status === 'failed') {
      return reset();
    }

    if ((e.target as any).value) {
      // If a user selects an input that's already filled
      // and types the same value, the onChange event will not fire,
      // but we still want to focus the next
      focusInput({ dir: 'next' });
    }
  };

  const inputFields = inputValues.map((value, i) => (
    <Input
      key={i}
      ref={inputRefs[i]}
      value={value}
      handleChange={handleOnChange}
      onInput={handleOnInput}
      onKeyDown={handleOnKeyDown}
      onFocus={() => handleOnFocus(i)}
      onPaste={handleOnPaste}
      autoFocus={autoFocus && verificationState.status === 'idle' && i === activeInputIndex}
      maxLength={1}
      autoComplete='one-time-code'
      type='text'
      inputMode='numeric'
      name={`codeInput-${i}`}
      disabled={verificationState.status === 'loading' || verificationState.status === 'verified'}
      className={cn(styles.codeInput, {
        [styles.error]: verificationState.status === 'failed',
        [styles.verified]: verificationState.status === 'verified',
      })}
      aria-label={`${i === 0 ? 'Enter verification code. ' : ''}${'Digit'} ${i + 1}`}
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
