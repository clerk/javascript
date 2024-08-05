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
  passwordManagerOffset?: number;
};

type SelectionRange = readonly [start: number | null, end: number | null];
const ZERO: SelectionRange = [0, 0];
const OUTSIDE: SelectionRange = [-1, -1];

export const OTP_LENGTH_DEFAULT = 6;
const PASSWORD_MANAGER_OFFSET_DEFAULT = 40;

/**
 * The status of a single segment element in the OTP input
 */
export type OTPInputSegmentStatus = 'none' | 'cursor' | 'selected' | 'hovered';

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
const OTPInputStandard = React.forwardRef<HTMLInputElement, Omit<OTPInputProps, 'render'>>(
  function OTPInput(props, ref) {
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
        data-otp-input-standard
      />
    );
  },
);

/**
 * A custom input component to handle accepting OTP codes. An invisible input element is used to capture input and handle native input
 * interactions, while the provided render prop is used to visually render the input's contents.
 */
const OTPInputSegmented = React.forwardRef<HTMLInputElement, Required<Pick<OTPInputProps, 'render'>> & OTPInputProps>(
  function OTPInput(props, ref) {
    const {
      className: userProvidedClassName,
      render,
      length = OTP_LENGTH_DEFAULT,
      autoSubmit = false,
      passwordManagerOffset = PASSWORD_MANAGER_OFFSET_DEFAULT,
      ...rest
    } = props;

    const innerRef = React.useRef<HTMLInputElement>(null);
    const [selectionRange, setSelectionRange] = React.useState<SelectionRange>(props.autoFocus ? ZERO : OUTSIDE);
    const [isHovering, setIsHovering] = React.useState(false);

    const isFocused = () => document.activeElement === innerRef.current;

    // This ensures we can access innerRef internally while still exposing it via the ref prop
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

    /**
     * A layout effect is used here to avoid any perceived visual lag when changing the selection
     * This effect ensures that when deleting characters from the input the selection is updated
     */
    React.useLayoutEffect(() => {
      if (document.activeElement !== innerRef.current) {
        return;
      }
      setSelectionRange(cur => selectionRangeUpdater(cur, innerRef));
    }, [props.value]);

    /**
     * Attach a selectionchange handler on the document during the capture phase to the selection range is updated
     * immediately.
     *
     * One concrete example, if using onSelect on the input, the handler wouldn't fire when pressing cmd + left/right arrow.
     */
    React.useEffect(() => {
      function onSelectionChange() {
        if (!isFocused()) {
          return;
        }
        setSelectionRange(cur => selectionRangeUpdater(cur, innerRef));
      }

      document.addEventListener('selectionchange', onSelectionChange, { capture: true });
      return () => document.removeEventListener('selectionchange', onSelectionChange);
    }, []);

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
      input[data-otp-input-segmented]::selection {
        color: transparent;
        background-color: transparent;
      }
      `}</style>
        <RadixControl
          data-otp-input-segmented
          ref={innerRef}
          {...rest}
          onFocus={event => {
            // Place the caret at the end of the current value
            if (innerRef.current) {
              const start = Math.min(innerRef.current.value.length, length - 1);
              const end = innerRef.current.value.length;
              innerRef.current.setSelectionRange(start, end);
              setSelectionRange([start, end]);
            }
            rest?.onFocus?.(event);
          }}
          onBlur={event => {
            setSelectionRange([-1, -1]);
            rest?.onBlur?.(event);
          }}
          onMouseOver={event => {
            if (!isFocused()) {
              setIsHovering(true);
            }
            props.onMouseOver?.(event);
          }}
          onMouseLeave={event => {
            setIsHovering(false);
            props.onMouseLeave?.(event);
          }}
          style={{
            ...inputStyle,
            clipPath: `inset(0 calc(1ch + ${passwordManagerOffset}px) 0 0)`,
            width: `calc(100% + 1ch + ${passwordManagerOffset}px)`,
          }}
        />
        <div
          className={userProvidedClassName}
          aria-hidden
          style={segmentWrapperStyle}
        >
          {Array.from({ length }).map((_, i) => {
            const isHovered = isHovering && !isFocused();
            const isCursor = selectionRange[0] === selectionRange[1] && selectionRange[0] === i;
            const isSelected = (selectionRange[0] ?? -1) <= i && (selectionRange[1] ?? -1) > i;

            return (
              <React.Fragment key={`otp-segment-${i}`}>
                {render({
                  value: String(props.value)[i] || '',
                  status: isHovered ? 'hovered' : isCursor ? 'cursor' : isSelected ? 'selected' : 'none',
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
      updated = [updated[0], updated[1] + 1, 'backward'];
    } else if (updated[0] >= OTP_LENGTH_DEFAULT) {
      updated = [updated[0] - 1, updated[1], 'backward'];
    }
  }

  inputRef.current?.setSelectionRange(updated[0], updated[1], updated[2] ?? undefined);

  return [updated[0], updated[1]] satisfies SelectionRange;
}

const wrapperStyle = {
  position: 'relative',
  userSelect: 'none',
} satisfies React.CSSProperties;

const inputStyle = {
  display: 'block',
  background: 'transparent',
  opacity: 0,
  outline: 'transparent solid 0px',
  appearance: 'none',
  color: 'transparent',
  position: 'absolute',
  inset: 0,
  caretColor: 'transparent',
  border: '0px solid transparent',
  // width is handled inline
  height: '100%',
  letterSpacing: '-1rem',
} satisfies React.CSSProperties;

const segmentWrapperStyle = {
  zIndex: 1,
  pointerEvents: 'none',
} satisfies React.CSSProperties;
