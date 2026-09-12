import type { OtpProps as PrimitiveOtpProps } from '@clerk/headless/otp';
import { Otp as Primitive } from '@clerk/headless/otp';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { inputStyles } from '../../utils/input.styles';
import { reset } from '../../utils/reset.styles';
import { useOptionalFieldControlProps } from '../field/field.context';
import { styles } from './otp.styles';

/** How the entered code currently reads back to the user. */
export type OtpStatus = 'neutral' | 'success' | 'error';

export interface OtpProps extends Omit<PrimitiveOtpProps, 'children' | 'length' | 'className' | 'style'> {
  /** The number of boxes in the code. @default 6 */
  length?: number;
  /** Colours every slot for the verification outcome. Defaults to the enclosing `Field`'s validity. */
  status?: OtpStatus;
}

function OtpSlots({ status }: { status: OtpStatus }) {
  const { slots, disabled } = Primitive.useOtp();

  return slots.map(slot => (
    <Primitive.Input
      key={slot.index}
      index={slot.index}
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
 * advancing as the code is typed and a pasted code spread across the boxes.
 */
export function Otp({
  length = 6,
  status: statusProp,
  disabled: disabledProp,
  required: requiredProp,
  id,
  'aria-invalid': ariaInvalidProp,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: OtpProps): React.ReactElement {
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
      {...mergeStyleProps(themeProps('otp', { status, disabled }), stylex.props(reset.base, styles.root))}
      aria-labelledby={fieldProps?.['aria-labelledby'] ?? ariaLabelledBy}
      aria-describedby={fieldProps?.['aria-describedby'] ?? ariaDescribedBy}
    >
      <OtpSlots status={status} />
    </Primitive.Root>
  );
}
