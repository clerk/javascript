import React, { useState } from 'react';

import { Eye } from '../../icons/glyphs/eye';
import { EyeSlash } from '../../icons/glyphs/eye-slash';
import type { MosaicElementProps } from '../../props';
import { themeProps } from '../../props';
import { Button } from '../button';
import { useOptionalFieldContext } from '../field/field.context';
import { Icon } from '../icon';
import { InputGroup } from '../input-group';

export interface PasswordInputProps extends Omit<MosaicElementProps<'input'>, 'type' | 'size'> {
  size?: 'sm' | 'md' | 'lg';
  /** The toggle's accessible name while the password is hidden. */
  showPasswordLabel: string;
  /** The toggle's accessible name while the password is shown. */
  hidePasswordLabel: string;
}

/**
 * A password input with a button that shows or hides what was typed. Field props, the ref and input
 * attributes such as `autoComplete` go to the input.
 *
 * @example
 * ```tsx
 * <Field.Root>
 *   <Field.Label>Password</Field.Label>
 *   <PasswordInput
 *     autoComplete='current-password'
 *     showPasswordLabel='Show password'
 *     hidePasswordLabel='Hide password'
 *   />
 * </Field.Root>
 * ```
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(function MosaicPasswordInput(
  {
    size = 'md',
    showPasswordLabel,
    hidePasswordLabel,
    xstyle,
    disabled: disabledProp,
    'aria-invalid': ariaInvalidProp,
    ...inputProps
  },
  ref,
) {
  const field = useOptionalFieldContext();
  const disabled = disabledProp ?? field?.disabled ?? false;
  const ariaInvalid = ariaInvalidProp ?? (field?.invalid ? true : undefined);
  const invalid = ariaInvalid === true || ariaInvalid === 'true';
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup.Root
      size={size}
      disabled={disabled}
      invalid={invalid}
      {...themeProps('password-input', { size, disabled, invalid, visible })}
      xstyle={xstyle}
    >
      <InputGroup.Input
        ref={ref}
        {...inputProps}
        disabled={disabledProp}
        aria-invalid={ariaInvalidProp}
        type={visible ? 'text' : 'password'}
      />
      <InputGroup.End>
        <Button
          type='button'
          {...themeProps('password-input-toggle')}
          aria-label={visible ? hidePasswordLabel : showPasswordLabel}
          onClick={() => setVisible(current => !current)}
        >
          <Icon glyph={visible ? EyeSlash : Eye} />
        </Button>
      </InputGroup.End>
    </InputGroup.Root>
  );
});
