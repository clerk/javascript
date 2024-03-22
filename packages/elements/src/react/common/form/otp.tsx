import { Control as RadixControl } from '@radix-ui/react-form';
import * as React from 'react';

import type { FormControlProps } from '~/react/common/form';

export type OTPInputProps = Exclude<
  FormControlProps,
  'type' | 'autoComplete' | 'minLength' | 'maxLength' | 'inputMode' | 'pattern' | 'spellCheck'
> & {
  render?: (props: { value: string; status: OTPInputSegmentStatus; index: number }) => React.ReactNode;
  length?: number;
  autoSubmit?: boolean;
};

type SelectionRange = readonly [start: number, end: number];
const ZERO: SelectionRange = [0, 0];
const OUTSIDE: SelectionRange = [-1, -1];

export const OTP_LENGTH_DEFAULT = 6;

/**
 * The status of a single segment element in the OTP input
 */
export type OTPInputSegmentStatus = 'none' | 'cursor' | 'selected';

/**
 * If the render prop is provided, a custom segmented input will be rendered. Otherwise a standard input will be rendered.
 */
export const OTPInput = React.forwardRef<HTMLInputElement, OTPInputProps>(function OTPInput(props, ref) {
  const { render, length, autoSubmit, ...rest } = props;
  const hasRenderProp = typeof render !== 'undefined';

  if (hasRenderProp) {
    return (
      <OTPInputSegmented
        {...rest}
        ref={ref}
        render={render}
        length={length}
        autoSubmit={autoSubmit}
      />
    );
  }

  return (
    <OTPInputStandard
      {...rest}
      ref={ref}
      length={length}
      autoSubmit={autoSubmit}
    />
  );
});

/**
 * Standard `<input />` element that receives the same props as the OTPInput component except for the render prop.
 */
const OTPInputStandard = React.forwardRef<HTMLInputElement, Omit<OTPInputProps, 'render'>>(function OTPInput(
  props,
  ref,
) {
  const { length = OTP_LENGTH_DEFAULT, autoSubmit = false, ...rest } = props;

  const innerRef = React.useRef<HTMLInputElement>(null);
  // This ensures we can access innerRef internally while still exposing it via the ref prop
  React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

  // Fire the requestSubmit callback when the input has the required length and autoSubmit is enabled
  React.useEffect(() => {
    if (String(props.value).length === length && autoSubmit) {
      innerRef.current?.form?.requestSubmit();
    }
  }, [props.value, length, autoSubmit]);

  return (
    <RadixControl
      ref={innerRef}
      {...rest}
      data-input-otp-standard
    />
  );
});

/**
 * A custom input component to handle accepting OTP codes. An invisible input element is used to capture input and handle native input
 * interactions, while the provided render prop is used to visually render the input's contents.
 */
const OTPInputSegmented = React.forwardRef<HTMLInputElement, Required<Pick<OTPInputProps, 'render'>> & OTPInputProps>(
  function OTPInput(props, ref) {
    const { className, render, length = OTP_LENGTH_DEFAULT, autoSubmit = false, ...rest } = props;

    const innerRef = React.useRef<HTMLInputElement>(null);
    const [selectionRange, setSelectionRange] = React.useState<SelectionRange>(props.autoFocus ? ZERO : OUTSIDE);

    // This ensures we can access innerRef internally while still exposing it via the ref prop
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

    // A layout effect is used here to avoid any perceived visual lag when changing the selection
    React.useLayoutEffect(() => {
      if (document.activeElement !== innerRef.current) {
        return;
      }
      setSelectionRange(cur => selectionRangeUpdater(cur, innerRef));
    }, [props.value]);

    // Fire the requestSubmit callback when the input has the required length and autoSubmit is enabled
    React.useEffect(() => {
      if (String(props.value).length === length && autoSubmit) {
        innerRef.current?.form?.requestSubmit();
      }
    }, [props.value, length, autoSubmit]);

    return (
      <div
        data-otp-input-wrapper
        style={wrapperStyle}
      >
        {/* We can't target pseudo-elements with the style prop, so we inject a tag here */}
        <style>{`
      input[data-otp-input]::selection {
        color: transparent;
        background-color: none;
      }
      `}</style>
        <RadixControl
          ref={innerRef}
          {...rest}
          onBlur={event => {
            setSelectionRange([-1, -1]);
            rest?.onBlur?.(event);
          }}
          onSelect={event => {
            setSelectionRange(cur => selectionRangeUpdater(cur, innerRef));
            rest?.onSelect?.(event);
          }}
          style={inputStyle}
        />
        <div
          className={className}
          aria-hidden
          style={segmentWrapperStyle}
        >
          {Array.from({ length }).map((_, i) => {
            return (
              <React.Fragment key={`otp-segment-${i}`}>
                {render({
                  value: String(props.value)[i] || '',
                  status:
                    selectionRange[0] === selectionRange[1] && selectionRange[0] === i
                      ? 'cursor'
                      : selectionRange[0] <= i && selectionRange[1] > i
                      ? 'selected'
                      : 'none',
                  index: i,
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  },
);

/**
 * Handle updating the input selection range to ensure a single character is selected when moving the cursor, or if the input value changes.
 */
function selectionRangeUpdater(cur: SelectionRange, inputRef: React.RefObject<HTMLInputElement>) {
  let updated: [number, number, HTMLInputElement['selectionDirection']] = [
    inputRef.current?.selectionStart ?? 0,
    inputRef.current?.selectionEnd ?? 0,
    inputRef.current?.selectionDirection ?? null,
  ];

  // Abort unnecessary updates
  if (cur[0] === updated[0] && cur[1] === updated[1]) {
    return cur;
  }

  // ensures that forward selection works properly when landing on the first character
  if (updated[0] === 0 && updated[1] === 1) {
    updated[2] = 'forward';
  }

  // When moving the selection, we want to select either the previous or next character instead of only moving the cursor.
  // If the start and end indices are the same, it means only the cursor has moved and we need to make a decision on which character to select.
  if (updated[0] === updated[1]) {
    if (updated[0] > 0 && cur[0] === updated[0] && cur[1] === updated[0] + 1) {
      updated = [updated[0] - 1, updated[1], 'backward'];
    } else if (typeof inputRef.current?.value[updated[0]] !== 'undefined') {
      updated = [updated[0], updated[1] + 1, 'forward'];
    } else if (updated[0] >= OTP_LENGTH_DEFAULT) {
      updated = [updated[0] - 1, updated[1], 'backward'];
    }
  }

  inputRef.current?.setSelectionRange(updated[0], updated[1], updated[2] ?? undefined);

  return [updated[0], updated[1]] satisfies SelectionRange;
}

const wrapperStyle = {
  position: 'relative',
} satisfies React.CSSProperties;

const inputStyle = {
  display: 'block',
  background: 'none',
  outline: 'none',
  appearance: 'none',
  color: 'transparent',
  position: 'absolute',
  inset: 0,
} satisfies React.CSSProperties;

const segmentWrapperStyle = {
  zIndex: 1,
  pointerEvents: 'none',
} satisfies React.CSSProperties;
