import { createContextAndHook } from '@clerk/shared/react';
import type { PropsWithChildren } from 'react';
import React, { useCallback } from 'react';

import type { LocalizationKey } from '../customizables';
import { Box, descriptors, Flex, Input } from '../customizables';
import { useCardState } from '../elements/contexts';
import { useLoadingStatus } from '../hooks';
import type { PropsOfComponent } from '../styledSystem';
import { common, mqu } from '../styledSystem';
import { handleError } from '../utils/errorHandler';
import { sleep } from '../utils/sleep';
import type { FormControlState } from '../utils/useFormControl';
import { useFormControl } from '../utils/useFormControl';
import { TimerButton } from './TimerButton';

type UseCodeInputOptions = {
  length?: number;
};

type onCodeEntryFinishedCallback = (code: string) => unknown;
type onCodeEntryFinished = (cb: onCodeEntryFinishedCallback) => void;

type onCodeEntryFinishedActionCallback<R = unknown> = (
  code: string,
  resolve: (params?: R) => Promise<void>,
  reject: (err: unknown) => Promise<void>,
) => void;

type UseFieldOTP = <R = unknown>(params: {
  id?: 'code';
  onCodeEntryFinished: onCodeEntryFinishedActionCallback<R>;
  onResendCodeClicked?: React.MouseEventHandler;
  onResolve?: (a?: R) => Promise<void> | void;
}) => {
  isLoading: boolean;
  otpControl: ReturnType<typeof useCodeControl>;
  onResendCode: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onFakeContinue: () => void;
};

export const useFieldOTP: UseFieldOTP = params => {
  const card = useCardState();
  const {
    id = 'code',
    onCodeEntryFinished: paramsOnCodeEntryFinished,
    onResendCodeClicked: paramsOnResendCodeClicked,
    onResolve: paramsOnResolve,
  } = params;
  const codeControlState = useFormControl(id, '');
  const codeControl = useCodeControl(codeControlState);
  const status = useLoadingStatus();

  const resolve = async (param: any) => {
    // TODO: Localize this
    codeControlState.setSuccess('success');
    await sleep(750);
    await paramsOnResolve?.(param);
  };

  const reject = async (err: any) => {
    handleError(err, [codeControlState], card.setError);
    status.setIdle();
    await sleep(750);
    codeControl.reset();
  };

  codeControl.onCodeEntryFinished(code => {
    status.setLoading();
    codeControlState.clearFeedback();
    paramsOnCodeEntryFinished(code, resolve, reject);
  });

  const onFakeContinue = () => {
    codeControlState.clearFeedback();
    paramsOnCodeEntryFinished('', resolve, reject);
  };

  const onResendCode = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    e => {
      codeControl.reset();
      paramsOnResendCodeClicked?.(e);
    },
    [codeControl, paramsOnResendCodeClicked],
  );

  return {
    isLoading: status.isLoading,
    otpControl: codeControl,
    onResendCode: paramsOnResendCodeClicked ? onResendCode : undefined,
    onFakeContinue,
  };
};

const useCodeControl = (formControl: FormControlState, options?: UseCodeInputOptions) => {
  const otpControlRef = React.useRef<any>();
  const userOnCodeEnteredCallback = React.useRef<onCodeEntryFinishedCallback>();
  const defaultValue = formControl.value;
  const { feedback, feedbackType, onChange, clearFeedback } = formControl;
  const { length = 6 } = options || {};
  const [values, setValues] = React.useState(() =>
    defaultValue ? defaultValue.split('').slice(0, length) : Array.from({ length }, () => ''),
  );

  const onCodeEntryFinished: onCodeEntryFinished = cb => {
    userOnCodeEnteredCallback.current = cb;
  };

  React.useEffect(() => {
    const len = values.filter(c => c).length;
    if (len === length) {
      const code = values.map(c => c || ' ').join('');
      userOnCodeEnteredCallback.current?.(code);
    } else {
      const code = values.join('');
      onChange?.({ target: { value: code } } as any);
    }
  }, [values.toString()]);

  const otpInputProps = { length, values, setValues, feedback, feedbackType, clearFeedback, ref: otpControlRef };
  return { otpInputProps, onCodeEntryFinished, reset: () => otpControlRef.current?.reset() };
};

export type OTPInputProps = {
  label?: string | LocalizationKey;
  resendButton?: LocalizationKey;
  description?: string | LocalizationKey;
  isLoading: boolean;
  isDisabled?: boolean;
  onResendCode?: React.MouseEventHandler<HTMLButtonElement>;
  otpControl: ReturnType<typeof useFieldOTP>['otpControl'];
  centerAlign?: boolean;
};

