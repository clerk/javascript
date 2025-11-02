import { createContextAndHook } from '@clerk/shared/react';
import type { SlotProps } from 'input-otp';
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp';
import type { PropsWithChildren } from 'react';
import React, { useCallback } from 'react';

import type { LocalizationKey } from '../customizables';
import { Box, descriptors, Flex, OTPInputSegment } from '../customizables';
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

  const reset = React.useCallback(() => {
    setValues(Array.from({ length }, () => ''));
  }, [length]);

  React.useEffect(() => {
    const len = values.filter(c => c).length;
    if (len === length) {
      const code = values.map(c => c || ' ').join('');
      userOnCodeEnteredCallback.current?.(code);
    } else {
      const code = values.join('');
      onChange?.({ target: { value: code } } as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.toString()]);

  const otpInputProps = { length, values, setValues, feedback, feedbackType, clearFeedback };
  return { otpInputProps, onCodeEntryFinished, reset };
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

export const OTPCodeControl = () => {
  const [disabled, setDisabled] = React.useState(false);
  const { otpControl, isLoading, isDisabled } = useOTPInputContext();
  const { feedback, values, setValues, feedbackType, length } = otpControl.otpInputProps;

  React.useEffect(() => {
    if (feedback) {
      setDisabled(true);
    }
  }, [feedback]);

  return (
    <Box
      elementDescriptor={descriptors.otpCodeFieldInputContainer}
      sx={{ position: 'relative' }}
    >
      <OTPInput
        autoFocus // eslint-disable-line jsx-a11y/no-autofocus
        aria-label='Enter verification code'
        aria-required
        maxLength={length}
        inputMode='numeric'
        pattern={REGEXP_ONLY_DIGITS}
        textAlign='center'
        value={values.join('')}
        onChange={newValue => {
          setValues(newValue.split(''));
        }}
        render={({ slots }) => (
          <Flex
            align='center'
            elementDescriptor={descriptors.otpCodeFieldInputs}
            gap={2}
            hasError={feedbackType === 'error'}
            isLoading={isLoading}
            role='group'
          >
            {slots.map((slot, index: number) => (
              <Slot
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                elementDescriptor={descriptors.otpCodeFieldInput}
                isDisabled={isDisabled || isLoading || disabled || feedbackType === 'success'}
                hasError={feedbackType === 'error'}
                isSuccessfullyFilled={feedbackType === 'success'}
                {...slot}
              />
            ))}
          </Flex>
        )}
      />
    </Box>
  );
};

function Slot(props: SlotProps & PropsOfComponent<typeof OTPInputSegment> & { isSuccessfullyFilled?: boolean }) {
  const { isSuccessfullyFilled, ...otpProps } = props;
  const { char, hasFakeCaret, isActive, placeholderChar, ...rest } = otpProps;
  return (
    <OTPInputSegment
      data-testid='otp-input-segment'
      {...rest}
      focusRing={isActive}
      variant='default'
      sx={t => ({
        textAlign: 'center',
        ...common.textVariants(t).h2,
        padding: `${t.space.$0x5} 0`,
        boxSizing: 'border-box',
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        height: t.space.$10,
        width: t.space.$10,
        color: t.colors.$colorInputForeground,
        borderWidth: t.borderWidths.$normal,
        borderRadius: t.radii.$md,
        ...(isSuccessfullyFilled ? { borderColor: t.colors.$success500 } : common.borderColor(t, props)),
        backgroundColor: 'unset',
        [mqu.sm]: {
          height: t.space.$8,
          width: t.space.$8,
        },
      })}
    >
      {char !== null && <div>{char}</div>}
      {hasFakeCaret && <FakeCaret />}
    </OTPInputSegment>
  );
}

function FakeCaret() {
  return (
    <>
      <style>{`
        @keyframes caret-blink-animation {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }
      `}</style>
      <Flex
        align='center'
        justify='center'
        sx={() => ({
          animation: 'caret-blink-animation 1s infinite',
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
        })}
      >
        <Box
          sx={t => ({
            height: t.space.$4,
            width: t.space.$px,
            backgroundColor: t.colors.$colorInputForeground,
          })}
        />
      </Flex>
    </>
  );
}
