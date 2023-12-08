import { createContextAndHook } from '@clerk/shared/react';
import type { PropsWithChildren } from 'react';
import React, { useCallback } from 'react';

import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, Input, Spinner, Text } from '../customizables';
import { useCardState } from '../elements/contexts';
import { useLoadingStatus } from '../hooks';
import type { PropsOfComponent } from '../styledSystem';
import { common } from '../styledSystem';
import type { FormControlState } from '../utils';
import { handleError, sleep, useFormControl } from '../utils';
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
    codeControlState.setError(undefined);
    paramsOnCodeEntryFinished(code, resolve, reject);
  });

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
  label: string | LocalizationKey;
  description: string | LocalizationKey;
  resendButton?: LocalizationKey;
  isLoading: boolean;
  isDisabled?: boolean;
  onResendCode?: React.MouseEventHandler<HTMLButtonElement>;
  otpControl: ReturnType<typeof useFieldOTP>['otpControl'];
};

const [OTPInputContext, useOTPInputContext] = createContextAndHook<OTPInputProps>('OTPInputContext');

export const OTPRoot = ({ children, ...props }: PropsWithChildren<OTPInputProps>) => {
  return <OTPInputContext.Provider value={{ value: props }}>{children}</OTPInputContext.Provider>;
};

export const OTPInputLabel = () => {
  const { label } = useOTPInputContext();
  return (
    <Text
      localizationKey={label}
      elementDescriptor={descriptors.formHeaderTitle}
      variant='subtitle'
    />
  );
};

export const OTPInputDescription = () => {
  const { description } = useOTPInputContext();
  return (
    <Text
      localizationKey={description}
      elementDescriptor={descriptors.formHeaderSubtitle}
      colorScheme='neutral'
    />
  );
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
      sx={theme => ({ marginTop: theme.space.$6 })}
      localizationKey={resendButton}
    />
  );
};

export const OTPCodeControl = React.forwardRef<{ reset: any }>((_, ref) => {
  const [disabled, setDisabled] = React.useState(false);
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const firstClickRef = React.useRef(false);

  const { otpControl, isLoading, isDisabled } = useOTPInputContext();
  const { feedback, values, setValues, feedbackType, length } = otpControl.otpInputProps;

  React.useImperativeHandle(ref, () => ({
    reset: () => {
      setValues(values.map(() => ''));
      setDisabled(false);
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
      values[clampedIndex] && ref.select();
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

  return (
    <Flex
      isLoading={isLoading}
      hasError={feedbackType === 'error'}
      elementDescriptor={descriptors.otpCodeFieldInputs}
      gap={2}
      align='center'
      sx={{ direction: 'ltr', width: 'max-content' }}
    >
      {values.map((value, index: number) => (
        <SingleCharInput
          elementDescriptor={descriptors.otpCodeFieldInput}
          key={index}
          value={value}
          onClick={handleOnClick(index)}
          onChange={handleOnChange(index)}
          onKeyDown={handleOnKeyDown(index)}
          onInput={handleOnInput(index)}
          onPaste={handleOnPaste(index)}
          ref={node => (refs.current[index] = node)}
          autoFocus={index === 0 || undefined}
          autoComplete='one-time-code'
          aria-label={`${index === 0 ? 'Enter verification code. ' : ''} Digit ${index + 1}`}
          isDisabled={isDisabled || isLoading || disabled || feedbackType === 'success'}
          hasError={feedbackType === 'error'}
          isSuccessfullyFilled={feedbackType === 'success'}
          type='text'
          inputMode='numeric'
          name={`codeInput-${index}`}
        />
      ))}
      {isLoading && (
        <Spinner
          colorScheme='neutral'
          sx={theme => ({ marginLeft: theme.space.$2 })}
          elementDescriptor={descriptors.spinner}
        />
      )}
    </Flex>
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
        boxSizing: 'content-box',
        minWidth: '1ch',
        maxWidth: theme.sizes.$7,
        borderRadius: theme.radii.$none,
        border: 'none',
        borderBottom: theme.borders.$heavy,
        ...(isSuccessfullyFilled ? { borderColor: theme.colors.$success500 } : common.borderColor(theme, props)),
        backgroundColor: 'unset',
        '&:focus': {
          boxShadow: 'none',
          borderColor: theme.colors.$primary500,
        },
      })}
      {...rest}
    />
  );
});

const isValidInput = (char: string) => char != undefined && Number.isInteger(+char);
