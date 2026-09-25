import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { OtpProps as PrimitiveOtpProps } from '../../primitives/otp';
import { Otp as Primitive } from '../../primitives/otp';
import type { MosaicStyleProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { inputStyles } from '../../utils/input.styles';
import { reset } from '../../utils/reset.styles';
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

function OtpSlots({ status, firstSlotRef }: { status: OtpStatus; firstSlotRef: React.ForwardedRef<HTMLInputElement> }) {
  const { slots, disabled } = Primitive.useOtp();

  return slots.map(slot => (
    <Primitive.Input
      key={slot.index}
      index={slot.index}
      ref={slot.index === 0 ? firstSlotRef : undefined}
      aria-invalid={status === 'error' ? true : undefined}
      {...mergeStyleProps(
        themeProps('otp-slot', { status, disabled }),
        stylex.props(
          reset.base,
          inputStyles.base,
          styles.slot,
          styles.touchTarget,
          status === 'success' && styles.success,
          disabled && inputStyles.disabled,
        ),
      )}
    />
  ));
}

/**
 * A fixed-length verification code field: one styled box per character, with focus
 * advancing as the code is typed and a pasted code spread across the boxes. The ref
 * points at the first slot, the input a label targets and where focus lands.
 */
export const Otp = React.forwardRef<HTMLInputElement, OtpProps>(function MosaicOtp(
  {
    length = 6,
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

  return (
    <Primitive.Root
      {...rest}
      length={length}
      disabled={disabled}
      required={required}
      id={fieldProps?.id ?? id}
      {...mergeStyleProps(themeProps('otp', { status, disabled }), stylex.props(reset.base, styles.root, xstyle))}
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
