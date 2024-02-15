import { Control as RadixControl } from '@radix-ui/react-form';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import type { FormControlProps } from '~/react/common/form';

export type OTPInputProps = Exclude<
  FormControlProps,
  'type' | 'autoComplete' | 'maxLength' | 'inputMode' | 'pattern'
> & {
  render?: (props: { value: string; status: 'cursor' | 'selected' | 'none'; index: number }) => React.ReactNode;
};

export const OTPInput = React.forwardRef<HTMLInputElement, OTPInputProps>(function OTPInput(props, ref) {
  const treatAsSegmented = typeof props.render !== 'undefined';

  if (treatAsSegmented) {
    return (
      // @ts-expect-error -- treatAsSegment guard above ensures props.render is defined
      <OTPInputSegmented
        {...props}
        ref={ref}
      />
    );
  }

  return (
    <RadixControl
      {...props}
      ref={ref}
    />
  );
});

/**
 * A custom input component to handle accepting OTP codes. An invisible input element is used to capture input and handle native input
 * interactions, while the provided render prop is used to visually render the input's contents.
 */
const OTPInputSegmented = React.forwardRef<HTMLInputElement, Required<Pick<OTPInputProps, 'render'>> & OTPInputProps>(
  function OTPInput(props, ref) {
    const { className, render, maxLength = 6, ...rest } = props;

    const innerRef = React.useRef<HTMLInputElement>(null);
    const [selectionRange, setSelectionRange] = React.useState<[number, number]>(props.autoFocus ? [0, 0] : [-1, -1]);

    // This ensures we can access innerRef internally while still exposing it via the ref prop
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

    // A layout effect is used here to avoid any perceived visual lag when changing the selection
    React.useLayoutEffect(() => {
      if (document.activeElement !== innerRef.current) {
        return;
      }
      setSelectionRange(cur => selectionRangeUpdater(cur, innerRef));
    }, [props.value]);

    return (
      <div
        style={
          {
            position: 'relative',
          } as React.CSSProperties
        }
      >
        {/* We can't target pseud-elements with the style prop, so we inject a tag here */}
        <style>{`
      input[data-otp-input]::selection {
        color: transparent;
        background-color: none;
      }
      `}</style>
        <RadixControl
          ref={innerRef}
          {...rest}
          maxLength={maxLength}
          onBlur={event => {
            setSelectionRange([-1, -1]);
            rest?.onBlur?.(event);
          }}
          onSelect={event => {
            setSelectionRange(cur => selectionRangeUpdater(cur, innerRef));
            rest?.onSelect?.(event);
          }}
          style={{
            display: 'block',
            cursor: 'default',
            background: 'none',
            outline: 'none',
            appearance: 'none',
            color: 'transparent',
            position: 'absolute',
            inset: 0,
          }}
        />
        <div
          className={className}
          aria-hidden
          style={{
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: maxLength }).map((_, i) => (
            <Slot key={i}>
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
            </Slot>
          ))}
        </div>
      </div>
    );
  },
);

/**
 * Handle updating the input selection range to ensure a single character is selected when moving the cursor, or if the input value changes.
 */
function selectionRangeUpdater(cur: [number, number], inputRef: React.RefObject<HTMLInputElement>) {
  let direction: 'forward' | 'backward' = 'forward' as const;
  let updated: [number, number] = [inputRef.current?.selectionStart ?? 0, inputRef.current?.selectionEnd ?? 0];

  // Abort unnecessary updates
  if (cur[0] === updated[0] && cur[1] === updated[1]) {
    return cur;
  }

  // When moving the selection, we want to select either the previous or next character instead of only moving the cursor.
  // If the start and end indices are the same, it means only the cursor has moved and we need to make a decision on which character to select.
  if (updated[0] === updated[1]) {
    if (updated[0] > 0 && cur[0] === updated[0] && cur[1] === updated[0] + 1) {
      direction = 'backward' as const;
      updated = [updated[0] - 1, updated[1]];
    } else if (typeof inputRef.current?.value[updated[0]] !== 'undefined') {
      updated = [updated[0], updated[1] + 1];
    }
  }

  inputRef.current?.setSelectionRange(updated[0], updated[1], direction);

  return updated;
}
