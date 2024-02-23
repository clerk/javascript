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
  autoSubmit?: boolean;
};

type SelectionRange = readonly [start: number | null, end: number | null];
const ZERO: SelectionRange = [0, 0];
const OUTSIDE: SelectionRange = [-1, -1];

export const OTP_LENGTH_DEFAULT = 6;

/**
 * If the render prop is provided a custom, segmented input will be rendered. Otherwise, a standard input will be rendered.
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
    const { className: userProvidedClassName, render, length = OTP_LENGTH_DEFAULT, autoSubmit = false, ...rest } = props;

    const value = props.value as string
    const previousValue = usePrevious(value)

    const innerRef = React.useRef<HTMLInputElement>(null);
    // This ensures we can access innerRef internally while still exposing it via the ref prop
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

    const [selectionRange, setSelectionRange] = React.useState<SelectionRange>(props.autoFocus ? ZERO : OUTSIDE);
    const isFocused = useFocus(innerRef)

    React.useEffect(() => {
      const el = innerRef.current

      if (!el) return

      const _select = el.select.bind(el)
      el.select = () => {
        _select()

        // Proxy to update UI as native .select() does not trigger focus event
        setSelectionRange([0, el.value.length])
      }
    }, [])

    React.useEffect(() => {
      if (!isFocused) return

      const interval = setInterval(() => {
        if (innerRef.current && document.activeElement === innerRef.current) {
          setSelectionRange([innerRef.current.selectionStart, innerRef.current.selectionEnd]);
        }
      }, 50)

      return () => {
        clearInterval(interval)
      }
    }, [isFocused, selectionRange])

    // Fire the requestSubmit callback when the input has the required length and autoSubmit is enabled
    React.useEffect(() => {
      if (previousValue === undefined) return

      if (value !== previousValue && previousValue.length < length && value.length === length && autoSubmit) {
        innerRef.current?.form?.requestSubmit();
      }
    }, [previousValue, value, length, autoSubmit]);

    function _selectListener() {
      if (!innerRef.current) return

      const _start = innerRef.current.selectionStart
      const _end = innerRef.current.selectionEnd
      const isSelected = _start !== null && _end !== null

      if (value.length !== 0 && isSelected) {
        const isSingleCaret = _start === _end
        const isInsertMode = _start === value.length && value.length < length

        if (isSingleCaret && !isInsertMode) {
          const caretPos = _start

          let start = -1
          let end = -1

          if (caretPos === 0) {
            start = 0
            end = 1
          } else if (caretPos === value.length) {
            start = value.length - 1
            end = value.length
          } else {
            start = caretPos
            end = caretPos + 1
          }

          if (start !== -1 && end !== -1) {
            innerRef.current.setSelectionRange(start, end)
          }
        }
      }

      immediateTimeout(() => setSelectionRange([innerRef.current?.selectionStart ?? null, innerRef.current?.selectionEnd ?? null]))
    }

    return (
      <div
        data-otp-input-segmented-wrapper
        style={wrapperStyle}
      >
        {/* We can't target pseudo-elements with the style prop, so we inject a tag here */}
        <style>
          {`
        input[data-otp-input-segmented]::selection {
        color: transparent;
          background-color: transparent;
      }
        `}
        </style>
        <RadixControl
          ref={innerRef}
          {...rest}
          value={value}
          onSelect={e => {
            _selectListener()
            rest?.onSelect?.(e);
          }}
          onTouchEnd={e => {
            const isFocusing = document.activeElement === e.currentTarget
            if (isFocusing) {
              setTimeout(() => {
                _selectListener()
              }, 50)
            }
  
            rest?.onTouchEnd?.(e)
          }}
          onTouchMove={e => {
            const isFocusing = document.activeElement === e.currentTarget
            if (isFocusing) {
              setTimeout(() => {
                _selectListener()
              }, 50)
            }
  
            rest?.onTouchMove?.(e)
          }}
          onDoubleClick={e => {
            const isFocusing = document.activeElement === e.currentTarget

            if (isFocusing) {
              e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
              immediateTimeout(_selectListener)
            }

            rest?.onDoubleClick?.(e)
          }}
          onInput={e => {
            immediateTimeout(_selectListener)
  
            rest?.onInput?.(e)
          }}
          onKeyDown={e => {
            // _keyDownListener(e)
            immediateTimeout(_selectListener)
  
            rest?.onKeyDown?.(e)
          }}
          onKeyUp={e => {
            immediateTimeout(_selectListener)
  
            rest?.onKeyUp?.(e)
          }}
          onFocus={(e) => {
            if (innerRef.current) {
              const start = Math.min(innerRef.current.value.length, length - 1)
              const end = innerRef.current.value.length
              innerRef.current.setSelectionRange(start, end)
              setSelectionRange([start, end])
            }

            rest?.onFocus?.(e)
          }}
          style={inputStyle}
          data-otp-input-segmented
        />
        <div
          className={userProvidedClassName}
          aria-hidden
          style={renderStyle}
          data-otp-input-segmented-render
        >
          {Array.from({ length }).map((_, i) => {
            const value = String(props.value)[i] || ''
            const isCursor = isFocused && selectionRange[0] === selectionRange[1] && selectionRange[0] === i
            const isSelected = isFocused && (selectionRange[0] !== null && selectionRange[0] <= i) && (selectionRange[1] !== null && selectionRange[1] > i)

            return (
              <React.Fragment key={`otp-segment-${i}`}>
                {render({
                  value,
                  status:
                    isCursor
                      ? 'cursor'
                      : isSelected
                      ? 'selected'
                      : 'none',
                  index: i,
                })}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    );
  },
);

function immediateTimeout(cb: (...args: any[]) => unknown) {
  return setTimeout(cb, 0);
}

/**
 * Handle updating the input selection range to ensure a single character is selected when moving the cursor, or if the input value changes.
 */
function selectionRangeUpdater(cur: SelectionRange, inputRef: React.RefObject<HTMLInputElement>) {
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

function usePrevious<T>(value: T) {
  const ref = React.useRef<T>()
  React.useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const wrapperStyle = {
  position: 'relative',
  userSelect: 'none',
} as React.CSSProperties;

const renderStyle = {
  zIndex: 1,
  pointerEvents: 'none',
} as React.CSSProperties;

const inputStyle = {
  display: 'block',
  cursor: 'default',
  background: 'transparent',
  opacity: 1,
  outline: 'transparent solid 0px',
  appearance: 'none',
  color: 'transparent',
  position: 'absolute',
  inset: 0,
  width: 'calc(100% + 6ch)',
  height: '100%',
  caretColor: 'transparent',
  border: '0px solid transparent',
  font: 'inherit',
  letterSpacing: 'inherit',
  textIndent: 'inherit',
} satisfies React.CSSProperties;
