import React from 'react';

import { descriptors, Flex, Input, Spinner } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { common } from '../styledSystem';
import type { FormControlState } from '../utils';
import { FormFeedback } from './FormControl';

type UseCodeInputOptions = {
  length?: number;
};

type onCodeEntryFinishedCallback = (code: string) => unknown;
type onCodeEntryFinished = (cb: onCodeEntryFinishedCallback) => void;

type UseCodeControlReturn = ReturnType<typeof useCodeControl>;

export const useCodeControl = (formControl: FormControlState, options?: UseCodeInputOptions) => {
  const otpControlRef = React.useRef<any>();
  const userOnCodeEnteredCallback = React.useRef<onCodeEntryFinishedCallback>();
  const defaultValue = formControl.value;
  const { errorText, onChange } = formControl;
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

  const otpInputProps = { length, values, setValues, errorText, ref: otpControlRef };
  return { otpInputProps, onCodeEntryFinished, reset: () => otpControlRef.current?.reset() };
};

type CodeControlProps = UseCodeControlReturn['otpInputProps'] & {
  isDisabled?: boolean;
  errorText?: string;
  isSuccessfullyFilled?: boolean;
  isLoading?: boolean;
};

export const CodeControl = React.forwardRef<{ reset: any }, CodeControlProps>((props, ref) => {
  const [disabled, setDisabled] = React.useState(false);
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const firstClickRef = React.useRef(false);
  const { values, setValues, isDisabled, errorText, isSuccessfullyFilled, isLoading, length } = props;

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
    if (errorText) {
      setDisabled(true);
    }
  }, [errorText]);

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
      elementDescriptor={descriptors.otpCodeField}
      isLoading={isLoading}
      hasError={!!errorText}
      direction='col'
    >
      <Flex
        isLoading={isLoading}
        hasError={!!errorText}
        elementDescriptor={descriptors.otpCodeFieldInputs}
        gap={2}
        align='center'
      >
        {values.map((value, index) => (
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
            aria-label={`${index === 0 ? 'Enter verification code. ' : ''} ${'Digit'} ${index + 1}`}
            isDisabled={isDisabled || isLoading || disabled || isSuccessfullyFilled}
            hasError={!!errorText}
            isSuccessfullyFilled={isSuccessfullyFilled}
            type='text'
            inputMode='numeric'
            name={`codeInput-${index}`}
          />
        ))}
        {isLoading && (
          <Spinner
            colorScheme='neutral'
            sx={theme => ({ marginLeft: theme.space.$2 })}
          />
        )}
      </Flex>
      <FormFeedback
        errorText={errorText}
        elementDescriptors={{
          error: descriptors.otpCodeFieldErrorText,
        }}
      />
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
        ...common.textVariants(theme).xlargeMedium,
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
