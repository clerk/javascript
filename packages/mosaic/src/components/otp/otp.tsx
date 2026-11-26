'use client';

import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { OtpProps as PrimitiveOtpProps } from '../../primitives/otp';
import { Otp as Primitive } from '../../primitives/otp';
import { autoUpdate } from '../../primitives/utils/dom';
import type { MosaicStyleProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { inputStyles } from '../../styles/input.styles';
import { reset } from '../../styles/reset.styles';
import { CODE_LENGTH } from '../../utils/verification';
import { useCardAlign } from '../card';
import { useOptionalFieldControlProps } from '../field/field.context';
import { styles } from './otp.styles';

/** How the entered code currently reads back to the user. */
export type OtpStatus = 'neutral' | 'success' | 'error';

export interface OtpProps
  extends Omit<PrimitiveOtpProps, 'children' | 'length' | 'className' | 'style' | 'ref'>, MosaicStyleProps {
  /** The number of boxes in the code. @default 6 */
  length?: number;
  /** Colours every slot for the verification outcome. Defaults to the enclosing `Field`'s validity. */
  status?: OtpStatus;
}

const RAPID_ENTRY_MS = 150;

function useSlotElements() {
  const elements = React.useRef<Array<HTMLInputElement | null>>([]);
  const refFor = React.useCallback(
    (index: number) => (element: HTMLInputElement | null) => {
      elements.current[index] = element;
    },
    [],
  );
  return { elements, refFor };
}

function OtpSlots({
  status: reportedStatus,
  firstSlotRef,
}: {
  status: OtpStatus;
  firstSlotRef: React.ForwardedRef<HTMLInputElement>;
}) {
  const { slots, disabled, activeIndex } = Primitive.useOtp();
  const status = reportedStatus === 'error' && !slots.every(slot => slot.isFilled) ? 'neutral' : reportedStatus;
  const { elements, refFor } = useSlotElements();
  const firstRef = useMergeRefs([firstSlotRef, refFor(0)]);
  const ringRef = React.useRef<HTMLSpanElement>(null);
  const lastMove = React.useRef<{ index: number | null; at: number }>({ index: null, at: 0 });
  React.useLayoutEffect(() => {
    const ring = ringRef.current;
    const slot = activeIndex === null ? null : elements.current[activeIndex];
    if (!ring || activeIndex === null || !slot) {
      lastMove.current = { index: null, at: 0 };
      return;
    }
    const now = performance.now();
    const previous = lastMove.current;
    const snap =
      previous.index === null || Math.abs(activeIndex - previous.index) > 1 || now - previous.at < RAPID_ENTRY_MS;
    ring.toggleAttribute('data-snap', snap);
    const place = () => {
      ring.style.setProperty('--_cl-otp-ring-x', `${slot.offsetLeft}px`);
      ring.style.setProperty('--_cl-otp-ring-width', `${slot.offsetWidth}px`);
      ring.style.setProperty('--_cl-otp-ring-height', `${slot.offsetHeight}px`);
    };
    lastMove.current = { index: activeIndex, at: now };
    return autoUpdate(slot, place);
  }, [activeIndex, elements]);

  return (
    <>
      {slots.map(slot => (
        <Primitive.Input
          key={slot.index}
          index={slot.index}
          ref={slot.index === 0 ? firstRef : refFor(slot.index)}
          aria-invalid={reportedStatus === 'error' ? true : undefined}
          {...mergeStyleProps(
            themeProps('otp-slot', { status, disabled }),
            stylex.props(
              reset.base,
              inputStyles.base,
              styles.slot,
              styles.touchTarget,
              styles.ringed,
              slot.isFilled && styles.filled,
              status === 'success' && styles.success,
              disabled && inputStyles.disabled,
            ),
          )}
        />
      ))}
      <span
        ref={ringRef}
        aria-hidden
        data-status={status}
        data-visible={activeIndex !== null && status !== 'success' && !disabled ? '' : undefined}
        {...stylex.props(reset.base, styles.ring)}
      />
    </>
  );
}

/**
 * A fixed-length verification code field: one styled box per character, with focus
 * advancing as the code is typed and a pasted code spread across the boxes. The ref
 * points at the first slot, the input a label targets and where focus lands.
 */
export const Otp = React.forwardRef<HTMLInputElement, OtpProps>(function MosaicOtp(
  {
    length = CODE_LENGTH,
    status: statusProp,
    disabled: disabledProp,
    required: requiredProp,
    id,
    'aria-invalid': ariaInvalidProp,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    xstyle,
    ...rest
  },
  ref,
) {
  const fieldProps = useOptionalFieldControlProps({
    id,
    disabled: disabledProp,
    required: requiredProp,
    ariaInvalid: ariaInvalidProp,
    ariaLabelledBy,
    ariaDescribedBy,
  });
  const disabled = fieldProps?.disabled ?? disabledProp ?? false;
  const required = fieldProps?.required ?? requiredProp;
  const ariaInvalid = fieldProps?.['aria-invalid'] ?? ariaInvalidProp;
  const status = statusProp ?? (ariaInvalid === true || ariaInvalid === 'true' ? 'error' : 'neutral');
  const centered = useCardAlign() === 'center';

  return (
    <Primitive.Root
      {...rest}
      length={length}
      disabled={disabled}
      focusableWhenDisabled={fieldProps?.focusableWhenDisabled}
      required={required}
      id={fieldProps?.id ?? id}
      {...mergeStyleProps(
        themeProps('otp', { status, disabled }),
        stylex.props(
          reset.base,
          styles.root,
          centered && styles.rowCentered,
          status === 'error' && styles.rejected,
          xstyle,
        ),
      )}
      aria-labelledby={fieldProps?.['aria-labelledby'] ?? ariaLabelledBy}
      aria-describedby={fieldProps?.['aria-describedby'] ?? ariaDescribedBy}
    >
      <OtpSlots
        status={status}
        firstSlotRef={ref}
      />
    </Primitive.Root>
  );
});
