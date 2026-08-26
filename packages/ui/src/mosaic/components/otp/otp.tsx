import type { OtpProps as PrimitiveOtpProps } from '@clerk/headless/otp';
import { Otp as Primitive } from '@clerk/headless/otp';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { inputStyles } from '../../utils/input.styles';
import { reset } from '../../utils/reset.styles';
import { useOptionalFieldControlProps } from '../field/field.context';
import { rootSizes, slotSizes, styles } from './otp.styles';

/** How the entered code currently reads back to the user. */
export type OtpStatus = 'neutral' | 'success' | 'error';

export type OtpSize = 'sm' | 'md' | 'lg';

export interface OtpProps extends Omit<PrimitiveOtpProps, 'children'> {
  size?: OtpSize;
  /** Colours every slot for the verification outcome. Defaults to the enclosing `Field`'s validity. */
  status?: OtpStatus;
}

function OtpSlots({ size, status }: { size: OtpSize; status: OtpStatus }) {
  const { slots, disabled } = Primitive.useOtp();

  return slots.map(slot => (
    <Primitive.Input
      key={slot.index}
      index={slot.index}
      aria-invalid={status === 'error' ? true : undefined}
      {...mergeStyleProps(
        themeProps('otp-slot', { size, status, disabled }),
        stylex.props(
          reset.base,
          inputStyles.base,
          styles.slot,
          styles.touchTarget,
          slotSizes[size],
          status === 'success' && styles.success,
          disabled && inputStyles.disabled,
        ),
      )}
    />
  ));
}

/**
 * A fixed-length verification code field: one styled box per character, with focus
 * advancing as the code is typed and a pasted code spread across the boxes.
 */
export function Otp({
  size = 'md',
  status: statusProp,
  disabled: disabledProp,
  className,
  style,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: OtpProps): React.ReactElement {
  const fieldProps = useOptionalFieldControlProps({
    disabled: disabledProp,
    ariaLabelledBy,
    ariaDescribedBy,
  });
  const disabled = fieldProps?.disabled ?? disabledProp ?? false;
  const status = statusProp ?? (fieldProps?.['aria-invalid'] === true ? 'error' : 'neutral');

  return (
    <Primitive.Root
      disabled={disabled}
      {...mergeStyleProps(
        themeProps('otp', { size, status, disabled }),
        stylex.props(reset.base, styles.root, rootSizes[size]),
        className,
        style,
      )}
      {...rest}
      aria-labelledby={fieldProps?.['aria-labelledby'] ?? ariaLabelledBy}
      aria-describedby={fieldProps?.['aria-describedby'] ?? ariaDescribedBy}
    >
      <OtpSlots
        size={size}
        status={status}
      />
    </Primitive.Root>
  );
}
