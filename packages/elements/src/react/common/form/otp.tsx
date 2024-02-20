import { Control as RadixControl } from '@radix-ui/react-form';
import * as React from 'react';

import type { FormControlProps } from '~/react/common/form';
import { useFocus } from '~/react/hooks';

export type OTPInputProps = Exclude<
  FormControlProps,
  'type' | 'autoComplete' | 'minLength' | 'maxLength' | 'inputMode' | 'pattern' | 'spellCheck'
> & {
  render?: (props: { value: string; status: 'cursor' | 'selected' | 'none'; index: number }) => React.ReactNode;
  length?: number;
};

type SelectionState = readonly [start: number, end: number]

type TransformInput = {
  current: Readonly<SelectionState>
  previous: Readonly<SelectionState>
  value: string
  direction: 'forward' | 'backward' | 'none' | null
}

type Transform = (input: TransformInput) => [start: number, end: number] | null

export const OTP_LENGTH_DEFAULT = 6;
const ZERO: SelectionState = [0, 0]
const OUTSIDE: SelectionState = [-1, -1]

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
    const { className, render, length = OTP_LENGTH_DEFAULT, ...rest } = props;
    const DEFAULT_SELECTION: SelectionState = props?.autoFocus ? ZERO : OUTSIDE
    
    const innerRef = React.useRef<HTMLInputElement>(null);
    const [selection, setSelection] = React.useState<SelectionState>(DEFAULT_SELECTION)

    // This ensures we can access innerRef internally while still exposing it via the ref prop
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

    React.useLayoutEffect(() => {
      if (document.activeElement !== innerRef.current) {
        return
      }

      setSelection((current) => selectionHandler(current, innerRef))
    }, [props.value])

    const focused = useFocus(innerRef)

    console.log({ focused, value: props.value, selection })

    return (
      <div
        style={
          {
            position: 'relative',
          } as React.CSSProperties
        }
      >
        {/* We can't target pseudo-elements with the style prop, so we inject a tag here */}
        <style>{`
          input[data-otp-input]::selection {
            color: transparent;
            background-color: none;
          }
        `}
        </style>
        <RadixControl
          ref={innerRef}
          {...rest}
          onMouseDownCapture={event => {
            if (event.button !== 0 || event.ctrlKey) return;
            if (event.shiftKey || event.metaKey) return;
            if (!(event.currentTarget instanceof HTMLElement)) return;
            if (!(innerRef.current instanceof HTMLInputElement)) return;
            event.stopPropagation();
            event.preventDefault();

            const { left, width } = event.currentTarget.getBoundingClientRect();
            const eventX = event.clientX - left;
            const index = Math.floor((eventX / width) * length);

            if (document.activeElement !== innerRef.current) {
              innerRef.current?.focus();
            }

            innerRef.current?.setSelectionRange(index, index + 1)
          }}
          style={{
            font: 'inherit',
            letterSpacing: 'inherit',
            background: 'transparent',
            appearance: 'none',
            display: 'block',
            cursor: 'default',
            outline: 'none',
            color: 'transparent',
            position: 'absolute',
            inset: 0,
            border: '0 solid transparent',
          }}
        />
        <div
          className={className}
          aria-hidden
          style={{
            zIndex: -1,
          }}
        >
          {Array.from({ length }).map((_, i) => (
            <React.Fragment key={i}>
              {render({
                value: String(props.value)[i] || '',
                status: 'none',
                index: i,
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
);

const selectionHandler = (current: SelectionState, inputRef: React.RefObject<HTMLInputElement>) => {
  console.log({ current, inputRef })
  return current
}

const transform: Transform = ({ current, previous, value }) => {
  if (current[0] !== current[1]) return null
  if (typeof current[0] !== 'number') return null
  if (typeof current[1] !== 'number') return null

  const [start, end] = current

  if (start > 0 && previous[0] === start && previous[1] === start + 1) {
    return [start - 1, end]
  }

  if (value[start]?.length) {
    return [start, end + 1]
  }

  return null
}

const getSelectionState = (input: HTMLInputElement): SelectionState => {
  return [+input.selectionStart!, +input.selectionEnd!]
}

const eq = (a: SelectionState, b: SelectionState): boolean => {
  return a[0] === b[0] && a[1] === b[1]
}