const [OTPInputContext, useOTPInputContext] = createContextAndHook<OTPInputProps>('OTPInputContext');

export const OTPRoot = ({ children, ...props }: PropsWithChildren<OTPInputProps>) => {
  return <OTPInputContext.Provider value={{ value: props }}>{children}</OTPInputContext.Provider>;
};

export const OTPResendButton = () => {
  const { resendButton, onResendCode, isLoading, otpControl } = useOTPInputContext();

  if (!onResendCode) {
    return null;
  }

  return (
    <TimerButton
      elementDescriptor={descriptors.formResendCodeLink}
      onClick={onResendCode}
      startDisabled
      isDisabled={otpControl.otpInputProps.feedbackType === 'success' || isLoading}
      showCounter={otpControl.otpInputProps.feedbackType !== 'success'}
      localizationKey={resendButton}
    />
  );
};

export const OTPCodeControl = React.forwardRef<{ reset: any }>((_, ref) => {
  const [disabled, setDisabled] = React.useState(false);
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const hiddenInputRef = React.useRef<HTMLInputElement>(null);
  const firstClickRef = React.useRef(false);

  const { otpControl, isLoading, isDisabled, centerAlign = true } = useOTPInputContext();
  const { feedback, values, setValues, feedbackType, length } = otpControl.otpInputProps;

  React.useImperativeHandle(ref, () => ({
    reset: () => {
      setValues(values.map(() => ''));
      setDisabled(false);

      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = '';
      }

      setTimeout(() => focusInputAt(0), 0);
    },
  }));

  React.useLayoutEffect(() => {
    setTimeout(() => focusInputAt(0), 0);
  }, []);

  React.useEffect(() => {
    if (feedback) {
      setDisabled(true);
    }
  }, [feedback]);

  // Update hidden input when values change
  React.useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = values.join('');
    }
  }, [values]);

  // Focus management for password managers
  React.useEffect(() => {
    const handleFocus = () => {
      // If focus is on the hidden input, redirect to first visible input
      if (document.activeElement === hiddenInputRef.current) {
        setTimeout(() => focusInputAt(0), 0);
      }
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  const handleMultipleCharValue = ({ eventValue, inputPosition }: { eventValue: string; inputPosition: number }) => {
    const eventValues = (eventValue || '').split('');

    if (eventValues.length === 0 || !eventValues.every(c => isValidInput(c))) {
      return;
    }

    if (eventValues.length === length) {
      setValues([...eventValues]);
      focusInputAt(length - 1);
      return;
    }

    const mergedValues = values.map((value, i) =>
      i < inputPosition ? value : eventValues[i - inputPosition] || value,
    );
    setValues(mergedValues);
    focusInputAt(inputPosition + eventValues.length);
  };

  const changeValueAt = (index: number, newValue: string) => {
    const newValues = [...values];
    newValues[index] = newValue;
    setValues(newValues);
  };

  const focusInputAt = (index: number) => {
    const clampedIndex = Math.min(Math.max(0, index), refs.current.length - 1);
    const ref = refs.current[clampedIndex];
    if (ref) {
      ref.focus();
      if (values[clampedIndex]) {
        ref.select();
      }
    }
  };

  const handleOnClick = (index: number) => (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    // Focus on the first digit, when the first click happens.
    // This is helpful especially for mobile (iOS) devices that cannot autofocus
    // and user needs to manually tap the input area
    if (!firstClickRef.current) {
      focusInputAt(0);
      firstClickRef.current = true;
      return;
    }
    focusInputAt(index);
  };

  const handleOnChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleMultipleCharValue({ eventValue: e.target.value || '', inputPosition: index });
  };

  const handleOnInput = (index: number) => (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isValidInput((e.target as any).value)) {
      // If a user types on an input that already has a value and the new
      // value is the same as the old one, onChange will not fire so we
      // manually move focus to the next input
      focusInputAt(index + 1);
    }
  };

  const handleOnPaste = (index: number) => (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleMultipleCharValue({ eventValue: e.clipboardData.getData('text/plain') || '', inputPosition: index });
  };

  const handleOnKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Backspace':
        e.preventDefault();
        changeValueAt(index, '');
        focusInputAt(index - 1);
        return;
      case 'ArrowLeft':
        e.preventDefault();
        focusInputAt(index - 1);
        return;
      case 'ArrowRight':
        e.preventDefault();
        focusInputAt(index + 1);
        return;
      case ' ':
        e.preventDefault();
        return;
    }
  };

  // Handle hidden input changes (for password manager autofill)
  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, length);
    const newValues = value.split('').concat(Array.from({ length: length - value.length }, () => ''));
    setValues(newValues);

    // Focus the appropriate visible input
    if (value.length > 0) {
      focusInputAt(Math.min(value.length - 1, length - 1));
    }
  };

  const centerSx = centerAlign ? { justifyContent: 'center', alignItems: 'center' } : {};

  return (
    <Box
      elementDescriptor={descriptors.otpCodeFieldInputContainer}
      sx={{ position: 'relative' }}
    >
      {/* Hidden input for password manager compatibility */}
      <Input
        ref={hiddenInputRef}
        type='text'
        autoComplete='one-time-code'
        inputMode='numeric'
        pattern={`[0-9]{${length}}`}
        minLength={length}
        maxLength={length}
        spellCheck={false}
        name='otp'
        id='otp-input'
        data-otp-input
        data-otp-hidden-input
        data-testid='otp-input'
        role='textbox'
        aria-label='One-time password input for password managers'
        aria-describedby='otp-instructions'
        aria-hidden
        tabIndex={-1}
        onChange={handleHiddenInputChange}
        onFocus={() => {
          // When password manager focuses the hidden input, focus the first visible input
          focusInputAt(0);
        }}
        sx={() => ({
          // NOTE: Do not use the visuallyHidden() utility here, as it will break password manager autofill
          position: 'absolute',
          opacity: 0,
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
          // Ensure the input is still accessible to password managers
          // by not using display: none or visibility: hidden
          pointerEvents: 'none',
          // Position slightly within the container for better detection
          top: 0,
          left: 0,
        })}
      />

      {/* Hidden instructions for screen readers and password managers */}
      <span
        id='otp-instructions'
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          border: 0,
        }}
      >
        Enter the {length}-digit verification code
      </span>

      <Flex
        isLoading={isLoading}
        hasError={feedbackType === 'error'}
        elementDescriptor={descriptors.otpCodeFieldInputs}
        gap={2}
        sx={t => ({ direction: 'ltr', padding: t.space.$1, marginLeft: `calc(${t.space.$1} * -1)`, ...centerSx })}
        role='group'
        aria-label='Verification code input'
        aria-describedby='otp-instructions'
      >
        {values.map((value: string, index: number) => (
          <SingleCharInput
            elementDescriptor={descriptors.otpCodeFieldInput}
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            value={value}
            onClick={handleOnClick(index)}
            onChange={handleOnChange(index)}
            onKeyDown={handleOnKeyDown(index)}
            onInput={handleOnInput(index)}
            onPaste={handleOnPaste(index)}
            id={`digit-${index}-field`}
            ref={node => (refs.current[index] = node)}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={index === 0 || undefined}
            autoComplete='off'
            aria-label={`${index === 0 ? 'Enter verification code. ' : ''}Digit ${index + 1}`}
            isDisabled={isDisabled || isLoading || disabled || feedbackType === 'success'}
            hasError={feedbackType === 'error'}
            isSuccessfullyFilled={feedbackType === 'success'}
            type='text'
            inputMode='numeric'
            name={`codeInput-${index}`}
            data-otp-segment='true'
            data-1p-ignore='true'
            data-lpignore='true'
            maxLength={1}
            pattern='[0-9]'
          />
        ))}
      </Flex>
    </Box>
  );
});

const SingleCharInput = React.forwardRef<
  HTMLInputElement,
  PropsOfComponent<typeof Input> & { isSuccessfullyFilled?: boolean }
>((props, ref) => {
  const { isSuccessfullyFilled, ...rest } = props;
  return (
    <Input
      ref={ref}
      type='text'
      sx={theme => ({
        textAlign: 'center',
        ...common.textVariants(theme).h2,
        padding: `${theme.space.$0x5} 0`,
        boxSizing: 'border-box',
        height: theme.space.$10,
        width: theme.space.$10,
        borderRadius: theme.radii.$md,
        ...(isSuccessfullyFilled ? { borderColor: theme.colors.$success500 } : common.borderColor(theme, props)),
        backgroundColor: 'unset',
        '&:focus': {},
        [mqu.sm]: {
          height: theme.space.$8,
          width: theme.space.$8,
        },
      })}
      {...rest}
    />
  );
});

const isValidInput = (char: string) => char != undefined && Number.isInteger(+char);
