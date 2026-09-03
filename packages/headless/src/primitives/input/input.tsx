'use client';

import React from 'react';

import { type ComponentProps, useRender } from '../../utils';

/** Props for the unstyled input primitive. */
export type InputProps = ComponentProps<'input'>;

/**
 * An unstyled native input with render-prop support and reflected state attributes.
 * Styled layers can use it for standalone fields or place it inside compound controls.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { render, disabled = false, readOnly = false, 'aria-invalid': ariaInvalid, ...otherProps },
  ref,
) {
  const invalid = ariaInvalid === true || ariaInvalid === 'true';

  return useRender({
    defaultTagName: 'input',
    render,
    ref,
    state: { disabled, invalid, readOnly },
    stateAttributesMapping: {
      disabled: value => (value ? { 'data-disabled': '' } : null),
      invalid: value => (value ? { 'data-invalid': '' } : null),
      readOnly: value => (value ? { 'data-readonly': '' } : null),
    },
    props: {
      disabled,
      readOnly,
      'aria-invalid': ariaInvalid,
      ...otherProps,
    },
  });
});
